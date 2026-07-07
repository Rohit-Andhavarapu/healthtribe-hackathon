import os
import ast

modules_dir = os.path.join(os.path.dirname(__file__), "..", "app", "modules")
for root, dirs, files in os.walk(modules_dir):
    for file in files:
        if file == "router.py" or file == "api.py":
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    # Check decorators
                    is_route = False
                    for dec in node.decorator_list:
                        if isinstance(dec, ast.Call) and getattr(dec.func, 'attr', '') in ['get', 'post', 'put', 'delete', 'patch']:
                            is_route = True
                    if is_route:
                        args = [a.arg for a in node.args.args]
                        print(f"{file}::{node.name}({', '.join(args)})")
