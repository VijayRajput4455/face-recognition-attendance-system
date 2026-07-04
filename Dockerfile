# ======================================================
# Base Image
# Python 3.11 Slim
# Smaller than the full Python image
# ======================================================
FROM python:3.11-slim

# ======================================================
# Environment Variables
# ======================================================
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# ======================================================
# Working Directory
# ======================================================
WORKDIR /app

# ======================================================
# Install Linux Dependencies
# Required by OpenCV and other AI libraries
# ======================================================
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ======================================================
# Upgrade pip
# ======================================================
RUN pip install --upgrade pip

# ======================================================
# Install Python Dependencies
# ======================================================
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# ======================================================
# Copy Application
# ======================================================
COPY . .

# Run as non-root user for better container security.
RUN useradd --create-home --shell /bin/bash appuser && chown -R appuser:appuser /app
USER appuser

# ======================================================
# Expose FastAPI Port
# ======================================================
EXPOSE 8000

# ======================================================
# Run FastAPI
# ======================================================
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]