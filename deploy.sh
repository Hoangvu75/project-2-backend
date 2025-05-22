#!/bin/bash
set -e

# Build and push the Docker image
echo "Building Docker image..."
docker build -t nestjs-metrics:latest .

# Create namespace and apply Kubernetes configurations
echo "Applying Kubernetes configurations..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/prometheus-configmap.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/prometheus-service.yaml
kubectl apply -f k8s/grafana-configmap.yaml
kubectl apply -f k8s/grafana-deployment.yaml
kubectl apply -f k8s/grafana-service.yaml
kubectl apply -f k8s/nestjs-deployment.yaml
kubectl apply -f k8s/nestjs-service.yaml

echo "Creating port-forwards for local access..."
echo "Prometheus will be available at http://localhost:9090"
echo "Grafana will be available at http://localhost:3000"
echo "NestJS application will be available at http://localhost:8080"

# Port-forward the services (run in background)
kubectl -n nestjs-metrics port-forward svc/prometheus 9090:9090 &
kubectl -n nestjs-metrics port-forward svc/grafana 3000:80 &
kubectl -n nestjs-metrics port-forward svc/nestjs-app 8080:80 &

echo "Setup complete!"
echo "Grafana credentials: admin/admin" 