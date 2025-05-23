import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetricsModule } from './modules/metrics/metrics.module';
import { MetricsMiddleware } from './modules/metrics/metrics.middleware';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomerModule } from './modules/customer/customer.module';
import { User } from './modules/user/user.entity';
import { Customer } from './modules/customer/customer.entity';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { Product } from './modules/product/product.entity';
import { Order } from './modules/order/order.entity';
import { OrderItem } from './modules/order/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Customer, Product, Order, OrderItem],
      synchronize: true, // Only for development
    }),
    MetricsModule,
    UserModule,
    AuthModule,
    CustomerModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply metrics middleware to all routes
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
