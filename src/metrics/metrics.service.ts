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
    // Handle root path
    if (path === '/' || path === '') return '/';
    
    // Remove query parameters and fragments
    const cleanPath = path.split('?')[0].split('#')[0];
    
    // Split path into segments
    const segments = cleanPath.split('/').filter(segment => segment !== '');
    
    if (segments.length === 0) return '/';
    
    // For single segment routes, return as is
    if (segments.length === 1) {
      return `/${segments[0]}`;
    }
    
    // For multi-segment routes, normalize based on common patterns
    const baseRoute = segments[0];
    const secondSegment = segments[1];
    
    // Handle common REST API patterns
    if (this.isNumeric(secondSegment) || this.isUUID(secondSegment)) {
      // Pattern: /users/123 -> /users/:id
      return `/${baseRoute}/:id`;
    }
    
    // For other multi-segment routes, return base + action
    // Pattern: /auth/login -> /auth/login, /users/profile -> /users/profile
    return `/${baseRoute}/${secondSegment}`;
  }
  
  private isNumeric(str: string): boolean {
    return !isNaN(Number(str)) && !isNaN(parseFloat(str));
  }
  
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }
} 