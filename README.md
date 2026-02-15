# 🏥 MediTriage-AI  
## AI-Powered Smart Patient Triage System  
### Technology-Driven Innovation in Healthcare using AI & Data

---

## 📌 Overview

Healthcare systems worldwide face increasing patient loads, limited medical resources, and inefficiencies in early risk identification.

Traditional triage processes rely heavily on manual evaluation, leading to:

- Delays in identifying high-risk patients  
- Overcrowded emergency departments  
- Inconsistent prioritization  
- Increased operational strain  

**MediTriage-AI** is a full-stack AI-powered web application that leverages:

- Hybrid AI Risk Classification  
- Explainable AI Models  
- Multilingual Voice Input  
- EMR/EHR Document Analysis  
- Real-Time Dashboards  
- Role-Based Access Control  

to optimize hospital triage workflows.

---

##  Problem Statement

Design and develop an AI-based system that:

- Classifies patients into **Low / Medium / High / Critical** risk levels  
- Recommends the appropriate medical department  
- Provides explainable insights behind predictions  
- Supports efficient patient prioritization  
- Reduces hospital wait times  

---

##  System Architecture

Input (Text / Voice / PDF / Image)

↓

Hybrid AI Risk Engine

↓

Department Recommendation

↓

Role-Based Dashboards

↓

Real-Time Queue + SMS Alerts


---

# 👥 User Roles & Workflows


## 1️⃣ Triage Nurse Dashboard

### Features

- Role-based authentication
- Create new patient
- Fetch & auto-populate existing patient
- Upload EMR/EHR PDF documents
- Multilingual voice & text symptom input
- View AI risk classification
- View confidence score & contributing factors
- Route patient to department
- Track routing history
- Send SMS with floor, doctor & ETA

### Workflow

1. Register or fetch patient  
2. Enter vitals & symptoms  
3. Upload medical documents  
4. AI processes structured + unstructured inputs  
5. Risk + Department suggestion displayed  
6. Nurse routes patient  
7. Patient receives SMS notification  

---

## 2️⃣ Paramedic Dashboard (Pre-Hospital)

Includes all Nurse features plus:

- Ambulance ID  
- GPS location tracking  
- Estimated Time of Arrival (ETA)  
- Pre-hospital vitals  
- Pre-allocate department before arrival  

---

## 3️⃣ Doctor Dashboard

- View prioritized department queue  
- See AI explanation & confidence score  
- Ask: *"Why this risk?"*  
- Override AI decision  
- Add treatment & medications  
- Update EHR  
- Add follow-up schedule  
- Discharge patient  

---

## 4️⃣ Department Admin Dashboard

- Real-time risk-sorted queue  
- Doctor availability tracking  
- Wait-time estimation  
- Patient volume analytics  
- Demographic charts  
- Seed / Clear demo data  

---

#  Hybrid AI Engine

## Step 1: Structured ML Model

### Inputs

- Age  
- Gender  
- Blood Pressure  
- Heart Rate  
- Temperature  
- SpO2  
- Pre-existing conditions  
- Extracted symptoms (Text / Voice / PDF)  

### Model Used

- Random Forest  
- XGBoost    

---

## Step 2: Rule-Based Emergency Layer

Automatically forces **HIGH Risk** if:

- HR > 140  
- BP > 180  
- SpO2 < 90  
- Chest pain + sweating  
- Stroke indicators  

---

## Step 3: Department Mapping

| Condition | Department |
|------------|------------|
| Chest Pain | Cardiology |
| Stroke Signs | Neurology |
| Trauma | Emergency |
| Fever | General Medicine |
| Bone Injury | Orthopedics |

Hybrid rule + classifier-based routing.

---

# 🌐 Key Features

- ✅ Multilingual symptom analysis  
- ✅ Voice-to-text input  
- ✅ EMR/EHR PDF processing  
- ✅ Image upload via Gemini API  
- ✅ Explainable AI (Strict JSON Output)  
- ✅ Real-time queue updates  
- ✅ SMS alerts to patients  
- ✅ Role-based access control  
- ✅ Follow-up reminders  
- ✅ Department-level filtering  

---

# 🛠️ Technology Stack

## 🔹 Frontend

- React + Vite  
- TypeScript
- Recharts  
- lucide-react  
- react-speech-recognition  

## 🔹 Backend

- Supabase (PostgreSQL)  
- Supabase Auth  
- Supabase Storage  
- Supabase Edge Functions  

## 🔹 AI & ML

- Local Python ML API
- Google Gemini 2.0 Flash (Fallback)  
- Hybrid Rule Engine  

---

# 🗂️ Database Structure

Main Tables:

- `patients`
- `triage_cases`
- `doctors`
- `departments`
- `routing_history`
- `treatments`

---

# 👨‍⚕️ Doctor Mapping (Demo Accounts)

| Email | Doctor | Department |
|-------|--------|------------|
| akhilv@gmail.com | Dr. Akhil V | Orthopedics |
| ramav@gmail.com | Dr. Rama V | General Medicine |
| priyav@gmail.com | Dr. Priya V | Cardiology |
| josenav@gmail.com | Dr. Josena V | Neurology |
| angelv@gmail.com | Dr. Angel V | Pulmonology |
| ashv@gmail.com | Dr. Ash V | Emergency |

Demo Password:
qwer1234


---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/PRIYANKALSHARMA1575/MediTriage-AI.git

cd MediTriage-AI


---

## 2️⃣ Install Frontend Dependencies

```bash
npm install


---

## 3️⃣ Run Frontend

```bash
npm run dev


Open in browser:

http://localhost:8080


---

# 🧠 Run AI Engine (Python Backend)

Open a **new terminal**:

---

##  For Windows

```bash
cd MediTriage-AI
cd ai

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python app.py


---

##  For Mac/Linux

```bash
cd MediTriage-AI
cd ai

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
python app.py


AI API runs on:

http://localhost:8000


---

# 🔐 Environment Variables

Create a `.env` file in root directory:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key


---

#  Scalability & Future Scope

- Wearable device integration  
- Bias & fairness analysis  
- Production ML deployment  
- Kubernetes deployment  
- Twilio SMS integration  
- Real hospital API integration  

---

#  Outcome & Impact

MediTriage-AI demonstrates:

- Applied AI in Healthcare  
- Synthetic Data Generation  
- Explainable AI Systems  
- Real-Time Scalable Architecture  
- End-to-End Role-Based Workflow  

---

# 👩‍💻 Team

**Priyanka L Sharma & Team**

---

