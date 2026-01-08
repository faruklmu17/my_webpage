# Base Python image
FROM python:3.11-slim

# Ollama environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_PORT=11434

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Create working directory
WORKDIR /app

# Copy requirements and app code
COPY requirements.txt /app/requirements.txt
COPY app.py /app/app.py
COPY cache_config.json /app/cache_config.json
COPY faruk_context.md /app/faruk_context.md

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Ollama + Gradio ports
EXPOSE 11434
EXPOSE 7860

# Start Ollama server, pull model, then launch Gradio
# Using generic 'llama3.2' as the base model and injecting context dynamically in app.py
CMD bash -lc "\
    ollama serve & \
    sleep 10 && \
    ollama pull llama3.2 && \
    python app.py \
"
