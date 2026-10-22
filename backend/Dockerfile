# Use the exact Python version we want
FROM python:3.12.8-slim

# Prevent Python from writing .pyc files and buffering output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install system dependencies needed for PostgreSQL
RUN apt-get update && apt-get install -y gcc libpq-dev

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt gunicorn

# Copy the rest of the backend code
COPY . .

# Expose the port Render expects
EXPOSE 10000

# Start the server
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:10000"]