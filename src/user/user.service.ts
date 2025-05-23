import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, firstName, lastName } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    
    // Remove password from response
    delete savedUser.password;
    return savedUser;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { email } 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { id } 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password from response
    delete user.password;
    return user;
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        delete user.password;
        return user;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }
} 