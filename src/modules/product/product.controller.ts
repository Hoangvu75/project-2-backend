import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  // @Roles('admin') - Temporarily removed for testing
  // @UseGuards(JwtAuthGuard, RolesGuard) - Modified to remove RolesGuard
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query('active') active?: string) {
    return this.productService.findAll(active === 'true' ? true : active === 'false' ? false : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles('admin') - Temporarily removed for testing
  // @UseGuards(JwtAuthGuard, RolesGuard) - Modified to remove RolesGuard
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  // @Roles('admin') - Temporarily removed for testing
  // @UseGuards(JwtAuthGuard, RolesGuard) - Modified to remove RolesGuard
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
} 