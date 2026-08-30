"""HTTP smoke test for the authenticated AnswerDoctor workflow."""
import requests


BASE_URL = "http://127.0.0.1:8008/api"


def expect(response, status=200):
    assert response.status_code == status, f"{response.status_code}: {response.text}"
    return response.json()


def auth_headers(account):
    return {"Authorization": f"Bearer {account['access_token']}"}


def test_full_pipeline():
    print("--- 1. Testing root status ---")
    root = expect(requests.get("http://127.0.0.1:8008/"))
    assert root["status"] == "active"

    print("--- 2. Registering teacher and student accounts ---")
    teacher = expect(requests.post(f"{BASE_URL}/auth/register", json={
        "email": "http-teacher@example.edu", "full_name": "HTTP Teacher",
        "password": "teacher-pass-123", "role": "teacher",
    }), 201)
    student = expect(requests.post(f"{BASE_URL}/auth/register", json={
        "email": "http-student@example.edu", "full_name": "HTTP Student",
        "password": "student-pass-123", "register_number": "HTTP001",
        "role": "student",
    }), 201)
    teacher_headers = auth_headers(teacher)
    student_headers = auth_headers(student)

    print("--- 3. Creating and joining a classroom ---")
    classroom = expect(requests.post(
        f"{BASE_URL}/classrooms/create",
        json={"name": "Physics A", "subject": "Physics"}, headers=teacher_headers,
    ), 201)
    joined = expect(requests.post(
        f"{BASE_URL}/classrooms/join", json={"code": classroom["code"]},
        headers=student_headers,
    ))
    assert joined["classroom"]["id"] == classroom["id"]
    assert expect(requests.get(f"{BASE_URL}/classrooms", headers=teacher_headers))[0]["id"] == classroom["id"]
    assert isinstance(expect(requests.get(f"{BASE_URL}/pyq", headers=student_headers)), list)

    print("--- 4. Creating an assignment and decomposed rubric ---")
    assignment = expect(requests.post(
        f"{BASE_URL}/assignments/create",
        json={
            "title": "Motion Test", "subject": "Physics",
            "classroom_id": classroom["id"],
            "answer_key_text": (
                "State Newton's second law and define force.\n"
                "Use the formula F = m * a.\n"
                "Final answer: a = F / m."
            ),
            "total_marks": 10,
        },
        headers=teacher_headers,
    ), 201)
    details = expect(requests.get(
        f"{BASE_URL}/assignments/{assignment['id']}", headers=teacher_headers,
    ))
    assert len(details["rubric_units"]) == 3

    print("--- 5. Evaluating and persisting a student response ---")
    evaluated = expect(requests.post(
        f"{BASE_URL}/submissions/evaluate",
        json={
            "assignment_id": assignment["id"], "student_name": student["full_name"],
            "register_number": student["register_number"],
            "steps": [
                {"step_number": 1, "student_text": "I skipped the law."},
                {"step_number": 2, "student_text": "F = m * a"},
                {"step_number": 3, "student_text": "I am not sure."},
            ],
        },
        headers=teacher_headers,
    ))
    assert evaluated["submission_id"]
    assert len(evaluated["steps"]) == 3

    print("--- 6. Testing analytics and malpractice reports ---")
    analytics = expect(requests.get(
        f"{BASE_URL}/analytics/assignment/{assignment['id']}", headers=teacher_headers,
    ))
    assert analytics["cohort_total_scripts"] == 1
    malpractice = expect(requests.get(
        f"{BASE_URL}/malpractice/assignment/{assignment['id']}", headers=teacher_headers,
    ))
    assert malpractice["total_flagged_pairs"] == 0

    print("--- 7. Testing student results and retry flow ---")
    submission = expect(requests.get(
        f"{BASE_URL}/submissions/student/{student['id']}/latest", headers=student_headers,
    ))
    assert submission["assignment_title"] == "Motion Test"
    forbidden = requests.get(
        f"{BASE_URL}/submissions/student/{teacher['id']}/latest", headers=student_headers,
    )
    assert forbidden.status_code == 403
    weak_step = next(step for step in submission["steps"] if step["status"] in ("WEAK", "MISSING"))
    retried = expect(requests.post(
        f"{BASE_URL}/submissions/retry",
        json={"step_id": weak_step["id"], "selected_option": "A"},
        headers=student_headers,
    ))
    assert "is_correct" in retried

    print("[SUCCESS] Authenticated HTTP pipeline passed")


if __name__ == "__main__":
    test_full_pipeline()
