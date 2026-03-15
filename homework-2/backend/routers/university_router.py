from fastapi import APIRouter, Query, HTTPException
from services import university_service

router = APIRouter(prefix="/university", tags=["University"])


@router.get("/students")
async def get_students(
    name: str = Query(None),
    age: int = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        result = await university_service.get_students(name, age, page, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/{student_id}")
async def get_student(student_id: int):
    try:
        result = await university_service.get_student_by_id(student_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Studentul cu id {student_id} nu a fost gasit")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/students/{student_id}/courses")
async def get_student_courses(student_id: int):
    try:
        result = await university_service.get_student_courses(student_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Studentul cu id {student_id} nu a fost gasit")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses")
async def get_courses(
    title: str = Query(None),
    teacher: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        result = await university_service.get_courses(title, teacher, page, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses/{course_id}")
async def get_course(course_id: int):
    try:
        result = await university_service.get_course_by_id(course_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Cursul cu id {course_id} nu a fost gasit")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/courses/{course_id}/average")
async def get_course_average(course_id: int):
    try:
        result = await university_service.get_course_average(course_id)
        if result is None:
            raise HTTPException(status_code=404, detail=f"Cursul cu id {course_id} nu a fost gasit")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/enrollments-by-status")
async def get_enrollments_by_status():
    try:
        enrolled = await university_service.get_enrollments(status="enrolled", limit=100)
        completed = await university_service.get_enrollments(status="completed", limit=100)
        dropped = await university_service.get_enrollments(status="dropped", limit=100)

        return {
            "data": [
                {"status": "Inscrisi", "value": enrolled.get("pagination", {}).get("total", 0), "color": "#4361ee"},
                {"status": "Finalizati", "value": completed.get("pagination", {}).get("total", 0), "color": "#28a745"},
                {"status": "Retrasi", "value": dropped.get("pagination", {}).get("total", 0), "color": "#dc3545"}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/students-per-course")
async def get_students_per_course():
    try:
        courses = await university_service.get_courses(limit=100)
        courses_list = courses.get("data", [])

        result = []
        for course in courses_list[:8]:
            result.append({
                "name": course["title"][:15] + "..." if len(course["title"]) > 15 else course["title"],
                "full_name": course["title"],
                "enrolled": course.get("enrolled_students", 0),
                "max": course.get("max_students", 0)
            })

        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/enrollments")
async def get_enrollments(
    student_id: int = Query(None),
    course_id: int = Query(None),
    status: str = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        result = await university_service.get_enrollments(student_id, course_id, status, page, limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
