# Use an official Python image
FROM python:3.11

# Set the working directory inside the container
WORKDIR /app

# Copy only requirements.txt first (for caching)
COPY src/app/requirements.txt .

# Install dependencies
RUN pip install --upgrade --no-cache-dir -r requirements.txt

# Copy the `src/` folder while preserving its structure
COPY src /app/src

# Expose the required port
EXPOSE 8080

# Set the PYTHONPATH to ensure `src` is found
ENV PYTHONPATH=/app

# Run the FastAPI application with Uvicorn
CMD ["uvicorn", "src.app.banking_agents_api:app", "--host", "0.0.0.0", "--port", "8080"]