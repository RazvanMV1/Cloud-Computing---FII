# University RESTful API

O aplicatie RESTful API pentru managementul unui sistem universitar, implementata in Python fara framework-uri, cu PostgreSQL ca baza de date si Docker pentru containerizare.

---

## Tehnologii folosite

- **Python 3.11** - limbajul de programare
- **PostgreSQL 15** - baza de date relationala
- **Docker & Docker Compose** - containerizare
- **psycopg2** - driver Python pentru PostgreSQL
- **Postman** - testarea API-ului

---

## Structura proiectului

```
university-api/
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── init.sql
├── README.md
├── server.py
├── router.py
├── db.py
├── postman_collection.json
└── handlers/
    ├── __init__.py
    ├── student_handler.py
    ├── course_handler.py
    └── enrollment_handler.py
```

---

## Cum rulezi proiectul

### Prerequisite

- Docker Desktop instalat si pornit

### Pasii de rulare

**1. Cloneaza repository-ul:**

```bash
git clone <url-repository>
cd university-api
```

**2. Porneste containerele:**

```bash
docker-compose up --build -d
```

**3. Verifica ca totul ruleaza:**

```bash
docker ps
```

**4. Serverul este disponibil la:**

```
http://localhost:8000
```

**5. Pentru a opri aplicatia:**

```bash
docker-compose down
```

**6. Pentru a reseta complet baza de date:**

```bash
docker-compose down -v
docker-compose up --build -d
```

---

## Modele de date

### Student

| Camp | Tip | Descriere |
|------|-----|-----------|
| id | INTEGER | Identificator unic (auto-generat) |
| name | VARCHAR(100) | Numele studentului (minim 2 caractere) |
| email | VARCHAR(100) | Email unic |
| age | INTEGER | Varsta (intre 16 si 100) |

### Course

| Camp | Tip | Descriere |
|------|-----|-----------|
| id | INTEGER | Identificator unic (auto-generat) |
| title | VARCHAR(100) | Titlul cursului (minim 2 caractere) |
| description | TEXT | Descrierea cursului (optional) |
| teacher | VARCHAR(100) | Numele profesorului |
| max_students | INTEGER | Numarul maxim de studenti |

### Enrollment

| Camp | Tip | Descriere |
|------|-----|-----------|
| id | INTEGER | Identificator unic (auto-generat) |
| student_id | INTEGER | Referinta catre student |
| course_id | INTEGER | Referinta catre curs |
| grade | NUMERIC(4,2) | Nota (intre 1 si 10, optional) |
| status | VARCHAR(20) | enrolled / completed / dropped |

---

## Endpoints API

### Students

| Metoda | Endpoint | Descriere | Status Codes |
|--------|----------|-----------|--------------|
| GET | /students | Toti studentii (filtrare + paginare) | 200 |
| GET | /students/{id} | Un student dupa ID | 200, 404 |
| GET | /students/{id}/courses | Cursurile unui student | 200, 404 |
| POST | /students | Creeaza student nou | 201, 400, 409 |
| PUT | /students/{id} | Actualizeaza complet un student | 200, 400, 404, 409 |
| PATCH | /students/{id} | Actualizeaza partial un student | 200, 400, 404, 409 |
| DELETE | /students/{id} | Sterge un student | 200, 404 |

### Courses

| Metoda | Endpoint | Descriere | Status Codes |
|--------|----------|-----------|--------------|
| GET | /courses | Toate cursurile (filtrare + paginare) | 200 |
| GET | /courses/{id} | Un curs dupa ID | 200, 404 |
| GET | /courses/{id}/students | Studentii unui curs | 200, 404 |
| GET | /courses/{id}/average | Media notelor unui curs | 200, 404 |
| POST | /courses | Creeaza curs nou | 201, 400, 409 |
| PUT | /courses/{id} | Actualizeaza complet un curs | 200, 400, 404, 409 |
| PATCH | /courses/{id} | Actualizeaza partial un curs | 200, 400, 404, 409 |
| DELETE | /courses/{id} | Sterge un curs | 200, 404 |

### Enrollments

| Metoda | Endpoint | Descriere | Status Codes |
|--------|----------|-----------|--------------|
| GET | /enrollments | Toate inscrierile (filtrare + paginare) | 200 |
| GET | /enrollments/{id} | O inscriere dupa ID | 200, 404 |
| POST | /enrollments | Inscrie un student la un curs | 201, 400, 404, 409 |
| PUT | /enrollments/{id} | Actualizeaza nota si statusul | 200, 400, 404 |
| DELETE | /enrollments/{id} | Sterge o inscriere | 200, 404 |

---

## Query Parameters

### GET /students

| Parametru | Tip | Descriere | Exemplu |
|-----------|-----|-----------|---------|
| name | string | Filtreaza dupa nume (partial) | ?name=Ion |
| age | integer | Filtreaza dupa varsta | ?age=20 |
| page | integer | Numarul paginii (default: 1) | ?page=2 |
| limit | integer | Rezultate per pagina (default: 10) | ?limit=5 |

### GET /courses

| Parametru | Tip | Descriere | Exemplu |
|-----------|-----|-----------|---------|
| title | string | Filtreaza dupa titlu (partial) | ?title=Mate |
| teacher | string | Filtreaza dupa profesor | ?teacher=Ionescu |
| page | integer | Numarul paginii (default: 1) | ?page=1 |
| limit | integer | Rezultate per pagina (default: 10) | ?limit=5 |

### GET /enrollments

| Parametru | Tip | Descriere | Exemplu |
|-----------|-----|-----------|---------|
| student_id | integer | Filtreaza dupa student | ?student_id=1 |
| course_id | integer | Filtreaza dupa curs | ?course_id=2 |
| status | string | Filtreaza dupa status | ?status=enrolled |
| page | integer | Numarul paginii (default: 1) | ?page=1 |
| limit | integer | Rezultate per pagina (default: 10) | ?limit=5 |

---

## Format raspunsuri

### Succes

```json
{
  "success": true,
  "message": "Descriere actiune",
  "data": { }
}
```

### Succes cu paginare

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Eroare

```json
{
  "success": false,
  "error": "Descriere eroare",
  "code": 404
}
```

---

## Coduri de stare HTTP

| Cod | Descriere | Cand apare |
|-----|-----------|------------|
| 200 | OK | Cerere procesata cu succes |
| 201 | Created | Resursa creata cu succes |
| 400 | Bad Request | Date invalide sau campuri lipsa |
| 404 | Not Found | Resursa nu a fost gasita |
| 405 | Method Not Allowed | Metoda HTTP nu este permisa |
| 409 | Conflict | Resursa exista deja |
| 500 | Internal Server Error | Eroare interna a serverului |

---

## Proprietati REST respectate

- **Uniform Interface** - toate raspunsurile au acelasi format JSON
- **Stateless** - fiecare cerere contine toate informatiile necesare
- **Resource-Based** - URI-urile identifica resurse (substantive, nu verbe)
- **HTTP Methods** - GET, POST, PUT, PATCH, DELETE folosite corect
- **Status Codes** - coduri de stare corecte pentru fiecare situatie
- **Idempotenta** - GET, PUT, DELETE sunt idempotente
- **Cacheable** - raspunsurile GET pot fi cache-uite

---

## Testare cu Postman

1. Importa fisierul `postman_collection.json` in Postman
2. Colectia contine peste 40 de cereri organizate in 3 grupuri
3. Fiecare cerere include cazuri de succes si cazuri de eroare