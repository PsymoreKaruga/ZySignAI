

#!/usr/bin/env bash
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --no-input
```

Add these to `backend/requirements.txt`:
```
pydub==0.25.1
av==13.1.0