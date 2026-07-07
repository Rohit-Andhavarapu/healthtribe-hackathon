import os
import re
import json

def scan_dir(path, ext):
    results = []
    for root, dirs, files in os.walk(path):
        if 'node_modules' in root or 'venv' in root or '__pycache__' in root or '.git' in root:
            continue
        for file in files:
            if file.endswith(ext):
                results.append(os.path.join(root, file))
    return results

def count_todos(files):
    todo_count = 0
    todos = []
    for f in files:
        try:
            with open(f, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if 'TODO' in line or 'FIXME' in line or 'NotImplementedError' in line:
                        todos.append(f"{f}:{i+1}:{line.strip()}")
                        todo_count += 1
        except Exception:
            pass
    return todo_count, todos

def check_stubs(files):
    stubs = []
    for f in files:
        if not f.endswith('.py'): continue
        try:
            with open(f, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if line.strip() == 'pass' or 'raise NotImplementedError' in line:
                        stubs.append(f"{f}:{i+1}:{line.strip()}")
        except Exception:
            pass
    return stubs

print("--- BACKEND PYTHON FILES ---")
py_files = scan_dir('backend/app', '.py')
print(f"Total .py files: {len(py_files)}")

todos_count, todos = count_todos(py_files)
print(f"TODOs in backend: {todos_count}")

stubs = check_stubs(py_files)
print(f"Stubs in backend: {len(stubs)}")

print("\n--- FRONTEND TS/TSX FILES ---")
ts_files = scan_dir('apps/web/src', ('.ts', '.tsx'))
print(f"Total .ts/.tsx files: {len(ts_files)}")

todos_count_ts, todos_ts = count_todos(ts_files)
print(f"TODOs in frontend: {todos_count_ts}")

print("\n--- SAMPLE TODOS BACKEND ---")
for t in todos[:20]: print(t)

print("\n--- SAMPLE STUBS BACKEND ---")
for s in stubs[:20]: print(s)

print("\n--- SAMPLE TODOS FRONTEND ---")
for t in todos_ts[:30]: print(t)
