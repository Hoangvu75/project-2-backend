import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(MetricsMiddleware.name);
  
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime();
    const { method, originalUrl } = req;
    
    // Get the path without query parameters
    const path = originalUrl.split('?')[0];
    
    this.logger.log(`Incoming request: ${method} ${path}`);

    // Record response after it's sent
    res.on('finish', () => {
      const status = res.statusCode.toString();
      this.logger.log(`Recording metrics for: ${method} ${path} with status ${status}`);
      this.metricsService.recordRequest(method, path, status);
      
      // Calculate duration in seconds
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds + nanoseconds / 1e9;
      this.metricsService.recordRequestDuration(method, path, duration);
    });

    next();
  }
} 