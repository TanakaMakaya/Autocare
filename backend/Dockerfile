FROM python:3.12.8-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y gcc libpq-dev
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt gunicorn
COPY . .
EXPOSE 10000
CMD python manage.py migrate --noinput && gunicorn core.wsgi:application --bind 0.0.0.0:10000