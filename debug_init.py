
import os
import sys

# Mock Vercel environment
os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL', 'postgres://mock:mock@localhost:5432/mock')

try:
    # Simulate path insertion correctly for local root run
    sys.path.append(os.getcwd())
    print(f"Path configured: {sys.path[-1]}")
     
    # Simulate import
    from api._lib.db import get_db_url, init_tables
    print("Import successful.")
    
    url = get_db_url()
    print(f"DB URL Processed: {url}")
    
    # We can't easily run init_tables without real DB, but we verified syntax by importing
    print("Syntax check passed.")
    
except Exception as e:
    print(f"CRASH: {e}")
    import traceback
    traceback.print_exc()
