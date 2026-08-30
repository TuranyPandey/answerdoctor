import subprocess
import sys
import time

print("=" * 60)
print("Starting AnswerDoctor — Full Stack AI Platform")
print("=" * 60)

# Start FastAPI backend
backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"]
print("Launching FastAPI backend on http://127.0.0.1:8000 ...")
backend_proc = subprocess.Popen(backend_cmd, cwd="backend")

time.sleep(2)

# Start Vite frontend
frontend_cmd = ["npx", "vite", "--port", "5173"]
print("Launching Vite frontend on http://localhost:5173 ...")
frontend_proc = subprocess.Popen(frontend_cmd, shell=True)

print("\nApp running!")
print("Backend API:  http://127.0.0.1:8000")
print("Frontend App: http://localhost:5173")
print("\nPress Ctrl+C to stop servers.\n")

try:
    backend_proc.wait()
    frontend_proc.wait()
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_proc.terminate()
    frontend_proc.terminate()
