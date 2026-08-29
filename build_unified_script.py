# Script to analyze and rebuild unified script.js
import re

with open('script.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# Let's check how the database connection is currently defined:
pattern = r"const SQE_URL = 'https://xgkjxvljdhpniakgzatf\.supabase\.co';"
print("Matches SQE_URL:", len(re.findall(pattern, js)))

# Target new Supabase connection:
# MASTER_SUPABASE_URL = 'https://brqkewrqaaxsbszgzaqz.supabase.co'
# MASTER_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJycWtld3JxYWF4c2Jzemd6YXF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3OTI5NjAsImV4cCI6MjEwMzM2ODk2MH0.HXFL09xAWWW9Ss6WQnFWk8imhOoxYBQ-_jUzhHsrRTM'
