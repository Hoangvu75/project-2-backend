import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Customer, CustomerStatus, PreferredChannel } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface CustomerFilterOptions {
  status?: CustomerStatus;
  preferredChannel?: PreferredChannel;
  city?: string;
  country?: string;
  marketingOptIn?: boolean;
  search?: string; // Search in name, email, phone
  page?: number;
  limit?: number;
}

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if customer with email already exists
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email }
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Convert date strings to Date objects
    const customerData = {
      ...createCustomerDto,
      dateOfBirth: createCustomerDto.dateOfBirth ? new Date(createCustomerDto.dateOfBirth) : undefined,
      customerSince: createCustomerDto.customerSince ? new Date(createCustomerDto.customerSince) : new Date(),
    };

    const customer = this.customerRepository.create(customerData);
    return await this.customerRepository.save(customer);
  }

  async findAll(filterOptions: CustomerFilterOptions = {}): Promise<{ customers: Customer[]; total: number; page: number; totalPages: number }> {
    const { 
      status, 
      preferredChannel, 
      city, 
      country, 
      marketingOptIn, 
      search, 
      page = 1, 
      limit = 10 
    } = filterOptions;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (preferredChannel) {
      queryBuilder.andWhere('customer.preferredChannel = :preferredChannel', { preferredChannel });
    }

    if (city) {
      queryBuilder.andWhere('customer.city = :city', { city });
    }

    if (country) {
      queryBuilder.andWhere('customer.country = :country', { country });
    }

    if (marketingOptIn !== undefined) {
      queryBuilder.andWhere('customer.marketingOptIn = :marketingOptIn', { marketingOptIn });
    }

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName LIKE :search OR customer.lastName LIKE :search OR customer.email LIKE :search OR customer.phone LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by creation date (newest first)
    queryBuilder.orderBy('customer.createdAt', 'DESC');

    const [customers, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      customers,
      total,
      page,
      totalPages
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { email } });
    
    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check if email is being updated and if it conflicts with existing customer
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email }
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    // Convert date strings to Date objects if provided
    const updateData = {
      ...updateCustomerDto,
      dateOfBirth: updateCustomerDto.dateOfBirth ? new Date(updateCustomerDto.dateOfBirth) : undefined,
      customerSince: updateCustomerDto.customerSince ? new Date(updateCustomerDto.customerSince) : undefined,
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await this.customerRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async updateLastContactDate(id: number): Promise<Customer> {
    await this.customerRepository.update(id, { lastContactDate: new Date() });
    return await this.findOne(id);
  }

  async getCustomersByChannel(channel: PreferredChannel): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { preferredChannel: channel }
    });
  }

  async getActiveCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { status: CustomerStatus.ACTIVE }
    });
  }

  async getMarketingOptInCustomers(): Promise<Customer[]> {
    return await this.customerRepository.find({
      where: { marketingOptIn: true }
    });
  }

  async getCustomerStats(): Promise<{
    total: number;
    byStatus: Record<CustomerStatus, number>;
    byChannel: Record<PreferredChannel, number>;
    marketingOptIn: number;
  }> {
    const total = await this.customerRepository.count();
    
    const statusCounts = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.status, COUNT(*) as count')
      .groupBy('customer.status')
      .getRawMany();

    const channelCounts = await this.customerRepository
      .createQueryBuilder('customer')
      .select('customer.preferredChannel, COUNT(*) as count')
      .groupBy('customer.preferredChannel')
      .getRawMany();

    const marketingOptIn = await this.customerRepository.count({
      where: { marketingOptIn: true }
    });

    const byStatus = {} as Record<CustomerStatus, number>;
    statusCounts.forEach(item => {
      byStatus[item.customer_status] = parseInt(item.count);
    });

    const byChannel = {} as Record<PreferredChannel, number>;
    channelCounts.forEach(item => {
      byChannel[item.customer_preferredChannel] = parseInt(item.count);
    });

    return {
      total,
      byStatus,
      byChannel,
      marketingOptIn
    };
  }
} 