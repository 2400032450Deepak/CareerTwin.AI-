from pydantic import BaseModel, EmailStr
from typing import Optional

class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    target_role: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    target_role: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    leetcode_username: Optional[str] = None
    college: Optional[str] = None
    graduation_year: Optional[int] = None
    experience_years: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    target_role: Optional[str]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    leetcode_username: Optional[str]
    college: Optional[str]
    graduation_year: Optional[int]
    experience_years: Optional[int]

    class Config:
        from_attributes = True
