# University Dashboard

O aplicatie web full-stack care agrega date din multiple servicii web intr-un dashboard unificat pentru managementul universitar. Construita cu FastAPI (backend) si React (frontend), containerizata cu Docker.

---

## Arhitectura

Aplicatia urmeaza o arhitectura client-server decuplata:

- **Frontend** - aplicatie React (Vite) care ruleaza pe portul 5173
- **Backend** - server FastAPI care ruleaza pe portul 8080
- **HW1 API** - University RESTful API care ruleaza pe portul 8000 (proiect separat)

Frontend-ul comunica exclusiv cu backend-ul prin JSON. Backend-ul agrega date din trei servicii web externe si expune un API REST unificat catre frontend.

---

## Servicii Web Integrate

### 1. University RESTful API (Tema 1)
Un API RESTful custom pentru managementul universitar, rulat local pe portul 8000.
- Studenti - operatii CRUD, filtrare, paginare
- Cursuri - operatii CRUD, filtrare, paginare, medii note
- Inscrieri - asocieri student-curs cu note si statusuri

### 2. OpenWeatherMap API
- Conditii meteo curente pentru orasul universitatii
- Prognoza meteo pentru urmatoarele 5 intervale de 3 ore
- Documentatie: https://openweathermap.org/api

### 3. NewsAPI
- Feed de stiri generale despre educatie si universitati
- Cautare de stiri pe topic (folosita pentru a afisa stiri relevante pentru titlul unui curs)
- Documentatie: https://newsapi.org

---

## Tehnologii Folosite

### Backend
- Python 3.11
- FastAPI
- httpx (client HTTP asincron)
- uvicorn
- python-dotenv
- Pydantic

### Frontend
- React 18
- Vite
- React Router DOM
- Axios
- Recharts

### Infrastructura
- Docker
- Docker Compose

---

## Structura Proiectului

```
university-dashboard/
├── docker-compose.yml
├── README.md
├── generate_readme.py
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── config.py
│   ├── main.py
│   ├── data/
│   │   └── favorites.json
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── university_router.py
│   │   ├── weather_router.py
│   │   ├── news_router.py
│   │   └── favorites_router.py
│   └── services/
│       ├── __init__.py
│       ├── university_service.py
│       ├── weather_service.py
│       ├── news_service.py
│       └── favorites_service.py
└── frontend/
    ├── Dockerfile
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── index.css
        ├── main.jsx
        ├── App.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── WeatherWidget.jsx
        │   ├── StudentCard.jsx
        │   ├── CourseCard.jsx
        │   ├── NewsCard.jsx
        │   ├── ErrorMessage.jsx
        │   ├── FavoriteButton.jsx
        │   └── Skeleton.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Students.jsx
            ├── Courses.jsx
            ├── News.jsx
            └── Favorites.jsx
```

---

## Cerinte Prealabile

- Docker Desktop instalat si pornit
- University RESTful API (Tema 1) rulat pe portul 8000
- Chei API pentru OpenWeatherMap si NewsAPI

---

## Configurare

Creaza fisierul backend/.env pe baza backend/.env.example:

```
UNIVERSITY_API_URL=http://host.docker.internal:8000
OPENWEATHER_API_KEY=your_openweather_api_key_here
OPENWEATHER_CITY=Bucharest
NEWS_API_KEY=your_news_api_key_here
```

Obtinerea cheilor API:
- OpenWeatherMap: https://openweathermap.org/api - cont gratuit, planul Free este suficient
- NewsAPI: https://newsapi.org - cont gratuit, planul Developer este suficient

---

## Rulare

### Pasul 1 - Porneste University API (Tema 1)

Din folderul university-api:

```
docker-compose up -d
```

Verifica ca ruleaza la http://localhost:8000/students

### Pasul 2 - Porneste University Dashboard

Din folderul university-dashboard:

```
docker-compose up --build
```

### Pasul 3 - Acceseaza aplicatia

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Documentatie API (Swagger): http://localhost:8080/docs

### Oprire

```
docker-compose down
```

---

## Functionalitati

### Dashboard
- Statistici generale - numar total studenti, cursuri si inscrieri
- Grafic bar cu numarul de studenti inscrisi per curs
- Grafic pie cu distributia statusurilor inscrierilor (inscris, finalizat, retras)
- Widget vreme curenta pentru orasul universitatii
- Prognoza meteo pentru urmatoarele intervale
- Feed de stiri recente despre educatie
- Loading skeletons animate in timpul incarcarii datelor

### Studenti
- Lista paginata a tuturor studentilor
- Cautare dupa nume
- Modal cu detaliile studentului si cursurile la care este inscris
- Afisare note si statusuri per curs

### Cursuri
- Lista paginata a tuturor cursurilor
- Cautare dupa titlu si dupa profesor
- Modal cu detaliile cursului
- Media notelor cu valori minime si maxime
- Stiri relevante despre titlul cursului (via NewsAPI)
- Adaugare la favorite

### Stiri
- Feed general de stiri despre educatie cu paginare
- Cautare stiri dupa topic personalizat
- Butoane rapide pentru topicuri predefinite (AI, Machine Learning, Cloud Computing etc.)
- Adaugare articole la favorite

### Favorite
- Salvare persistenta in fisier JSON (data/favorites.json)
- Tab-uri separate pentru cursuri favorite si articole favorite
- Stergere din favorite

---

## Endpoint-uri Backend

### University
- GET /university/students - lista studenti cu filtrare si paginare
- GET /university/students/{id} - detalii student
- GET /university/students/{id}/courses - cursurile unui student
- GET /university/courses - lista cursuri cu filtrare si paginare
- GET /university/courses/{id} - detalii curs
- GET /university/courses/{id}/average - media notelor unui curs
- GET /university/enrollments - lista inscrieri cu filtrare si paginare
- GET /university/stats/enrollments-by-status - distributie inscrieri pe status
- GET /university/stats/students-per-course - numar studenti per curs

### Weather
- GET /weather/current - vremea curenta
- GET /weather/forecast - prognoza meteo

### News
- GET /news/education - stiri generale despre educatie
- GET /news/topic?topic={topic} - stiri dupa topic

### Favorites
- GET /favorites/courses - cursurile favorite
- POST /favorites/courses - adauga curs la favorite
- DELETE /favorites/courses/{id} - sterge curs din favorite
- GET /favorites/articles - articolele favorite
- POST /favorites/articles - adauga articol la favorite
- DELETE /favorites/articles - sterge articol din favorite

### General
- GET / - informatii aplicatie
- GET /health - verificare stare servicii

---

## Gestionarea Erorilor

Backend-ul returneaza coduri HTTP corespunzatoare pentru fiecare situatie:
- 200 OK - cerere procesata cu succes
- 201 Created - resursa creata cu succes
- 404 Not Found - resursa nu a fost gasita
- 409 Conflict - resursa exista deja (ex: curs deja la favorite)
- 500 Internal Server Error - eroare interna sau serviciu extern indisponibil

Frontend-ul afiseaza mesaje de eroare clare cu optiunea de a reincerca cererea.

---

## Stocare Persistenta

Favoritele sunt salvate in fisierul backend/data/favorites.json cu urmatoarea structura:

```
{
  "courses": [
    {
      "id": 1,
      "title": "Machine Learning",
      "teacher": "Prof. Ionescu Alexandru",
      "description": "...",
      "max_students": 30
    }
  ],
  "articles": [
    {
      "url": "https://...",
      "title": "...",
      "description": "...",
      "source": "...",
      "published_at": "...",
      "image_url": "..."
    }
  ]
}
```

Fisierul este montat ca volum Docker, deci datele persista intre reporniri.

---

## Popularea Bazei de Date

Pentru testare, in folderul university-api exista un script de seed:

```
python seed.py
```

Scriptul creaza:
- 25 de studenti
- 10 cursuri
- Inscrieri random cu statusuri si note diferite

---

## Proprietati REST Respectate

- Interfata uniforma - toate raspunsurile au acelasi format JSON
- Stateless - fiecare cerere contine toate informatiile necesare
- Coduri de stare corecte - coduri HTTP potrivite pentru fiecare situatie
- Separarea componentelor - frontend si backend sunt complet decuplate
