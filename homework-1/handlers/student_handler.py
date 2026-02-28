import re
from db import execute_query


def validate_student_data(data, required=True):
    if not data:
        return False, "Body-ul cererii este gol sau invalid"

    if required:
        required_fields = ["name", "email", "age"]
        for field in required_fields:
            if field not in data:
                return False, f"Campul '{field}' este obligatoriu"

    if "name" in data:
        if not isinstance(data["name"], str) or len(data["name"].strip()) < 2:
            return False, "Numele trebuie sa fie un string de minim 2 caractere"

    if "email" in data:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data["email"]):
            return False, "Email-ul nu este valid"

    if "age" in data:
        if not isinstance(data["age"], int) or data["age"] < 16 or data["age"] > 100:
            return False, "Varsta trebuie sa fie un numar intreg intre 16 si 100"

    return True, None


def get_all_students(query_params=None):
    try:
        query = "SELECT * FROM students WHERE 1=1"
        params = []

        if query_params and "name" in query_params:
            query += " AND LOWER(name) LIKE LOWER(%s)"
            params.append(f"%{query_params['name']}%")

        if query_params and "age" in query_params:
            try:
                age = int(query_params["age"])
                query += " AND age = %s"
                params.append(age)
            except ValueError:
                return 400, {
                    "success": False,
                    "error": "Parametrul 'age' trebuie sa fie un numar intreg",
                    "code": 400
                }

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

        count_query = "SELECT COUNT(*) as total FROM students WHERE 1=1"
        count_params = []

        if query_params and "name" in query_params:
            count_query += " AND LOWER(name) LIKE LOWER(%s)"
            count_params.append(f"%{query_params['name']}%")
        if query_params and "age" in query_params:
            count_query += " AND age = %s"
            count_params.append(int(query_params["age"]))

        count_result = execute_query(count_query, count_params, fetch="one")
        total = count_result["total"]

        offset = (page - 1) * limit
        query += " ORDER BY id ASC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        students = execute_query(query, params, fetch="all")

        return 200, {
            "success": True,
            "data": students,
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
            "error": "Eroare interna la obtinerea studentilor",
            "details": str(e),
            "code": 500
        }


def get_student_by_id(student_id):
    try:
        student = execute_query(
            "SELECT * FROM students WHERE id = %s",
            (student_id,),
            fetch="one"
        )

        if not student:
            return 404, {
                "success": False,
                "error": f"Studentul cu ID-ul {student_id} nu a fost gasit",
                "code": 404
            }

        return 200, {
            "success": True,
            "data": student
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea studentului",
            "details": str(e),
            "code": 500
        }


def get_student_courses(student_id):
    try:
        student = execute_query(
            "SELECT * FROM students WHERE id = %s",
            (student_id,),
            fetch="one"
        )

        if not student:
            return 404, {
                "success": False,
                "error": f"Studentul cu ID-ul {student_id} nu a fost gasit",
                "code": 404
            }

        courses = execute_query(
            """
            SELECT
                c.id,
                c.title,
                c.description,
                c.teacher,
                c.max_students,
                e.id as enrollment_id,
                e.grade,
                e.status as enrollment_status
            FROM courses c
            JOIN enrollments e ON c.id = e.course_id
            WHERE e.student_id = %s
            ORDER BY c.title ASC
            """,
            (student_id,),
            fetch="all"
        )

        return 200, {
            "success": True,
            "data": {
                "student": student,
                "courses": courses,
                "total_courses": len(courses)
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea cursurilor studentului",
            "details": str(e),
            "code": 500
        }


def create_student(body):
    try:
        is_valid, error_message = validate_student_data(body, required=True)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        existing = execute_query(
            "SELECT id FROM students WHERE email = %s",
            (body["email"],),
            fetch="one"
        )

        if existing:
            return 409, {
                "success": False,
                "error": f"Un student cu email-ul '{body['email']}' exista deja",
                "code": 409
            }

        new_student = execute_query(
            """
            INSERT INTO students (name, email, age)
            VALUES (%s, %s, %s)
            RETURNING *
            """,
            (body["name"].strip(), body["email"].strip(), body["age"])
        )

        return 201, {
            "success": True,
            "message": "Studentul a fost creat cu succes",
            "data": new_student
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la crearea studentului",
            "details": str(e),
            "code": 500
        }


def update_student(student_id, body):
    try:
        existing = execute_query(
            "SELECT * FROM students WHERE id = %s",
            (student_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Studentul cu ID-ul {student_id} nu a fost gasit",
                "code": 404
            }

        is_valid, error_message = validate_student_data(body, required=True)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        email_conflict = execute_query(
            "SELECT id FROM students WHERE email = %s AND id != %s",
            (body["email"], student_id),
            fetch="one"
        )

        if email_conflict:
            return 409, {
                "success": False,
                "error": f"Email-ul '{body['email']}' este folosit de alt student",
                "code": 409
            }

        updated_student = execute_query(
            """
            UPDATE students
            SET name = %s, email = %s, age = %s
            WHERE id = %s
            RETURNING *
            """,
            (body["name"].strip(), body["email"].strip(), body["age"], student_id)
        )

        return 200, {
            "success": True,
            "message": "Studentul a fost actualizat cu succes",
            "data": updated_student
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la actualizarea studentului",
            "details": str(e),
            "code": 500
        }


def patch_student(student_id, body):
    try:
        existing = execute_query(
            "SELECT * FROM students WHERE id = %s",
            (student_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Studentul cu ID-ul {student_id} nu a fost gasit",
                "code": 404
            }

        is_valid, error_message = validate_student_data(body, required=False)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        if "email" in body:
            email_conflict = execute_query(
                "SELECT id FROM students WHERE email = %s AND id != %s",
                (body["email"], student_id),
                fetch="one"
            )
            if email_conflict:
                return 409, {
                    "success": False,
                    "error": f"Email-ul '{body['email']}' este folosit de alt student",
                    "code": 409
                }

        allowed_fields = ["name", "email", "age"]
        fields_to_update = {k: v for k, v in body.items() if k in allowed_fields}

        if not fields_to_update:
            return 400, {
                "success": False,
                "error": "Nu exista campuri valide de actualizat",
                "code": 400
            }

        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update.keys()])
        values = list(fields_to_update.values())
        values.append(student_id)

        updated_student = execute_query(
            f"UPDATE students SET {set_clause} WHERE id = %s RETURNING *",
            values
        )

        return 200, {
            "success": True,
            "message": "Studentul a fost actualizat partial cu succes",
            "data": updated_student
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la actualizarea partiala a studentului",
            "details": str(e),
            "code": 500
        }


def delete_student(student_id):
    try:
        existing = execute_query(
            "SELECT * FROM students WHERE id = %s",
            (student_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Studentul cu ID-ul {student_id} nu a fost gasit",
                "code": 404
            }

        enrollments_count = execute_query(
            "SELECT COUNT(*) as total FROM enrollments WHERE student_id = %s",
            (student_id,),
            fetch="one"
        )

        execute_query(
            "DELETE FROM students WHERE id = %s",
            (student_id,)
        )

        return 200, {
            "success": True,
            "message": f"Studentul '{existing['name']}' a fost sters cu succes",
            "data": {
                "deleted_student": existing,
                "deleted_enrollments": enrollments_count["total"]
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la stergerea studentului",
            "details": str(e),
            "code": 500
        }
