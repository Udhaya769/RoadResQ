# 🚗 RoadResQ

**RoadResQ** is a Vehicle Breakdown Assistance and Service Billing System designed to connect customers with available mechanics when a vehicle breakdown occurs.

The system allows customers to raise breakdown requests, mechanics to accept available jobs, and mechanics to generate service bills after completing the repair.

## 📌 Project Overview

RoadResQ provides a simple digital workflow for handling roadside vehicle breakdown assistance:

```text
Customer
   ↓
Raise Breakdown Request
   ↓
Available Mechanics
   ↓
Mechanic Accepts Job
   ↓
Repair & Billing
   ↓
Generate Bill
   ↓
Customer Views Bill
```

## ✨ Features

### 👤 Customer

* Register and login
* Add and manage vehicles
* Raise a vehicle breakdown request
* Select problem type and describe the issue
* Provide breakdown location and contact number
* Select request priority
* View assigned mechanic details
* View generated service bill

### 🔧 Mechanic

* Register and login
* View available breakdown requests
* View customer and vehicle details
* Accept a breakdown request
* Prevent accepting another job while handling an active request
* Enter diagnosis
* Add parts, labour and assistance charges
* Generate the final service bill

### 🧾 Billing

The final bill includes:

* Priority charge
* Parts charges
* Labour charges
* Assistance charges
* Total amount

Priority charges:

| Priority  | Charge | Target Arrival |
| --------- | -----: | -------------: |
| Normal    |   ₹100 |     60 minutes |
| Urgent    |   ₹250 |     30 minutes |
| Emergency |   ₹500 |     15 minutes |

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* REST API

### Database

* SQLite
* better-sqlite3

### Other

* bcryptjs
* CORS
* Git & GitHub

## 📂 Project Structure

```text
RoadResQ/
│
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── CustomerDashboard.jsx
│   │   └── MechanicDashboard.jsx
│   │
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── index.css
│
├── public/
│
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── requests.js
│   │   └── mechanics.js
│   │
│   ├── database.js
│   ├── server.js
│   └── package.json
│
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Udhaya769/RoadResQ.git
cd RoadResQ
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Start the backend

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 5. Start the frontend

Open another terminal and return to the project root:

```bash
cd RoadResQ
npm run dev
```

The frontend will run on the Vite development URL shown in the terminal.

## 🔐 User Roles

RoadResQ currently supports two user roles:

* **Customer**
* **Mechanic**

Each role has its own dashboard and functionality.

## 🎯 Project Objective

The main objective of RoadResQ is to provide a simple platform for managing vehicle breakdown assistance and service billing digitally, reducing the need for manual coordination between customers and mechanics.

## 📌 Project Type

**Academic / BCA Project Prototype**

RoadResQ is developed as a simplified academic project focusing on the core breakdown-assistance and billing workflow.

## 👨‍💻 Repository

[RoadResQ on GitHub](https://github.com/Udhaya769/RoadResQ.git?utm_source=chatgpt.com)
