import httpx
from config import config

BASE_URL = config.UNIVERSITY_API_URL


async def get_students(name: str = None, age: int = None, page: int = 1, limit: int = 10):
    params = {"page": page, "limit": limit}
    if name:
        params["name"] = name
    if age:
        params["age"] = age

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/students", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_student_by_id(student_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/students/{student_id}", timeout=10)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_student_courses(student_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/students/{student_id}/courses", timeout=10)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_courses(title: str = None, teacher: str = None, page: int = 1, limit: int = 10):
    params = {"page": page, "limit": limit}
    if title:
        params["title"] = title
    if teacher:
        params["teacher"] = teacher

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/courses", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_course_by_id(course_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/courses/{course_id}", timeout=10)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_course_average(course_id: int):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/courses/{course_id}/average", timeout=10)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")


async def get_enrollments(student_id: int = None, course_id: int = None,
                          status: str = None, page: int = 1, limit: int = 10):
    params = {"page": page, "limit": limit}
    if student_id:
        params["student_id"] = student_id
    if course_id:
        params["course_id"] = course_id
    if status:
        params["status"] = status

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/enrollments", params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException:
            raise Exception("University API timeout - serverul nu raspunde")
        except httpx.HTTPStatusError as e:
            raise Exception(f"University API error: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"University API nu este accesibil: {str(e)}")
