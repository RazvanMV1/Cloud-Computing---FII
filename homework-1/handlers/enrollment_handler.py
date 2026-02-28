from db import execute_query


def validate_enrollment_data(data, required=True):
    if not data:
        return False, "Body-ul cererii este gol sau invalid"

    if required:
        required_fields = ["student_id", "course_id"]
        for field in required_fields:
            if field not in data:
                return False, f"Campul '{field}' este obligatoriu"

    if "student_id" in data:
        if not isinstance(data["student_id"], int) or data["student_id"] < 1:
            return False, "student_id trebuie sa fie un numar intreg pozitiv"

    if "course_id" in data:
        if not isinstance(data["course_id"], int) or data["course_id"] < 1:
            return False, "course_id trebuie sa fie un numar intreg pozitiv"

    if "grade" in data and data["grade"] is not None:
        try:
            grade = float(data["grade"])
            if grade < 1 or grade > 10:
                return False, "Nota trebuie sa fie un numar intre 1 si 10"
        except (TypeError, ValueError):
            return False, "Nota trebuie sa fie un numar valid"

    if "status" in data:
        allowed_statuses = ["enrolled", "completed", "dropped"]
        if data["status"] not in allowed_statuses:
            return False, f"Status-ul trebuie sa fie unul dintre: {', '.join(allowed_statuses)}"

    return True, None


def get_all_enrollments(query_params=None):
    try:
        query = """
            SELECT
                e.id,
                e.student_id,
                s.name as student_name,
                s.email as student_email,
                e.course_id,
                c.title as course_title,
                c.teacher as course_teacher,
                e.grade,
                e.status
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE 1=1
        """
        params = []

        if query_params and "student_id" in query_params:
            try:
                student_id = int(query_params["student_id"])
                query += " AND e.student_id = %s"
                params.append(student_id)
            except ValueError:
                return 400, {
                    "success": False,
                    "error": "Parametrul 'student_id' trebuie sa fie un numar intreg",
                    "code": 400
                }

        if query_params and "course_id" in query_params:
            try:
                course_id = int(query_params["course_id"])
                query += " AND e.course_id = %s"
                params.append(course_id)
            except ValueError:
                return 400, {
                    "success": False,
                    "error": "Parametrul 'course_id' trebuie sa fie un numar intreg",
                    "code": 400
                }

        if query_params and "status" in query_params:
            allowed_statuses = ["enrolled", "completed", "dropped"]
            if query_params["status"] not in allowed_statuses:
                return 400, {
                    "success": False,
                    "error": f"Status-ul trebuie sa fie unul dintre: {', '.join(allowed_statuses)}",
                    "code": 400
                }
            query += " AND e.status = %s"
            params.append(query_params["status"])

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

        count_query = "SELECT COUNT(*) as total FROM enrollments e WHERE 1=1"
        count_params = []

        if query_params and "student_id" in query_params:
            count_query += " AND e.student_id = %s"
            count_params.append(int(query_params["student_id"]))
        if query_params and "course_id" in query_params:
            count_query += " AND e.course_id = %s"
            count_params.append(int(query_params["course_id"]))
        if query_params and "status" in query_params:
            count_query += " AND e.status = %s"
            count_params.append(query_params["status"])

        count_result = execute_query(count_query, count_params, fetch="one")
        total = count_result["total"]

        offset = (page - 1) * limit
        query += " ORDER BY e.id ASC LIMIT %s OFFSET %s"
        params.extend([limit, offset])

        enrollments = execute_query(query, params, fetch="all")

        return 200, {
            "success": True,
            "data": enrollments,
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
            "error": "Eroare interna la obtinerea inscrierilor",
            "details": str(e),
            "code": 500
        }


def get_enrollment_by_id(enrollment_id):
    try:
        enrollment = execute_query(
            """
            SELECT
                e.id,
                e.student_id,
                s.name as student_name,
                s.email as student_email,
                e.course_id,
                c.title as course_title,
                c.teacher as course_teacher,
                e.grade,
                e.status
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = %s
            """,
            (enrollment_id,),
            fetch="one"
        )

        if not enrollment:
            return 404, {
                "success": False,
                "error": f"Inscrierea cu ID-ul {enrollment_id} nu a fost gasita",
                "code": 404
            }

        return 200, {
            "success": True,
            "data": enrollment
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la obtinerea inscrierii",
            "details": str(e),
            "code": 500
        }


def create_enrollment(body):
    try:
        is_valid, error_message = validate_enrollment_data(body, required=True)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        student_id = body["student_id"]
        course_id = body["course_id"]

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

        existing_enrollment = execute_query(
            "SELECT id FROM enrollments WHERE student_id = %s AND course_id = %s",
            (student_id, course_id),
            fetch="one"
        )
        if existing_enrollment:
            return 409, {
                "success": False,
                "error": f"Studentul '{student['name']}' este deja inscris la cursul '{course['title']}'",
                "code": 409
            }

        enrolled_count = execute_query(
            "SELECT COUNT(*) as total FROM enrollments WHERE course_id = %s",
            (course_id,),
            fetch="one"
        )
        if enrolled_count["total"] >= course["max_students"]:
            return 400, {
                "success": False,
                "error": f"Cursul '{course['title']}' este plin ({course['max_students']}/{course['max_students']} locuri ocupate)",
                "code": 400
            }

        new_enrollment = execute_query(
            """
            INSERT INTO enrollments (student_id, course_id, grade, status)
            VALUES (%s, %s, %s, %s)
            RETURNING *
            """,
            (
                student_id,
                course_id,
                body.get("grade", None),
                body.get("status", "enrolled")
            )
        )

        return 201, {
            "success": True,
            "message": f"Studentul '{student['name']}' a fost inscris cu succes la cursul '{course['title']}'",
            "data": {
                "enrollment": new_enrollment,
                "student": student,
                "course": course
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la crearea inscrierii",
            "details": str(e),
            "code": 500
        }


def update_enrollment(enrollment_id, body):
    try:
        existing = execute_query(
            "SELECT * FROM enrollments WHERE id = %s",
            (enrollment_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Inscrierea cu ID-ul {enrollment_id} nu a fost gasita",
                "code": 404
            }

        is_valid, error_message = validate_enrollment_data(body, required=False)
        if not is_valid:
            return 400, {
                "success": False,
                "error": error_message,
                "code": 400
            }

        if "grade" not in body and "status" not in body:
            return 400, {
                "success": False,
                "error": "Trebuie sa trimiti cel putin 'grade' sau 'status' pentru actualizare",
                "code": 400
            }

        allowed_fields = ["grade", "status"]
        fields_to_update = {k: v for k, v in body.items() if k in allowed_fields}

        set_clause = ", ".join([f"{field} = %s" for field in fields_to_update.keys()])
        values = list(fields_to_update.values())
        values.append(enrollment_id)

        execute_query(
            f"UPDATE enrollments SET {set_clause} WHERE id = %s RETURNING *",
            values
        )

        full_enrollment = execute_query(
            """
            SELECT
                e.id,
                e.student_id,
                s.name as student_name,
                e.course_id,
                c.title as course_title,
                e.grade,
                e.status
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = %s
            """,
            (enrollment_id,),
            fetch="one"
        )

        return 200, {
            "success": True,
            "message": "Inscrierea a fost actualizata cu succes",
            "data": full_enrollment
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la actualizarea inscrierii",
            "details": str(e),
            "code": 500
        }


def delete_enrollment(enrollment_id):
    try:
        existing = execute_query(
            """
            SELECT
                e.id,
                e.student_id,
                s.name as student_name,
                e.course_id,
                c.title as course_title,
                e.grade,
                e.status
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = %s
            """,
            (enrollment_id,),
            fetch="one"
        )

        if not existing:
            return 404, {
                "success": False,
                "error": f"Inscrierea cu ID-ul {enrollment_id} nu a fost gasita",
                "code": 404
            }

        execute_query(
            "DELETE FROM enrollments WHERE id = %s",
            (enrollment_id,)
        )

        return 200, {
            "success": True,
            "message": f"Inscrierea studentului '{existing['student_name']}' la cursul '{existing['course_title']}' a fost stearsa cu succes",
            "data": {
                "deleted_enrollment": existing
            }
        }

    except Exception as e:
        return 500, {
            "success": False,
            "error": "Eroare interna la stergerea inscrierii",
            "details": str(e),
            "code": 500
        }
