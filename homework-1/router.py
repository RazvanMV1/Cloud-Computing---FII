import re
from handlers.student_handler import (
    get_all_students,
    get_student_by_id,
    get_student_courses,
    create_student,
    update_student,
    patch_student,
    delete_student
)
from handlers.course_handler import (
    get_all_courses,
    get_course_by_id,
    get_course_students,
    get_course_average_grade,
    create_course,
    update_course,
    patch_course,
    delete_course
)
from handlers.enrollment_handler import (
    get_all_enrollments,
    get_enrollment_by_id,
    create_enrollment,
    update_enrollment,
    delete_enrollment
)

def route_request(method, path, body):
    clean_path = path.split("?")[0].rstrip("/")
    query_string = path.split("?")[1] if "?" in path else ""
    query_params = parse_query_params(query_string)

    if method == "GET" and clean_path == "/students":
        return get_all_students(query_params)

    if method == "POST" and clean_path == "/students":
        return create_student(body)

    if method == "DELETE" and clean_path == "/students":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti sterge toti studentii", "code": 405}

    if method == "PUT" and clean_path == "/students":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti actualiza toti studentii", "code": 405}

    match = re.fullmatch(r"/students/(\d+)", clean_path)
    if match:
        student_id = int(match.group(1))
        if method == "GET":
            return get_student_by_id(student_id)
        if method == "PUT":
            return update_student(student_id, body)
        if method == "PATCH":
            return patch_student(student_id, body)
        if method == "DELETE":
            return delete_student(student_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    match = re.fullmatch(r"/students/(\d+)/courses", clean_path)
    if match:
        student_id = int(match.group(1))
        if method == "GET":
            return get_student_courses(student_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    if method == "GET" and clean_path == "/courses":
        return get_all_courses(query_params)

    if method == "POST" and clean_path == "/courses":
        return create_course(body)

    if method == "DELETE" and clean_path == "/courses":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti sterge toate cursurile", "code": 405}

    if method == "PUT" and clean_path == "/courses":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti actualiza toate cursurile", "code": 405}

    match = re.fullmatch(r"/courses/(\d+)", clean_path)
    if match:
        course_id = int(match.group(1))
        if method == "GET":
            return get_course_by_id(course_id)
        if method == "PUT":
            return update_course(course_id, body)
        if method == "PATCH":
            return patch_course(course_id, body)
        if method == "DELETE":
            return delete_course(course_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    match = re.fullmatch(r"/courses/(\d+)/students", clean_path)
    if match:
        course_id = int(match.group(1))
        if method == "GET":
            return get_course_students(course_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    match = re.fullmatch(r"/courses/(\d+)/average", clean_path)
    if match:
        course_id = int(match.group(1))
        if method == "GET":
            return get_course_average_grade(course_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    if method == "GET" and clean_path == "/enrollments":
        return get_all_enrollments(query_params)

    if method == "POST" and clean_path == "/enrollments":
        return create_enrollment(body)

    if method == "DELETE" and clean_path == "/enrollments":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti sterge toate inscrierile", "code": 405}

    if method == "PUT" and clean_path == "/enrollments":
        return 405, {"success": False, "error": "Method Not Allowed - Nu poti actualiza toate inscrierile", "code": 405}

    match = re.fullmatch(r"/enrollments/(\d+)", clean_path)
    if match:
        enrollment_id = int(match.group(1))
        if method == "GET":
            return get_enrollment_by_id(enrollment_id)
        if method == "PUT":
            return update_enrollment(enrollment_id, body)
        if method == "DELETE":
            return delete_enrollment(enrollment_id)
        return 405, {"success": False, "error": "Method Not Allowed", "code": 405}

    return 404, {"success": False, "error": f"Route '{path}' not found", "code": 404}


def parse_query_params(query_string):
    params = {}
    if not query_string:
        return params
    for param in query_string.split("&"):
        if "=" in param:
            key, value = param.split("=", 1)
            params[key.strip()] = value.strip()
    return params
