import requests

BASE_URL = "http://127.0.0.1:8008/api"

def test_full_pipeline():
    print("--- 1. Testing Root Status ---")
    r = requests.get("http://127.0.0.1:8008/")
    assert r.status_code == 200
    print("Root API response:", r.json())

    print("\n--- 2. Testing Assignment Details & Rubric Decomposer ---")
    r = requests.get(f"{BASE_URL}/assignments/1")
    assert r.status_code == 200
    ass_data = r.json()
    print(f"Assignment Title: {ass_data['title']}")
    print(f"Decomposed Rubric Units Count: {len(ass_data['rubric_units'])}")
    for u in ass_data['rubric_units']:
        print(f"  - [{u['category'].upper()}] {u['label']} (Weight: {u['weight']})")

    print("\n--- 3. Testing Class Analytics & Scikit-Learn Error Clusters ---")
    r = requests.get(f"{BASE_URL}/analytics/assignment/1")
    assert r.status_code == 200
    ana_data = r.json()
    print(f"Cohort Total Scripts: {ana_data['cohort_total_scripts']}")
    print(f"Class Average RAS: {ana_data['class_average_ras']}%")
    print("Weakness Heatmap Summary:")
    for h in ana_data['weakness_heatmap']:
        print(f"  - {h['label']}: Pass Rate {h['pass_rate_pct']}% ({h['weakness_level']})")
    print("Error Misconception Clusters:")
    for c in ana_data['error_clusters']:
        print(f"  - [{c['percentage']}% Cohort] {c['cluster_name']}: {c['description']}")

    print("\n--- 4. Testing Malpractice Radar (CMI >= 0.88 Flagging) ---")
    r = requests.get(f"{BASE_URL}/malpractice/assignment/1")
    assert r.status_code == 200
    mal_data = r.json()
    print(f"Total Flagged Collusion Pairs: {mal_data['total_flagged_pairs']}")
    for pair in mal_data['collusion_pairs']:
        print(f"  - Pair: {pair['student_a_name']} ({pair['student_a_reg']}) <-> {pair['student_b_name']} ({pair['student_b_reg']})")
        print(f"    CMI Score: {pair['cmi_score']} (CosSim: {pair['cos_sim']}, ErrorPatternMatch: {pair['error_match_score']})")
        print(f"    Reason: {pair['flagged_reason']}")

    print("\n--- 5. Testing Student Submission & Reasoning Map ---")
    r = requests.get(f"{BASE_URL}/submissions/student/2/assignment/1")
    assert r.status_code == 200
    sub_data = r.json()
    print(f"Student Name: {sub_data['student_name']} ({sub_data['register_number']})")
    print(f"Total RAS Score: {sub_data['total_ras_score']}%")
    print("Reasoning Map Nodes:")
    for node in sub_data['reasoning_map']:
        print(f"  - Step {node['step_number']} [{node['node_type']}]: {node['title']} -> Status: {node['status']} (Reasoning Break: {node['has_reasoning_break']})")

    print("\n--- 6. Testing Step-Level Retry Practice Drill ---")
    weak_step = [s for s in sub_data['steps'] if s['status'] in ('WEAK', 'MISSING')][0]
    print(f"Testing Retry for Step ID {weak_step['id']} (Step {weak_step['step_number']})...")
    retry_payload = {"step_id": weak_step['id'], "selected_option": "A"}
    r = requests.post(f"{BASE_URL}/submissions/retry", json=retry_payload)
    assert r.status_code == 200
    retry_res = r.json()
    print(f"Retry Result: Correct? {retry_res['is_correct']}, New RAS Score: {retry_res['new_total_ras']}%")
    print(f"Explanation: {retry_res['explanation']}")

    print("\n[SUCCESS] ALL END-TO-END TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_pipeline()
