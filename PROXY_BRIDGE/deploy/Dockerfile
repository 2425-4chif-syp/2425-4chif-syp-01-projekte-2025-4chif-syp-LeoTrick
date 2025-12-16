FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install mitmproxy
RUN pip install --no-cache-dir mitmproxy

# Copy proxy script
COPY ../bridgebase-protocol/src/website/website_modifier.py .

# Expose proxy port
EXPOSE 8081

# Run mitmproxy
CMD ["mitmproxy", "-p", "8081", "--listen-host", "0.0.0.0", "-s", "website_modifier.py"]
