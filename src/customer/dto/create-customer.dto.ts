import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';
import { CustomerStatus, PreferredChannel } from '../customer.entity';

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;

  @IsEnum(PreferredChannel)
  @IsOptional()
  preferredChannel?: PreferredChannel;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  jobTitle?: string;

  @IsString()
  @IsOptional()
  socialMediaHandle?: string;

  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  marketingOptIn?: boolean;

  @IsDateString()
  @IsOptional()
  customerSince?: string;
} 