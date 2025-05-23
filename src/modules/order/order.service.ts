import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ProductService } from '../product/product.service';
import { OrderStatus } from './enums/order-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private productService: ProductService,
    private dataSource: DataSource,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
    // Start a transaction to ensure inventory and order are in sync
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create the order
      const order = new Order();
      order.userId = userId;
      order.shippingAddress = createOrderDto.shippingAddress;
      order.billingAddress = createOrderDto.billingAddress || createOrderDto.shippingAddress;
      order.status = OrderStatus.PENDING;
      order.totalAmount = 0;

      // Save the order first to get its ID
      const savedOrder = await queryRunner.manager.save(order);

      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      // Process each item in the order
      for (const item of createOrderDto.items) {
        const product = await this.productService.findOne(item.productId);
        
        // Check inventory
        if (product.inventory < item.quantity) {
          throw new BadRequestException(`Not enough inventory for product: ${product.name}`);
        }

        // Create order item
        const orderItem = new OrderItem();
        orderItem.orderId = savedOrder.id;
        orderItem.productId = product.id;
        orderItem.quantity = item.quantity;
        orderItem.price = product.price;
        orderItem.subtotal = product.price * item.quantity;
        orderItems.push(orderItem);

        // Update product inventory
        await queryRunner.manager.update(
          'products',
          { id: product.id },
          { inventory: product.inventory - item.quantity }
        );

        totalAmount += orderItem.subtotal;
      }

      // Save all order items
      await queryRunner.manager.save(OrderItem, orderItems);

      // Update order total amount
      savedOrder.totalAmount = totalAmount;
      await queryRunner.manager.save(Order, savedOrder);

      // Commit the transaction
      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (err) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: number): Promise<Order[]> {
    const query: any = {
      relations: ['items', 'items.product', 'user'],
    };

    if (userId) {
      query.where = { userId };
    }

    return this.orderRepository.find(query);
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Only allow updating the status if it's the only field provided
    if (updateOrderDto.status && Object.keys(updateOrderDto).length === 1) {
      return this.updateStatus(id, updateOrderDto.status);
    }

    // Do not allow updating items directly - that would need a specific endpoint
    // Only update shipping/billing address
    if (updateOrderDto.shippingAddress) {
      order.shippingAddress = updateOrderDto.shippingAddress;
    }
    if (updateOrderDto.billingAddress) {
      order.billingAddress = updateOrderDto.billingAddress;
    }

    return this.orderRepository.save(order);
  }

  async cancel(id: number): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await this.findOne(id);

      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException('Only pending orders can be cancelled');
      }

      // Restore inventory for each product
      for (const item of order.items) {
        await queryRunner.manager.update(
          'products',
          { id: item.productId },
          { inventory: () => `inventory + ${item.quantity}` }
        );
      }

      // Update order status
      order.status = OrderStatus.CANCELLED;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
} 