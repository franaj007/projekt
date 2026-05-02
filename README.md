# SplitPay

## Opis aplikacji

SplitPay to aplikacja webowa ułatwiająca dzielenie rachunków i kosztów w grupie (np. pomiędzy współlokatorami, podczas wyjazdów). Umożliwia tworzenie grup wydatków, dodawanie wydatków oraz generowanie podsumowań z informacją, kto komu i ile powinien zwrócić, aby wyrównać salda w grupie.

## Stos technologiczny

| Warstwa | Technologia |
|----------|------------|
| Backend | Node.js 22, Express 4, TypeScript |
| ORM / Baza | Prisma 5, PostgreSQL 15 |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Autentykacja | JWT (jsonwebtoken), bcryptjs |
| Testy backend | Jest, Supertest |
| Testy frontend | Vitest, React Testing Library |
| Konteneryzacja | Docker, Docker Compose |

## Podział pracy

- **Franciszek**: REST API (Express), logika rozliczeń (`/api/settlements`), autoryzacja JWT (`/api/users/register`, `/api/users/login`), integracja z PostgreSQL przez Prisma, Konfiguracja Docker Compose (db + backend + frontend)
- **Antoni**: Interfejs React (Vite + TypeScript), komponenty dashboard, modal „Dodaj wydatek", klient API (`api.ts`), stylowanie Tailwind CSS, testy jednostkowe backendu (Jest/Supertest), testy komponentów frontendu (Vitest/RTL), seed danych.

## Jak uruchomić (Docker)

```bash
# Z katalogu głównego projektu:
docker compose up --build
```

Serwisy:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- PostgreSQL: localhost:5433

> **Uwaga (Windows/MacOS):**
> W pliku `docker-compose.yml` dla usługi frontendu dodaliśmy flagę `CHOKIDAR_USEPOLLING=true`, która naprawia problemy z odświeżaniem na żywo (Vite HMR) przy podmontowanych wolumenach.

Po uruchomieniu, uzupełnij bazę danymi początkowymi:
```bash
docker exec -it splitpay_backend npx prisma db seed
```

## Jak uruchomić (lokalnie, bez Dockera)

### Backend
```bash
cd backend
nvm use 22          # lub zaktualizuj Node na inny sposób
npm install
# Ustaw DATABASE_URL w pliku .env:
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5433/splitpay"' > .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev         # → http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # → http://localhost:5173
```

## REST API — endpointy

### Użytkownicy
| Metoda | Endpoint | Opis |
|---------|----------|------|
| GET | `/api/users` | Lista wszystkich użytkowników |
| POST | `/api/users/register` | Rejestracja (name, email, password) |
| POST | `/api/users/login` | Logowanie → zwraca JWT |

### Grupy
| Metoda | Endpoint | Opis |
|---------|----------|------|
| GET | `/api/groups` | Lista grup z członkami |
| POST | `/api/groups` | Utwórz grupę (name, userIds[]) |

### Wydatki
| Metoda | Endpoint | Opis |
|---------|----------|------|
| GET | `/api/expenses/group/:groupId` | Wydatki grupy |
| POST | `/api/expenses` | Dodaj wydatek z podziałem |

### Rozliczenia
| Metoda | Endpoint | Opis |
|---------|----------|------|
| GET | `/api/settlements/:groupId` | Kto komu ile oddaje (minimalne transakcje) |
