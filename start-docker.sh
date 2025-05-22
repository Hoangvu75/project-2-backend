#!/bin/bash
set -e

# Ensure Grafana directories exist
mkdir -p grafana/datasources
mkdir -p grafana/dashboards

# Start all services
docker-compose down && docker-compose up -d

echo "Services are starting..."
echo "NestJS application: http://localhost:3000"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3001 (login with admin/admin)"
echo ""
echo "Dashboards will be automatically loaded."
echo "To view logs, run: docker-compose logs -f"
echo "To stop all services, run: docker-compose down" 