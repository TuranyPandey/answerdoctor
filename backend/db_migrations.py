import sqlite3
import os

def run_migrations():
    """Ensure all missing columns exist in SQLite database without losing existing data."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_paths = [
        os.path.join(base_dir, "answerdoctor.db"),
        os.path.join(base_dir, "backend", "answerdoctor.db"),
        "answerdoctor.db"
    ]
    for db_path in db_paths:
        if not os.path.exists(db_path):
            continue

        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()

            # Check 'users' columns
            c.execute("PRAGMA table_info(users)")
            user_cols = [r[1] for r in c.fetchall()]

            new_user_cols = [
                ("is_verified", "BOOLEAN DEFAULT 0"),
                ("verification_status", "VARCHAR DEFAULT 'Standard Account'"),
                ("institution", "VARCHAR"),
            ]
            for col_name, col_type in new_user_cols:
                if col_name not in user_cols:
                    try:
                        c.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
                        print(f"Added missing column '{col_name}' to users table.")
                    except Exception as e:
                        print(f"Notice adding column '{col_name}': {e}")

            # Check 'scripts' columns
            c.execute("PRAGMA table_info(scripts)")
            script_cols = [r[1] for r in c.fetchall()]

            new_script_cols = [
                ("cvr", "FLOAT"),
                ("clarity_score", "FLOAT"),
                ("overall_correctness", "VARCHAR"),
                ("overall_feedback", "TEXT"),
            ]
            for col_name, col_type in new_script_cols:
                if col_name not in script_cols:
                    try:
                        c.execute(f"ALTER TABLE scripts ADD COLUMN {col_name} {col_type}")
                        print(f"Added missing column '{col_name}' to scripts table.")
                    except Exception as e:
                        print(f"Notice adding column '{col_name}': {e}")

            # Check 'grading_steps' columns
            c.execute("PRAGMA table_info(grading_steps)")
            step_cols = [r[1] for r in c.fetchall()]

            new_step_cols = [
                ("marks_status", "VARCHAR"),
                ("confidence_score", "FLOAT DEFAULT 0.90"),
            ]
            for col_name, col_type in new_step_cols:
                if col_name not in step_cols:
                    try:
                        c.execute(f"ALTER TABLE grading_steps ADD COLUMN {col_name} {col_type}")
                        print(f"Added missing column '{col_name}' to grading_steps table.")
                    except Exception as e:
                        print(f"Notice adding column '{col_name}': {e}")

            conn.commit()
            conn.close()
        except Exception as err:
            print(f"Migration check error for {db_path}: {err}")

if __name__ == "__main__":
    run_migrations()
