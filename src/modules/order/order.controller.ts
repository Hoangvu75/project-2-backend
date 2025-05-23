import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from './enums/order-status.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(req.user.id, createOrderDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.orderService.findAll();
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  findMyOrders(@Request() req) {
    return this.orderService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Request() req, @Param('id') id: string) {
    const order = await this.orderService.findOne(+id);
    
    // Only allow admins or the order owner to view the order
    if (req.user.roles?.includes('admin') || order.userId === req.user.id) {
      return order;
    }
    throw new BadRequestException('You do not have permission to view this order');
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@Param('id') id: string, @Body() updateOrderDto: { status: OrderStatus }) {
    return this.orderService.updateStatus(+id, updateOrderDto.status);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    const order = await this.orderService.findOne(+id);
    
    // Only allow admins or the order owner to update the order
    if (req.user.roles?.includes('admin') || order.userId === req.user.id) {
      return this.orderService.update(+id, updateOrderDto);
    }
    throw new BadRequestException('You do not have permission to update this order');
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Request() req, @Param('id') id: string) {
    const order = await this.orderService.findOne(+id);
    
    // Only allow admins or the order owner to cancel the order
    if (req.user.roles?.includes('admin') || order.userId === req.user.id) {
      return this.orderService.cancel(+id);
    }
    throw new BadRequestException('You do not have permission to cancel this order');
  }
} 