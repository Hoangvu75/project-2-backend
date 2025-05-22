import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_total')
    private readonly requestCounter: Counter<string>,
    
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
    
    @InjectMetric('app_version_info')
    private readonly appVersionGauge: Gauge<string>,
  ) {
    // Set application version (example)
    this.appVersionGauge.labels({ version: '1.0.0' }).set(1);
  }

  recordRequest(method: string, route: string, status: string): void {
    const normalizedRoute = this.normalizeRoutePath(route);
    this.requestCounter.labels({ method, route: normalizedRoute, status }).inc();
  }

  recordRequestDuration(method: string, route: string, duration: number): void {
    const normalizedRoute = this.normalizeRoutePath(route);
    this.requestDuration.labels({ method, route: normalizedRoute }).observe(duration);
  }

  private normalizeRoutePath(path: string): string {
    if (path.includes('/slow')) return '/slow';
    if (path.includes('/metrics')) return '/metrics';
    if (path.includes('/health')) return '/health';
    if (path.includes('/data')) return '/data';
    
    return '/';
  }
} 