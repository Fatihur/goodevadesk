import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { TicketCategory, TicketStatus } from '@prisma/client';

export class CreateTicketDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  customer_email!: string;

  @ApiProperty({ example: 'Payment failed' })
  @IsString()
  @MinLength(1)
  @MaxLength(240)
  subject!: string;

  @ApiProperty({ example: 'My payment was charged but my subscription is inactive.' })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message!: string;
}

export class TicketListQueryDto {
  @ApiPropertyOptional({ enum: TicketStatus })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({ enum: TicketCategory })
  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({ description: 'Searches subject, customer email, and message.' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ enum: TicketStatus })
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
