import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('slow')
  async getSlowResponse(): Promise<string> {
    // Simulate a slow response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'This was a slow response!';
  }

  @Post('data')
  createData(@Body() data: any): any {
    return {
      received: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
