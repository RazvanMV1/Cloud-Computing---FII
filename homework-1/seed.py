import urllib.request
import urllib.error
import json
import random

BASE_URL = "http://localhost:8000"

def post(endpoint, data):
    url = f"{BASE_URL}{endpoint}"
    body = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=body,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result.get('data', {})
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        print(f"  ⚠️  {endpoint} -> {e.code}: {body}")
        return None

# ============================================================
# CURSURI
# ============================================================
print("\n📚 Creez cursuri...")

courses_data = [
    {"title": "Machine Learning", "description": "Introducere in machine learning si algoritmi de invatare automata", "teacher": "Prof. Ionescu Alexandru", "max_students": 30},
    {"title": "Cloud Computing", "description": "Arhitecturi cloud, AWS, Azure si Google Cloud Platform", "teacher": "Prof. Popescu Maria", "max_students": 25},
    {"title": "Web Development", "description": "Dezvoltare web moderna cu React, Node.js si REST APIs", "teacher": "Prof. Gheorghe Andrei", "max_students": 35},
    {"title": "Data Science", "description": "Analiza datelor, vizualizare si statistici avansate", "teacher": "Prof. Constantin Elena", "max_students": 28},
    {"title": "Cybersecurity", "description": "Securitate informatica, criptografie si protectia datelor", "teacher": "Prof. Dumitrescu Mihai", "max_students": 20},
    {"title": "Artificial Intelligence", "description": "Fundamentele inteligentei artificiale si retele neuronale", "teacher": "Prof. Ionescu Alexandru", "max_students": 30},
    {"title": "Database Systems", "description": "Baze de date relationale si NoSQL, optimizare query-uri", "teacher": "Prof. Stanescu Ana", "max_students": 40},
    {"title": "Operating Systems", "description": "Sisteme de operare, procese, memorie si fisiere", "teacher": "Prof. Marin Cristian", "max_students": 45},
    {"title": "Computer Networks", "description": "Retele de calculatoare, protocoale TCP/IP si securitate", "teacher": "Prof. Popa Ioana", "max_students": 35},
    {"title": "Software Engineering", "description": "Ingineria software, design patterns si metodologii agile", "teacher": "Prof. Radu Bogdan", "max_students": 30},
]

created_courses = []
for course in courses_data:
    result = post("/courses", course)
    if result:
        created_courses.append(result)
        print(f"  ✅ Curs creat: {course['title']} (id: {result.get('id')})")
    else:
        print(f"  ❌ Eroare la crearea cursului: {course['title']}")

# ============================================================
# STUDENTI
# ============================================================
print("\n👨‍🎓 Creez studenti...")

students_data = [
    {"name": "Alexandru Ionescu", "email": "alex.ionescu@uni.ro", "age": 20},
    {"name": "Maria Popescu", "email": "maria.popescu@uni.ro", "age": 21},
    {"name": "Andrei Gheorghe", "email": "andrei.gheorghe@uni.ro", "age": 19},
    {"name": "Elena Constantin", "email": "elena.constantin@uni.ro", "age": 22},
    {"name": "Mihai Dumitrescu", "email": "mihai.dumitrescu@uni.ro", "age": 20},
    {"name": "Ana Stanescu", "email": "ana.stanescu@uni.ro", "age": 21},
    {"name": "Cristian Marin", "email": "cristian.marin@uni.ro", "age": 23},
    {"name": "Ioana Popa", "email": "ioana.popa@uni.ro", "age": 20},
    {"name": "Bogdan Radu", "email": "bogdan.radu@uni.ro", "age": 22},
    {"name": "Denisa Florea", "email": "denisa.florea@uni.ro", "age": 19},
    {"name": "Razvan Dima", "email": "razvan.dima@uni.ro", "age": 21},
    {"name": "Gabriela Nitu", "email": "gabriela.nitu@uni.ro", "age": 20},
    {"name": "Sergiu Oprea", "email": "sergiu.oprea@uni.ro", "age": 22},
    {"name": "Teodora Luca", "email": "teodora.luca@uni.ro", "age": 19},
    {"name": "Flavius Mocanu", "email": "flavius.mocanu@uni.ro", "age": 23},
    {"name": "Simona Draghici", "email": "simona.draghici@uni.ro", "age": 21},
    {"name": "Catalin Voicu", "email": "catalin.voicu@uni.ro", "age": 20},
    {"name": "Laura Badea", "email": "laura.badea@uni.ro", "age": 22},
    {"name": "Octavian Rus", "email": "octavian.rus@uni.ro", "age": 24},
    {"name": "Andreea Stan", "email": "andreea.stan@uni.ro", "age": 20},
    {"name": "Ionut Barbu", "email": "ionut.barbu@uni.ro", "age": 21},
    {"name": "Roxana Neagu", "email": "roxana.neagu@uni.ro", "age": 19},
    {"name": "Daniel Chirila", "email": "daniel.chirila@uni.ro", "age": 22},
    {"name": "Alina Matei", "email": "alina.matei@uni.ro", "age": 20},
    {"name": "Stefan Dobre", "email": "stefan.dobre@uni.ro", "age": 23},
]

created_students = []
for student in students_data:
    result = post("/students", student)
    if result:
        created_students.append(result)
        print(f"  ✅ Student creat: {student['name']} (id: {result.get('id')})")
    else:
        print(f"  ❌ Eroare la crearea studentului: {student['name']}")

# ============================================================
# INSCRIERI
# ============================================================
print("\n📝 Creez inscrieri...")

if not created_students or not created_courses:
    print("  ❌ Nu exista studenti sau cursuri pentru inscrieri!")
else:
    statuses = ["enrolled", "completed", "dropped"]
    grades = [None, 5.0, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0]

    enrollment_count = 0
    enrolled_pairs = set()

    for student in created_students:
        student_id = student.get('id')
        if not student_id:
            continue

        # fiecare student se inscrie la 2-4 cursuri random
        num_courses = random.randint(2, 4)
        available_courses = created_courses.copy()
        random.shuffle(available_courses)
        selected_courses = available_courses[:num_courses]

        for course in selected_courses:
            course_id = course.get('id')
            if not course_id:
                continue

            pair = (student_id, course_id)
            if pair in enrolled_pairs:
                continue
            enrolled_pairs.add(pair)

            status = random.choice(statuses)

            enrollment_data = {
                "student_id": student_id,
                "course_id": course_id
            }

            result = post("/enrollments", enrollment_data)
            if result:
                enrollment_id = result.get('id')

                # daca statusul nu e enrolled sau are nota, facem PUT
                if status != "enrolled" or (status == "completed"):
                    grade = random.choice([g for g in grades if g is not None]) if status == "completed" else random.choice(grades)
                    update_data = {"status": status}
                    if grade is not None:
                        update_data["grade"] = grade

                    update_url = f"{BASE_URL}/enrollments/{enrollment_id}"
                    update_body = json.dumps(update_data).encode('utf-8')
                    update_req = urllib.request.Request(
                        update_url,
                        data=update_body,
                        headers={'Content-Type': 'application/json'},
                        method='PUT'
                    )
                    try:
                        with urllib.request.urlopen(update_req) as resp:
                            pass
                    except urllib.error.HTTPError as e:
                        print(f"  ⚠️  PUT enrollment/{enrollment_id} -> {e.code}")

                enrollment_count += 1
                print(f"  ✅ Inscris student {student_id} la curs {course_id} [{status}]")

    print(f"\n  📊 Total inscrieri create: {enrollment_count}")

# ============================================================
# SUMAR
# ============================================================
print("\n" + "="*50)
print("✅ SEED COMPLET!")
print(f"  👨‍🎓 Studenti creati: {len(created_students)}")
print(f"  📚 Cursuri create: {len(created_courses)}")
print("="*50)
