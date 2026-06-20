"""
AI Service — Google Gemini agents for CareerTwin AI.
Uses google-genai SDK (pip install google-genai>=0.4.0).
"""
import json
import re
import asyncio
import logging

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types as genai_types
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    logger.error("google-genai not installed.")


def _get_client():
    from app.config import settings
    if not GENAI_AVAILABLE:
        raise RuntimeError("google-genai not installed. Rebuild the container.")
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in .env")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def _extract_json(text: str) -> dict:
    """
    Robustly extract a JSON object from Gemini's response.
    Handles: markdown fences, leading/trailing text, truncated responses.
    """
    # 1. Strip markdown code fences
    text = re.sub(r"```json\s*", "", text)
    text = re.sub(r"```\s*", "", text)
    text = text.strip()

    # 2. Try direct parse first (happy path)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 3. Find the outermost { ... } block
    start = text.find("{")
    if start == -1:
        raise ValueError(f"No JSON object found in response. Got: {text[:300]}")

    # Walk forward counting braces to find the matching closing brace
    depth = 0
    end = -1
    in_string = False
    escape_next = False
    for i, ch in enumerate(text[start:], start):
        if escape_next:
            escape_next = False
            continue
        if ch == "\\" and in_string:
            escape_next = True
            continue
        if ch == '"' and not escape_next:
            in_string = not in_string
        if not in_string:
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break

    if end == -1:
        # JSON is truncated — try to close it by appending braces
        logger.warning("JSON appears truncated, attempting auto-repair…")
        candidate = text[start:]
        # Count unclosed braces and brackets
        open_braces = candidate.count("{") - candidate.count("}")
        open_brackets = candidate.count("[") - candidate.count("]")
        # Remove any trailing incomplete key/value pair
        candidate = re.sub(r',\s*"[^"]*"\s*:\s*[^,}\]]*$', "", candidate)
        candidate = re.sub(r',\s*"[^"]*"\s*$', "", candidate)
        candidate += "]" * max(open_brackets, 0)
        candidate += "}" * max(open_braces, 0)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError as e:
            raise ValueError(
                f"JSON is truncated and could not be auto-repaired: {e}. "
                f"First 300 chars: {text[:300]}"
            )

    try:
        return json.loads(text[start:end])
    except json.JSONDecodeError as e:
        raise ValueError(f"Found JSON block but failed to parse: {e}. Block: {text[start:end][:300]}")


def _call_gemini(prompt: str, max_tokens: int = 8192, max_retries: int = 3) -> dict:
    """
    Synchronous Gemini call — runs via asyncio.to_thread to avoid blocking.
    Retries automatically on transient errors (503 overloaded, 429 rate limit)
    with exponential backoff, since these are temporary Google-side issues.
    """
    import time

    client = _get_client()
    last_error = None

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=max_tokens,
                ),
            )
            text = response.text.strip()
            logger.debug("Gemini raw response (%d chars): %s…", len(text), text[:100])
            return _extract_json(text)

        except Exception as e:
            err_str = str(e)
            last_error = e
            # Transient errors worth retrying: 503 (overloaded), 429 (rate limit), 500
            is_transient = any(code in err_str for code in ["503", "429", "500", "UNAVAILABLE", "RESOURCE_EXHAUSTED"])

            if is_transient and attempt < max_retries - 1:
                wait = (2 ** attempt) * 1.5  # 1.5s, 3s, 6s
                logger.warning(
                    "Gemini transient error (attempt %d/%d), retrying in %.1fs: %s",
                    attempt + 1, max_retries, wait, err_str[:200]
                )
                time.sleep(wait)
                continue
            else:
                # Non-transient error, or out of retries — fail now
                break

    raise RuntimeError(
        f"Gemini API call failed after {max_retries} attempts: {last_error}. "
        f"Google's servers may be busy — please try again in a minute."
    ) from last_error


def test_gemini_connection() -> dict:
    client = _get_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents='Reply with exactly this JSON and nothing else: {"status": "ok", "model": "gemini-2.5-flash"}',
    )
    return _extract_json(response.text)


# ─── Agent 1: Resume Analyzer ────────────────────────────────────────────────

RESUME_AGENT_PROMPT = """You are an expert ATS Resume Analyzer.

Analyze the resume below for the target role and return ONLY a valid JSON object.
No markdown, no explanation — only the JSON.

TARGET ROLE: {target_role}

RESUME:
{resume_text}

Return this exact JSON:
{{
  "resume_score": <0-100>,
  "ats_score": <0-100>,
  "extracted_skills": ["skill1", "skill2"],
  "extracted_projects": [
    {{"name": "...", "description": "...", "technologies": ["..."], "impact": "..."}}
  ],
  "extracted_education": [
    {{"degree": "...", "institution": "...", "year": "...", "cgpa": "..."}}
  ],
  "extracted_experience": [
    {{"company": "...", "role": "...", "duration": "...", "highlights": ["..."]}}
  ],
  "extracted_certifications": ["cert1"],
  "extracted_achievements": ["achievement1"],
  "missing_keywords": ["keyword1", "keyword2"],
  "weak_bullets": ["example weak bullet"],
  "improvements": [
    {{"section": "Projects", "issue": "No metrics", "suggestion": "Add numbers like 40% faster"}}
  ],
  "project_strength_analysis": {{"overall": "moderate", "feedback": "..."}},
  "ai_summary": "2-3 sentence overall assessment."
}}"""


async def analyze_resume(resume_text: str, target_role: str) -> dict:
    prompt = RESUME_AGENT_PROMPT.format(
        resume_text=resume_text[:6000],
        target_role=target_role or "Software Engineer",
    )
    return await asyncio.to_thread(_call_gemini, prompt, 8192)


# ─── Agent 2: Employability Score ────────────────────────────────────────────

EMPLOYABILITY_PROMPT = """You are an AI Employability Intelligence Engine.

Analyze the student profile and return ONLY a valid JSON object. No markdown, no explanation.

TARGET ROLE: {target_role}

PROFILE:
{profile}

Return this exact JSON:
{{
  "employability_score": <0-100>,
  "category_scores": {{
    "technical": <0-100>,
    "projects": <0-100>,
    "experience": <0-100>,
    "dsa": <0-100>,
    "industry_relevance": <0-100>,
    "communication": <0-100>,
    "resume_quality": <0-100>
  }},
  "readiness_scores": {{
    "backend": <0-100>,
    "frontend": <0-100>,
    "cloud": <0-100>,
    "devops": <0-100>,
    "system_design": <0-100>,
    "dsa": <0-100>,
    "interview": <0-100>
  }},
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "score_reasoning": "Paragraph explaining the score.",
  "github_score": <0-100>,
  "leetcode_score": <0-100>
}}"""


async def calculate_employability(profile: dict, target_role: str) -> dict:
    prompt = EMPLOYABILITY_PROMPT.format(
        profile=json.dumps(profile, indent=2)[:5000],
        target_role=target_role,
    )
    return await asyncio.to_thread(_call_gemini, prompt, 4096)


# ─── Agent 3: Skill Gap ───────────────────────────────────────────────────────

SKILL_GAP_PROMPT = """You are an AI Skill Gap Prediction Engine for Indian tech placements.

CURRENT SKILLS: {current_skills}
TARGET ROLE: {target_role}

Return ONLY a valid JSON object. No markdown, no explanation.

{{
  "confidence_score": <0-100>,
  "overall_gap_percentage": <0-100>,
  "missing_skills": [
    {{
      "name": "Docker",
      "importance": "critical",
      "employability_boost": 8.5,
      "resources": ["https://docs.docker.com/get-started/", "Docker Mastery on Udemy"],
      "estimated_weeks": 2
    }}
  ],
  "recommended_order": ["skill1", "skill2", "skill3"]
}}"""


async def analyze_skill_gap(current_skills: list, target_role: str) -> dict:
    prompt = SKILL_GAP_PROMPT.format(
        current_skills=", ".join(current_skills) if current_skills else "None listed",
        target_role=target_role,
    )
    return await asyncio.to_thread(_call_gemini, prompt, 4096)


# ─── Agent 4: Roadmap Generator ──────────────────────────────────────────────

ROADMAP_PROMPT = """You are an AI Career Roadmap Generator for Indian tech placements.

TARGET ROLE: {target_role}
CURRENT SKILLS: {skills}
SKILLS TO LEARN: {missing_skills}
DURATION: {days} days ({weeks} weeks)

Generate exactly {task_count} tasks. Return ONLY a valid JSON object. No markdown, no explanation.

{{
  "tasks": [
    {{
      "week": 1,
      "day_range": "Day 1-7",
      "type": "skill",
      "title": "Learn Docker fundamentals",
      "description": "Complete Docker get-started guide. Build and run your first container.",
      "resource": "https://docs.docker.com/get-started/",
      "priority": "high",
      "impact": "Required by 80% of backend companies. Opens DevOps roles.",
      "estimated_hours": 10
    }}
  ]
}}

Use these types: skill, project, dsa, certification, course."""


async def generate_roadmap(
    skills: list, missing_skills: list, target_role: str, plan_type: str
) -> dict:
    days = int(plan_type.replace("_day", ""))
    weeks = days // 7
    task_count = weeks * 2
    missing_names = [
        s.get("name", s) if isinstance(s, dict) else str(s)
        for s in missing_skills[:8]
    ]
    prompt = ROADMAP_PROMPT.format(
        skills=", ".join(skills[:15]) if skills else "None listed",
        missing_skills=", ".join(missing_names) if missing_names else "General software skills",
        target_role=target_role,
        days=days,
        weeks=weeks,
        task_count=task_count,
    )
    return await asyncio.to_thread(_call_gemini, prompt, 8192)


# ─── Agent 5: Career Simulation ──────────────────────────────────────────────

SIMULATION_PROMPT = """You are an AI Career Simulation Engine.

CURRENT SCORE: {current_score}/100
TARGET ROLE: {target_role}
CURRENT SKILLS: {skills}
SCENARIO: "{scenario}"

Return ONLY a valid JSON object. No markdown, no explanation.

{{
  "projected_score": <0-100>,
  "improvement": <positive number>,
  "timeline_weeks": <integer>,
  "reasoning": "Why this improvement happens.",
  "key_actions": ["action1", "action2", "action3"],
  "milestones": [
    {{"week": 2, "milestone": "Milestone description", "expected_score": <number>}},
    {{"week": 5, "milestone": "Milestone description", "expected_score": <number>}},
    {{"week": 8, "milestone": "Milestone description", "expected_score": <number>}}
  ]
}}"""


async def simulate_career(
    skills: list, current_score: float, target_role: str, scenario: str
) -> dict:
    prompt = SIMULATION_PROMPT.format(
        skills=", ".join(skills[:15]) if skills else "None listed",
        current_score=round(current_score, 1),
        target_role=target_role,
        scenario=scenario,
    )
    return await asyncio.to_thread(_call_gemini, prompt, 4096)


# ─── Agent 6: Company Matcher ─────────────────────────────────────────────────

COMPANY_MATCH_PROMPT = """You are an AI Company Matching Engine for Indian tech placements.

COMPANY: {company}
TARGET ROLE: {target_role}
STUDENT SKILLS: {skills}
STUDENT PROJECTS: {projects}
EXPERIENCE: {experience_years} years

Return ONLY a valid JSON object. No markdown, no explanation.

{{
  "compatibility_score": <0-100>,
  "matching_skills": ["skill1", "skill2"],
  "missing_skills": ["skill1", "skill2"],
  "weak_areas": ["area1", "area2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "reasoning": "Explanation of the compatibility score.",
  "interview_tips": ["tip1", "tip2", "tip3"]
}}"""


async def match_company(
    skills: list,
    projects: list,
    experience_years: int,
    target_role: str,
    company: str,
) -> dict:
    project_names = [
        p.get("name", "") if isinstance(p, dict) else str(p) for p in projects[:5]
    ]
    prompt = COMPANY_MATCH_PROMPT.format(
        skills=", ".join(skills[:15]) if skills else "None listed",
        projects=", ".join(project_names) if project_names else "None listed",
        experience_years=experience_years,
        target_role=target_role,
        company=company,
    )
    return await asyncio.to_thread(_call_gemini, prompt, 4096)
