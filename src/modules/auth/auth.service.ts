import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: User; access_token: string }> {
    const user = await this.userService.create(createUserDto);
    const access_token = this.generateToken(user);
    
    return { user, access_token };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string }> {
    const { email, password } = loginDto;
    const user = await this.userService.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const access_token = this.generateToken(user);
    return { user, access_token };
  }

  private generateToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    return this.jwtService.sign(payload);
  }

  async validateToken(payload: any): Promise<User> {
    return await this.userService.findById(payload.sub);
  }
} 