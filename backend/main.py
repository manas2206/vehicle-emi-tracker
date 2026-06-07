from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
from db import get_connection
import mysql.connector

app = FastAPI(title="Vehicle EMI Tracker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VehicleCreate(BaseModel):
    registration_number: str
    vehicle_type: str
    model: Optional[str] = None
    owner_name: Optional[str] = None
    loan_amount: float
    tenure_months: int
    interest_rate: float
    start_date: date

class EMIStatusUpdate(BaseModel):
    status: str
    paid_date: Optional[date] = None

@app.get("/")
def root():
    return {"message": "Vehicle EMI Tracker API is running"}

@app.get("/api/emi/{vehicle_number}")
def get_emi(vehicle_number: str):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    reg = vehicle_number.upper().strip()

    cursor.execute("SELECT * FROM vehicles WHERE registration_number = %s", (reg,))
    vehicle = cursor.fetchone()

    if not vehicle:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Vehicle not found")

    cursor.execute(
        """
        SELECT id, month_label, due_date, amount, status, paid_date
        FROM emi_schedule
        WHERE vehicle_id = %s
        ORDER BY due_date ASC
        """,
        (vehicle["id"],)
    )
    schedule = cursor.fetchall()

    paid_count = sum(1 for e in schedule if e["status"] == "paid")
    pending_count = sum(1 for e in schedule if e["status"] == "pending")
    overdue_count = sum(1 for e in schedule if e["status"] == "overdue")
    monthly_emi = schedule[0]["amount"] if schedule else 0

    cursor.close()
    conn.close()

    return {
        "vehicle": {
            "registration_number": vehicle["registration_number"],
            "vehicle_type": vehicle["vehicle_type"],
            "model": vehicle["model"],
            "owner_name": vehicle["owner_name"],
            "loan_amount": float(vehicle["loan_amount"]),
            "tenure_months": vehicle["tenure_months"],
            "interest_rate": float(vehicle["interest_rate"]),
        },
        "summary": {
            "monthly_emi": float(monthly_emi),
            "total_emis": len(schedule),
            "paid_count": paid_count,
            "pending_count": pending_count,
            "overdue_count": overdue_count,
        },
        "schedule": [
            {
                "id": e["id"],
                "month_label": e["month_label"],
                "due_date": str(e["due_date"]),
                "amount": float(e["amount"]),
                "status": e["status"],
                "paid_date": str(e["paid_date"]) if e["paid_date"] else None,
            }
            for e in schedule
        ],
    }

@app.post("/api/vehicle")
def add_vehicle(data: VehicleCreate):
    conn = get_connection()
    cursor = conn.cursor()
    reg = data.registration_number.upper().strip()

    P = data.loan_amount
    r = (data.interest_rate / 100) / 12
    n = data.tenure_months
    monthly_emi = round(P * r * (1 + r) ** n / ((1 + r) ** n - 1) if r else P / n, 2)

    try:
        cursor.execute(
            """
            INSERT INTO vehicles
              (registration_number, vehicle_type, model, owner_name,
               loan_amount, tenure_months, interest_rate, start_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (reg, data.vehicle_type, data.model, data.owner_name,
             data.loan_amount, data.tenure_months, data.interest_rate, data.start_date)
        )
        vehicle_id = cursor.lastrowid

        import calendar
        start = data.start_date
        year, month = start.year, start.month

        for i in range(data.tenure_months):
            last_day = calendar.monthrange(year, month)[1]
            due_date = date(year, month, min(start.day, last_day))
            month_label = due_date.strftime("%b %Y")
            cursor.execute(
                "INSERT INTO emi_schedule (vehicle_id, month_label, due_date, amount, status) VALUES (%s, %s, %s, %s, 'pending')",
                (vehicle_id, month_label, due_date, monthly_emi)
            )
            month += 1
            if month > 12:
                month = 1
                year += 1

        conn.commit()
    except mysql.connector.IntegrityError:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Vehicle number already exists")

    cursor.close()
    conn.close()
    return {"message": "Vehicle added successfully", "registration_number": reg, "monthly_emi": monthly_emi}

@app.patch("/api/emi/{vehicle_number}/{emi_id}")
def update_emi_status(vehicle_number: str, emi_id: int, data: EMIStatusUpdate):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    reg = vehicle_number.upper().strip()

    cursor.execute("SELECT id FROM vehicles WHERE registration_number = %s", (reg,))
    vehicle = cursor.fetchone()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    cursor.execute(
        "UPDATE emi_schedule SET status = %s, paid_date = %s WHERE id = %s AND vehicle_id = %s",
        (data.status, data.paid_date, emi_id, vehicle["id"])
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "EMI status updated"}

@app.get("/api/vehicles")
def list_vehicles():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT registration_number, vehicle_type, model, owner_name FROM vehicles ORDER BY created_at DESC")
    vehicles = cursor.fetchall()
    cursor.close()
    conn.close()
    return {"vehicles": vehicles}