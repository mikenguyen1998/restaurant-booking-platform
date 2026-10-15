import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import type {
  BookingContact,
  CreateBookingRequest,
  RescheduleBookingRequest,
} from '@restaurant-platform/shared';

export class BookingContactDto implements BookingContact {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsOptional() @IsEmail() email?: string;
}
export class CreateBookingDto implements CreateBookingRequest {
  @IsUUID() restaurantId: string;
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() slot: string;
  @IsInt() @Min(1) partySize: number;
  @IsOptional() @IsIn(['TABLE', 'VIP_ROOM']) preferredResourceType?:
    'TABLE' | 'VIP_ROOM';
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingContactDto)
  contact?: BookingContactDto;
  @IsOptional() @IsString() specialRequest?: string;
}
export class RescheduleBookingDto implements RescheduleBookingRequest {
  @IsDateString() date: string;
  @IsString() @IsNotEmpty() slot: string;
  @IsInt() @Min(1) partySize: number;
  @IsOptional() @IsString() reason?: string;
}
export class BookingReasonDto {
  @IsOptional() @IsString() reason?: string;
}
