import re
from db import execute_query


def validate_course_data(data, required=True):
    if not data:
        return False, "Body-ul cererii este gol sau invalid"

    if required:
        required_fields = ["title", "teacher", "max_students"]
        for field in required_fields:
            if field not in data:
                return False, f"Campul '{field}' este obligatoriu"

    if "title" in data:
        if not isinstance(data["title"], str) or len(data["title"].strip()) < 2:
            return False, "Titlul trebuie sa fie un string de minim 2 caractere"

    if "teacher" in data:
        if not isinstance(data["teacher"], str) or len(data["teacher"].strip()) < 2:
            return False, "Numele profesorului trebuie sa fie un string de minim 2 caractere"

    if "max_students" in data:
        if not isinstance(data["max_students"], int) or data["max_students"] < 1:
            return False, "max_students trebuie sa fie un numar intreg pozitiv"

    if "description" in data:
        if data["description"] is not None and not isinstance(data["description"], str):
            return False, "Descrierea trebuie sa fie un string"

    return True, None


def get_all_courses(query_params=None):
    try:
        query = "SELECT * FROM courses WHERE 1=1"
        params = []

        if query_params and "title" in query_params:
            query += " AND LOWER(title) LIKE LOWER(%s)"
            params.append(f"%{query_params['title']}%")

        if query_params and "teacher" in query_params:
            query += " AND LOWER(teacher) LIKE LOWER(%s)"
            params.append(f"%{query_params['teacher']}%")

        page = 1
        limit = 10
        if query_params:
            try:
                if "page" in query_params:
                    page = int(query_params["page"])
                if "limit" in query_params:
                    limit = int(query_params["limit"])
            except ValueError:
                return 400, {
                    "success": False,
                    "error": "Parametrii 'page' si 'limit' trebuie sa fie numere intregi",
                    "code": 400
                }

        count_query = "SELECT COUNT(*) as total FROM courses WHERE 1=1"
        count_params = []

        if query_params and "title" in query_params:
            count_query += " AND LOWER(title) LIKE LOWER(%s)"
            count_params.append(f"%{query_params['title']}%")
        if query_params and "teacher" in query_params:
            count_query += " AND LOWER(teacher) LIKE LOWER(%s)"
            count_params.append(f"%{query_params['teacher']}%")

        count_result = execute_query(count_query, count_params, fetch="one")
        total = count_result["total"]

        offset = (page - 1) * limit
        query += " ORDER BY id ASC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        courses = execute_query(query, params, fetch="all")

        for course in courses:
            enrolled_count = execute_query(
                "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
                (course["id"],),
                fetch="one"
            )
            course["enrolled_students"] = enrolled_count["total"]
            course["available_spots"] = course["max_students"] - enrolled_count["total"]

        return 200, {
            "success": True,
            "data": courses,
            "pagination": {
                "total": total,
                "page": page,
                "limit": limit,
                "pages": (total + limit - 1) // limit
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea cursurilor",
            "details": str(e),
            "code": 500
        }


def get_course_by_id(course_id):
    try:
        course = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not course:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        enrolled_count = execute_query(
            "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
            (course_id,),
            fetch="one"
        )
        course["enrolled_students"] = enrolled_count["total"]
        course["available_spots"] = course["max_students"] - enrolled_count["total"]

        return 200, {
            "success": True,
            "data": course
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea cursului",
            "details": str(e),
            "code": 500
        }


def get_course_students(course_id):
    try:
        course = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not course:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        students = execute_query(
            """
            SELECT
                s.id,
                s.name,
                s.email,
                s.age,
                e.id as enrollment_id,
                e.grade,
                e.status as enrollment_status
            FROM students s
            JOIN enrollments e ON s.id = e.student_id
            WHERE e.course_id = %s
            ORDER BY s.name ASC
            """,
            (course_id,),
            fetch="all"
        )

        return 200, {
            "success": True,
            "data": {
                "course": course,
                "students": students,
                "total_students": len(students)
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea studentilor cursului",
            "details": str(e),
            "code": 500
        }


def get_course_average_grade(course_id):
    try:
        course = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not course:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        stats = execute_query(
            """
            SELECT
                COUNT(*) as total_enrolled,
                COUNT(grade) as total_graded,
                ROUND(AVG(grade), 2) as average_grade,
                MIN(grade) as min_grade,
                MAX(grade) as max_grade
            FROM enrollments
            WHERE course_id = %s
            """,
            (course_id,),
            fetch="one"
        )

        return 200, {
            "success": True,
            "data": {
                "course_id": course_id,
                "course_title": course["title"],
                "teacher": course["teacher"],
                "statistics": {
                    "total_enrolled": stats["total_enrolled"],
                    "total_graded": stats["total_graded"],
                    "average_grade": float(stats["average_grade"]) if stats["average_grade"] else None,
                    "min_grade": float(stats["min_grade"]) if stats["min_grade"] else None,
                    "max_grade": float(stats["max_grade"]) if stats["max_grade"] else None
                }
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la calcularea mediei cursului",
            "details": str(e),
            "code": 500
        }


def create_course(body):
    try:
        is_valid, error_message = validate_course_data(body, required=True)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        existing = execute_query(
            "SELECT id FROM courses WHERE LOWER(title) = LOWER(%s) AND LOWER(teacher) = LOWER(%s)",
            (body["title"], body["teacher"]),
            fetch="one"
        )

        if existing:
            return 409, {
                "success": False,
                "error": f"Un curs cu titlul '{body['title']}' predat de '{body['teacher']}' exista deja",
                "code": 409
            }

        new_course = execute_query(
            """
            INSERT INTO courses (title, description, teacher, max_students)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (
                body["title"].strip(),
                body.get("description", None),
                body["teacher"].strip(),
                body["max_students"]
            )
        )

        return 201, {
            "success": True,
            "message": "Cursul a fost creat cu succes",
            "data": new_course
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la crearea cursului",
            "details": str(e),
            "code": 500
        }


def update_course(course_id, body):
    try:
        existing = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        is_valid, error_message = validate_course_data(body, required=True)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        conflict = execute_query(
            """
            SELECT id FROM courses 
            WHERE LOWER(title) = LOWER(%s) 
            AND LOWER(teacher) = LOWER(%s) 
            AND id != %s
            """,
            (body["title"], body["teacher"], course_id),
            fetch="one"
        )

        if conflict:
            return 409, {
                "success": False,
                "error": f"Un alt curs cu titlul '{body['title']}' predat de '{body['teacher']}' exista deja",
                "code": 409
            }

        enrolled_count = execute_query(
            "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
            (course_id,),
            fetch="one"
        )

        if body["max_students"] < enrolled_count["total"]:
            return 400, {
                "success": False,
                "error": f"max_students ({body['max_students']}) nu poate fi mai mic decat numarul de studenti deja inscris ({enrolled_count['total']})",
                "code": 400
            }

        updated_course = execute_query(
            """
            UPDATE courses
            SET title = %s, description = %s, teacher = %s, max_students = %s
            WHERE id = %s
            RETURNING *
            """,
            (
                body["title"].strip(),
                body.get("description", None),
                body["teacher"].strip(),
                body["max_students"],
                course_id
            )
        )

        return 200, {
            "success": True,
            "message": "Cursul a fost actualizat cu succes",
            "data": updated_course
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la actualizarea cursului",
            "details": str(e),
            "code": 500
        }


def patch_course(course_id, body):
    try:
        existing = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        is_valid, error_message = validate_course_data(body, required=False)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        if "max_students" in body:
            enrolled_count = execute_query(
                "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
                (course_id,),
                fetch="one"
            )
            if body["max_students"] < enrolled_count["total"]:
                return 400, {
                    "success": False,
                    "error": f"max_students ({body['max_students']}) nu poate fi mai mic decat numarul de studenti deja inscris ({enrolled_count['total']})",
                    "code": 400
                }

        allowed_fields = ["title", "description", "teacher", "max_students"]
        fields_to_update = {k: v for k, v in body.items() if k in allowed_fields}

        if not fields_to_update:
            return 400, {
                "success": False,
                "error": "Nu exista campuri valide de actualizat",
                "code": 400
            }

        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update.keys()])
        values = list(fields_to_update.values())
        values.append(course_id)

        updated_course = execute_query(
            f"UPDATE courses SET {set_clause} WHERE id = %s RETURNING *",
            values
        )

        return 200, {
            "success": True,
            "message": "Cursul a fost actualizat partial cu succes",
            "data": updated_course
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la actualizarea partiala a cursului",
            "details": str(e),
            "code": 500
        }


def delete_course(course_id):
    try:
        existing = execute_query(
            "SELECT * FROM courses WHERE id = %s",
            (course_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Cursul cu ID-ul {course_id} nu a fost gasit",
                "code": 404
            }

        enrollments_count = execute_query(
            "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
            (course_id,),
            fetch="one"
        )

        execute_query(
            "DELETE FROM courses WHERE id = %s",
            (course_id,)
        )

        return 200, {
            "success": True,
            "message": f"Cursul '{existing['title']}' a fost sters cu succes",
            "data": {
                "deleted_course": existing,
                "deleted_enrollments": enrollments_count["total"]
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la stergerea cursului",
            "details": str(e),
            "code": 500
        }
