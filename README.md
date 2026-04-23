# University Dashboard - Azure Cloud Application

O aplicatie web full-stack care agrega date din multiple servicii web intr-un dashboard unificat pentru managementul universitar. Aplicatia integreaza **5 servicii Azure** si **2 API-uri externe**.

---

## Ce face aplicatia (pe scurt, pentru prezentare)

Aplicatia este un **dashboard universitar** care permite:
- Vizualizarea studentilor, cursurilor si inscrierilor (date din University API - Homework 1)
- Vizualizarea vremii curente si a prognozei meteo pentru orasul universitatii
- Citirea stirilor despre educatie cu posibilitatea de **traducere automata** in romana (Azure Translator)
- Salvarea cursurilor si articolelor la **favorite** (persistate in Azure Cosmos DB)
- Incarcarea de **documente** pentru fiecare student - CV, diploma, etc. (stocate in Azure Blob Storage)
- **Monitorizarea** tuturor actiunilor din aplicatie prin Activity Log (Azure Table Storage) si Events (Azure Queue Storage)

Toate datele sunt persistate in cloud prin servicii Azure reale - nimic nu se salveaza local pe disk.

---

## Servicii Azure (5 servicii)

### 1. Azure Cosmos DB (NoSQL Database)
- **Ce face**: Salveaza favoritele utilizatorului (cursuri si articole de stiri)
- **De ce Cosmos DB si nu altceva**: Cosmos DB este o baza de date NoSQL document-based. Favoritele au structura variabila (un curs are id, title, teacher pe cand un articol are url, source, published_at). Intr-o baza de date relationala ar fi trebuit tabele separate cu schema fixa. Cosmos DB permite stocarea ambelor tipuri in acelasi container cu partition key pe tip. In plus, ofera latenta sub 10ms si SLA de 99.99%% availability.
- **Unde se vede in aplicatie**: Pagina Cursuri (buton favorite) + Pagina Stiri (buton favorite) + Pagina Favorite (listare)
- **Fisiere relevante**: services/favorites_service.py, routers/favorites_router.py

### 2. Azure Blob Storage
- **Ce face**: Stocheaza documentele uploadate pentru fiecare student (CV-uri, diplome, atestate)
- **De ce Blob Storage si nu altceva**: Blob Storage este optimizat pentru fisiere binare (binary large objects). Stocarea fisierelor intr-o baza de date ar fi fost ineficienta si costisitoare. Blob Storage ofera stocare ieftina, scalabila, cu acces direct prin URL unic pentru fiecare fisier.
- **Unde se vede in aplicatie**: Pagina Studenti -> click pe student -> sectiunea Documente (upload, listare, descarcare, stergere)
- **Fisiere relevante**: services/documents_service.py, routers/documents_router.py

### 3. Azure Queue Storage
- **Ce face**: Primeste si stocheaza evenimente asincrone (cand cineva adauga la favorite, uploadeaza un document, etc.)
- **De ce Queue Storage si nu altceva**: Queue Storage implementeaza pattern-ul producer-consumer. Backend-ul trimite un mesaj in queue fara sa astepte procesarea lui (fire-and-forget). Decupleaza componentele si este fundamental in arhitecturile cloud distribuite.
- **Unde se vede in aplicatie**: Pagina Monitorizare -> tab-ul Queue Events
- **Fisiere relevante**: services/queue_service.py, routers/events_router.py

### 4. Azure Table Storage
- **Ce face**: Stocheaza un activity log persistent cu toate actiunile din aplicatie
- **De ce Table Storage si nu altceva**: Table Storage este un key-value store NoSQL optimizat pentru date tabulare simple. Activity log-ul e partitionat pe data (PartitionKey = data zilei) ceea ce face query-urile pe o zi specifica foarte rapide. Fata de Cosmos DB care e mai complex si mai scump, Table Storage e ideal pentru date simple de logging.
- **Unde se vede in aplicatie**: Pagina Monitorizare -> tab-ul Activity Log
- **Fisiere relevante**: services/activity_service.py, routers/activity_router.py

### 5. Azure Translator (Cognitive Services)
- **Ce face**: Traduce titlurile si descrierile stirilor din engleza in romana
- **De ce Translator si nu altceva**: Azure Translator este un serviciu AI de traducere automata neurala. Detecteaza automat limba sursa si traduce in limba tinta. Se integreaza nativ cu ecosistemul Azure si ofera tier gratuit (2M caractere/luna).
- **Unde se vede in aplicatie**: Pagina Stiri -> butonul Traduce pe fiecare articol
- **Fisiere relevante**: services/translator_service.py, routers/translator_router.py

---

## API-uri Externe (2 API-uri)

### 6. OpenWeatherMap API
- **Ce face**: Vremea curenta si prognoza meteo pentru Bucuresti
- **Unde se vede**: Dashboard -> widget Vremea pe Campus + Prognoza

### 7. NewsAPI
- **Ce face**: Stiri despre educatie si cautare pe topicuri specifice
- **Unde se vede**: Dashboard -> Stiri Educatie + Pagina Stiri

---

## Diferenta Queue Storage vs Table Storage (intrebare probabila la prezentare)

**Queue Storage** = mesaje temporare, asincrone, fire-and-forget. Mesajele se consuma si dispar.

**Table Storage** = date persistente, log permanent. Datele raman acolo pentru totdeauna.

In aplicatie: cand adaugi un curs la favorite, se intampla simultan:
1. Se salveaza in Cosmos DB (datele efective)
2. Se trimite un event in Queue Storage (notificare asincrona, temporara)
3. Se scrie o intrare in Table Storage (log permanent)

---

## Flux de orchestrare (important pentru prezentare)

Exemplu: Utilizatorul adauga un curs la favorite
1. Frontend: POST /api/favorites/courses
2. Backend favorites_router.py primeste request-ul
3. favorites_service.py -> salveaza in Azure Cosmos DB
4. queue_service.py -> trimite event in Azure Queue Storage
5. activity_service.py -> scrie log in Azure Table Storage
6. Backend returneaza raspuns catre Frontend

Exemplu: Utilizatorul uploadeaza un document
1. Frontend: POST /api/documents/upload (multipart/form-data)
2. Backend documents_router.py primeste request-ul
3. documents_service.py -> uploadeaza fisierul in Azure Blob Storage
4. queue_service.py -> trimite event in Azure Queue Storage
5. activity_service.py -> scrie log in Azure Table Storage
6. Backend returneaza URL-ul fisierului din Blob Storage

---

## Tehnologii Folosite

### Backend
- Python 3.11, FastAPI, httpx, uvicorn, Pydantic
- azure-cosmos, azure-storage-blob, azure-storage-queue, azure-data-tables
- python-multipart (upload fisiere)

### Frontend
- React 19, Vite 8, React Router DOM, Axios, Recharts

### Infrastructura
- Docker + Docker Compose
- Azure Cloud (5 servicii)

---

## Configurare si Rulare

### Cerinte
- Docker Desktop instalat si pornit
- Cont Azure cu resurse create
- University API (Homework 1) rulat pe portul 8000

### Pornire
Terminal 1: cd homework-1 && docker-compose up -d
Terminal 2: cd homework-2 && docker-compose up --build

### Accesare
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger Docs: http://localhost:8080/docs

---

## Resurse Azure Create

| Resursa | Tip | Nume | Regiune |
|---------|-----|------|---------|
| Resource Group | - | university-dashboard-rg | swedencentral |
| Cosmos DB Account | Microsoft.DocumentDB | university-dashboard-db | swedencentral |
| Storage Account | Microsoft.Storage | univdashboardstorage | swedencentral |
| Translator | Microsoft.CognitiveServices | univdashboard-translator | swedencentral |

Storage Account-ul contine:
- Blob Container: student-documents
- Queue: dashboard-events
- Table: activitylog
