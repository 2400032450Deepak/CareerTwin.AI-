"""
PDF text extraction using PyMuPDF (fitz).
Works with pymupdf >= 1.24.0 — both old `import fitz` and new `import pymupdf` APIs.
"""
import re
from typing import Optional

try:
    import pymupdf as fitz          # pymupdf >= 1.24.4 new-style import
except ImportError:
    import fitz                      # older pymupdf / PyMuPDF


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF given its raw bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages_text = []
    for page in doc:
        pages_text.append(page.get_text("text"))
    doc.close()
    return "\n".join(pages_text)


def clean_resume_text(text: str) -> str:
    """Normalise whitespace and strip non-printable chars from extracted text."""
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)
    text = re.sub(r"[^\x20-\x7E\n]", " ", text)
    return text.strip()


def extract_email(text: str) -> Optional[str]:
    m = re.search(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b", text)
    return m.group() if m else None


def extract_github_url(text: str) -> Optional[str]:
    m = re.search(r"github\.com/[A-Za-z0-9_-]+", text)
    return f"https://{m.group()}" if m else None


def extract_linkedin_url(text: str) -> Optional[str]:
    m = re.search(r"linkedin\.com/in/[A-Za-z0-9_-]+", text)
    return f"https://{m.group()}" if m else None
