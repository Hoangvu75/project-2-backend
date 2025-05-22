# NestJS Metrics with Prometheus and Grafana

This project demonstrates how to set up a NestJS application with Prometheus metrics collection and Grafana visualization, deployed to Kubernetes.

## Features

- NestJS application with custom API endpoints
- Prometheus metrics integration using `@willsoto/nestjs-prometheus`
- Custom metrics for HTTP requests (count and duration)
- Health check endpoint
- Complete Kubernetes deployment setup
- Grafana dashboard for visualizing metrics

## Prerequisites

- Docker
- Kubernetes cluster (local like Minikube/Docker Desktop or remote)
- kubectl configured to access your cluster
- Node.js and npm (for local development)

## Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run start:dev
```

The application will be available at http://localhost:3000.

### Available Endpoints

- `GET /` - Basic hello world response
- `GET /slow` - Endpoint that simulates a slow response (1 second delay)
- `POST /data` - Endpoint that accepts JSON data
- `GET /health` - Health check endpoint provided by Terminus
- `GET /metrics` - Prometheus metrics endpoint

## Metrics

The application exposes the following custom metrics:

- `http_request_total` - Counter for total HTTP requests (labels: method, route, status)
- `http_request_duration_seconds` - Histogram for HTTP request duration (labels: method, route)
- `app_version_info` - Gauge for application version information

Additionally, default Node.js metrics are collected through the Prometheus client.

## Kubernetes Deployment

### Structure

The `k8s` directory contains all Kubernetes manifests:

- `namespace.yaml` - Creates the `nestjs-metrics` namespace
- `nestjs-deployment.yaml` - Deployment for the NestJS application
- `nestjs-service.yaml` - Service for the NestJS application
- `prometheus-configmap.yaml` - ConfigMap for Prometheus configuration
- `prometheus-deployment.yaml` - Deployment for Prometheus
- `prometheus-service.yaml` - Service for Prometheus
- `grafana-configmap.yaml` - ConfigMaps for Grafana dashboards and datasources
- `grafana-deployment.yaml` - Deployment for Grafana
- `grafana-service.yaml` - Service for Grafana

### Deployment

Use the included deployment script:

```bash
./deploy.sh
```

This script will:
1. Build the Docker image for the NestJS application
2. Apply all Kubernetes manifests
3. Set up port forwarding for local access to the services

After running the script, the following services will be available:

- NestJS application: http://localhost:8080
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (credentials: admin/admin)

## Architecture

```
                              ┌──────────────┐
                              │              │
                              │   Grafana    │
                              │              │
                              └──────┬───────┘
                                     │
                                     │ query
                                     │
                                     ▼
┌──────────────┐            ┌──────────────┐
│              │            │              │
│  NestJS App  │─scrape────▶│  Prometheus  │
│              │            │              │
└──────────────┘            └──────────────┘
```

## License

MIT
