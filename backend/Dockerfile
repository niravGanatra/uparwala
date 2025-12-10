# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH /app
ENV DJANGO_SETTINGS_MODULE config.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt /app/
COPY requirements-production.txt /app/
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install -r requirements-production.txt

# Copy project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["/bin/sh", "-c", "python manage.py migrate && python manage.py createsuperuser_if_none_exists && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --log-file -"]
