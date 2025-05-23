import { Controller, Get } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  HealthIndicatorResult 
} from '@nestjs/terminus';

@Controller('health')
export class MetricsController {
  constructor(
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        return {
          api: {
            status: 'up',
          },
        };
      },
    ]);
  }
} 