# Vehicle EMI Tracker

A full-stack app to look up vehicle EMI details (paid, pending, monthly EMI) by registration number.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS + Axios
- **Backend**: Python + FastAPI + Uvicorn
- **Database**: MySQL

---

## Setup Instructions

### 1. Database Setup
Open MySQL and run:
```bash
mysql -u root -p < database/schema.sql
```
This creates the `vehicle_emi` database, tables, and sample data.

---

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Edit .env and set your MySQL password

# Run the server
uvicorn main:app --reload
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

---

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```
Frontend runs at: http://localhost:5173

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emi/{vehicle_number}` | Get EMI details for a vehicle |
| POST | `/api/vehicle` | Add a new vehicle loan |
| PATCH | `/api/emi/{vehicle_number}/{emi_id}` | Update EMI status (paid/pending) |
| GET | `/api/vehicles` | List all vehicles |

---

## Sample Vehicle Numbers (from seed data)
- `MH12AB1234` — Toyota Innova (Car)
- `KA05MN4567` — Royal Enfield (Bike)
- `DL1CT9900` — Tata Ace (Truck)

---

## Add a New Vehicle (POST /api/vehicle)
```json
{
  "registration_number": "GJ05XX9999",
  "vehicle_type": "car",
  "model": "Maruti Swift 2023",
  "owner_name": "Amit Patel",
  "loan_amount": 600000,
  "tenure_months": 48,
  "interest_rate": 9.5,
  "start_date": "2025-01-01"
}
```
The backend auto-calculates monthly EMI and generates the full schedule.
