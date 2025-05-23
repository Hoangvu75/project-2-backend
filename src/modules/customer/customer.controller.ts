import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { CustomerService, CustomerFilterOptions } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CustomerStatus, PreferredChannel } from './customer.entity';

@Controller('customers')
@UseGuards(JwtAuthGuard) // Protect all customer endpoints
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createCustomerDto: CreateCustomerDto) {
    return await this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: CustomerStatus,
    @Query('preferredChannel') preferredChannel?: PreferredChannel,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('marketingOptIn') marketingOptIn?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filterOptions: CustomerFilterOptions = {
      status,
      preferredChannel,
      city,
      country,
      marketingOptIn: marketingOptIn === 'true' ? true : marketingOptIn === 'false' ? false : undefined,
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    };

    return await this.customerService.findAll(filterOptions);
  }

  @Get('stats')
  async getStats() {
    return await this.customerService.getCustomerStats();
  }

  @Get('active')
  async getActiveCustomers() {
    return await this.customerService.getActiveCustomers();
  }

  @Get('marketing-opt-in')
  async getMarketingOptInCustomers() {
    return await this.customerService.getMarketingOptInCustomers();
  }

  @Get('by-channel/:channel')
  async getCustomersByChannel(@Param('channel') channel: PreferredChannel) {
    return await this.customerService.getCustomersByChannel(channel);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return await this.customerService.findByEmail(email);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.customerService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customerService.update(id, updateCustomerDto);
  }

  @Patch(':id/contact')
  async updateLastContactDate(@Param('id', ParseIntPipe) id: number) {
    return await this.customerService.updateLastContactDate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.customerService.remove(id);
  }
} 