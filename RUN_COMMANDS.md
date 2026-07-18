# How To Run This Project

## 1. Prerequisites

Install:

- Python 3.12+
- Node.js 22+
- PostgreSQL 16+
- Git

## 2. Create PostgreSQL Database

Open PostgreSQL or pgAdmin and create:

```sql
CREATE DATABASE blood_donor;
```

Default local connection used by `backend/.env.example`:

```text
postgresql+psycopg2://postgres:postgres@localhost:5432/blood_donor
```

## 3. Run Backend

From the project root:

```bash
python -m venv .venv
```

Windows PowerShell:

```bash
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

Create backend env file:

```bash
copy backend\.env.example backend\.env
```

Run the API:

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

```text
http://localhost:8000/docs
```

## 4. Run Frontend

Open a second terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

## 5. Create Test Accounts

Use the Register page or Swagger:

```text
POST http://localhost:8000/api/v1/auth/register
```

Roles:

- `donor`
- `recipient`
- `hospital`
- `admin`

## 6. Typical Demo Flow

1. Register as a donor.
2. Open Donor Dashboard > Profile and save blood group, city, and coordinates.
3. Register as a recipient.
4. Open Recipient Dashboard > Create Request.
5. Create an emergency request.
6. Open Recipient Dashboard > Track Request or Donor Dashboard > Blood Requests.
7. Use Hospital Dashboard > Verification to upload an ID or certificate image.
8. Use Admin Dashboard > Analytics to view charts and metrics.

## 7. Alembic Commands

Development currently auto-creates tables when `AUTO_CREATE_TABLES=true`.

For production migrations:

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Set:

```text
AUTO_CREATE_TABLES=false
```

## 8. Neon PostgreSQL

Set this in `backend/.env` or your hosting provider:

```text
DATABASE_URL=postgresql+psycopg2://USER:PASSWORD@HOST/dbname?sslmode=require
```

## 9. Production Build

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```
