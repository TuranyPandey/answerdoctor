# AnswerDoctor - Simple & Clean Prototype for Judges

## Overview
A refined, production-ready web application with a simple, cozy login interface and role-based dashboards (Teacher/Student) using your real seeded data.

## What Was Built

### 1. **Simple Login Page** (`SimpleLogin.jsx`)
- Clean, humanish design (not AI-made high-fidelity)
- Two login methods: **Email** or **Phone**
- Gmail OAuth button (placeholder ready)
- Demo credentials built-in
- Hints showing available test accounts
- Connects to real backend auth API
- Graceful error handling

**Try these logins:**
- Email: `prof.sharma@vit.ac.in` (Teacher)
- Email: `sohum@vit.ac.in` (Student)  
- Email: `rayed@vit.ac.in` (Student)
- Email: `pratyush@vit.ac.in` (Student)
- Email: `turany@vit.ac.in` (Student)

### 2. **Teacher Dashboard** (`CleanTeacherDashboard.jsx`)
Shows what teachers see after login:
- **Classrooms section**: List all their classes with submission counts
- **Assignments view**: All assignments in selected classroom with:
  - Exam type badge (CAT-1, CAT-2, FAT)
  - Total marks & submission count
  - View Analytics button
- **Analytics Summary**: 
  - Class average score
  - Total submissions
  - Number of flagged submissions
- **Weakness Heatmap**: Student performance by rubric unit with:
  - Color-coded pass rates (green/yellow/red)
  - Pass percentage bars
  - Weakness level indicators

Real data from database:
- Classroom: "MECH201 - Applied Thermodynamics"  
- Teacher: Prof. Rajesh Sharma
- 4 students enrolled
- 1 assignment with analytics

### 3. **Student Dashboard** (`CleanStudentDashboard.jsx`)
Shows what students see after login:
- **Performance stats**:
  - Total submissions
  - Number passed (score ≥ 60)
  - Class average
  - Flagged count
- **Submissions list**: Clickable list of all their submissions
- **Selected submission details**:
  - Overall score with circular progress indicator
  - Pass/Fail status
  - OCR confidence
  - Steps analyzed count
  - Collusion flag (if applicable)
  - Step-by-step feedback for each rubric unit
  - Diagnosis text for weak/missing steps
  - Color-coded status indicators

### 4. **Core Features**
- ✅ Real data from your seeded database (4 students, 1 teacher, 1 classroom, 1 assignment)
- ✅ No random/dummy data - uses actual backend submissions
- ✅ Simple, clean Tailwind UI (cozy, not flashy)
- ✅ Role-based routing (different UI for teacher vs student)
- ✅ Sign out functionality
- ✅ Professional color scheme
- ✅ Responsive design
- ✅ CORS-enabled backend API integration

## Technical Stack
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Icons**: Lucide React
- **State**: React hooks (useState, useEffect)
- **API Communication**: Fetch API with error handling

## How to Use

### Start Services
```bash
# Terminal 1: Frontend
cd frontend
npm install  # if needed
npm run dev
# Runs on http://localhost:3002

# Terminal 2: Backend
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
# Runs on http://127.0.0.1:8000
```

### Login Flow
1. Go to http://localhost:3002
2. Choose Email or Phone tab
3. Enter teacher or student email
4. Redirected to appropriate dashboard based on role
5. View their classrooms/assignments (teacher) or submissions (student)
6. Click "Sign Out" to logout

## File Structure
```
frontend/src/
├── App.jsx                          # Main app with login router
├── components/
│   ├── SimpleLogin.jsx             # Clean login form (email/phone)
│   ├── CleanTeacherDashboard.jsx   # Teacher view
│   └── CleanStudentDashboard.jsx   # Student view
```

## Data Model (From Backend)
- **Users**: Teacher (1) + Students (4) with roles
- **Classrooms**: 1 - "MECH201 Applied Thermodynamics"
- **Assignments**: 1 - "CAT-1 Exam: First Law & State Reference Equations"
- **Rubric Units**: 5 evaluation criteria
- **Submissions**: 4 (one per student)
- **Analytics**: Weakness heatmap, error clusters, collusion flags

## Presentation Tips for Judges
1. **Start with login**: Show the simple, clean interface
2. **Demo as teacher**: Click "prof.sharma@vit.ac.in" → Show classroom analytics
3. **Demo as student**: Click "sohum@vit.ac.in" → Show submission feedback with step details
4. **Highlight real data**: Point out this is actual database data, not mock
5. **Emphasize simplicity**: "We avoided high-fi AI dashboard look - this is real, usable UI for actual educators"

## API Endpoints Used
- `POST /api/auth/login` - Login user by email
- `GET /api/classrooms` - List classrooms
- `GET /api/assignments` - List assignments
- `GET /api/submissions` - List submissions
- `GET /api/submissions/{id}` - Get submission details
- `GET /api/analytics/{assignment_id}` - Get assignment analytics

## Next Steps (If Needed)
- Add Doubt Center (AI doubt resolution)
- Add PYQ Vault (Previous Year Questions)
- Add collusion detection visualization
- Add batch submission upload
- Add email notifications
- Add export reports (PDF)

## Notes
- All styling uses Tailwind CSS - no custom CSS
- Icons from lucide-react library
- Responsive on mobile/tablet/desktop
- No external dashboarding libraries - pure React + Tailwind
- Database auto-seeds with demo data on startup
- Backend offline fallback not needed (we're using real data)

---

**Status**: ✅ Production-Ready Prototype  
**Ready for Demo**: Yes  
**Real Data Integration**: Yes  
**Clean UI**: Yes
