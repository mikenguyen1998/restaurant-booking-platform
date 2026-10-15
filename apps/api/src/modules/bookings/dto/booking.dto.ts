import { Type } from 'class-transformer';
import {
  IsDefined,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import {
  bookingStatuses,
  type BookingContact,
  type CreateBookingRequest,
  type RescheduleBookingRequest,
  type BookingListQuery,
  type AdminBookingListQuery,
  type ManualBookingRequest,
  type OwnerBookingChangeRequest,
  type OwnerRescheduleBookingRequest,
  type ContactAttemptRequest,
  type ExtendHoldRequest,
  type CorrectBookingOutcomeRequest,
  type AdminCancelBookingRequest,
  type AdminRescheduleBookingRequest,
} from '@restaurant-platform/shared';
export class BookingContactDto implements BookingContact {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() phone: string;
  @IsOptional() @IsEmail() email?: string;
}
export class BookingTimeDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/) @IsDateString({ strict: true }) date: string;
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/) slot: string;
  @IsInt() @Min(1) partySize: number;
}
export class CreateBookingDto
  extends BookingTimeDto
  implements CreateBookingRequest
{
  @IsUUID() restaurantId: string;
  @IsOptional() @IsIn(['TABLE', 'VIP_ROOM']) preferredResourceType?:
    'TABLE' | 'VIP_ROOM';
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingContactDto)
  contact?: BookingContactDto;
  @IsOptional() @IsString() specialRequest?: string;
}
export class RescheduleBookingDto
  extends BookingTimeDto
  implements RescheduleBookingRequest
{
  @IsOptional() @IsString() reason?: string;
}
export class BookingReasonDto {
  @IsOptional() @IsString() reason?: string;
}
export class RequiredReasonDto implements AdminCancelBookingRequest {
  @IsString() @IsNotEmpty() reason: string;
}
export class BookingListDto implements BookingListQuery {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsIn(bookingStatuses) status?: BookingListQuery['status'];
  @IsOptional() @IsDateString() from?: string;
  @IsOptional() @IsDateString() to?: string;
}
export class AdminBookingListDto
  extends BookingListDto
  implements AdminBookingListQuery
{
  @IsOptional() @IsUUID() restaurantId?: string;
}
export class ManualBookingDto
  extends BookingTimeDto
  implements ManualBookingRequest
{
  @IsDefined()
  @ValidateNested()
  @Type(() => BookingContactDto)
  contact: BookingContactDto;
  @IsString() @IsNotEmpty() reason: string;
  @IsOptional() @IsIn(['TABLE', 'VIP_ROOM']) preferredResourceType?:
    'TABLE' | 'VIP_ROOM';
  @IsOptional() @IsString() specialRequest?: string;
}
export class OwnerChangeDto
  extends RequiredReasonDto
  implements OwnerBookingChangeRequest
{
  @IsString() @IsNotEmpty() contactEvidence: string;
}
export class OwnerRescheduleDto
  extends BookingTimeDto
  implements OwnerRescheduleBookingRequest
{
  @IsString() @IsNotEmpty() reason: string;
  @IsString() @IsNotEmpty() contactEvidence: string;
}
export class AdminRescheduleDto
  extends BookingTimeDto
  implements AdminRescheduleBookingRequest
{
  @IsString() @IsNotEmpty() reason: string;
}
export class ContactAttemptDto implements ContactAttemptRequest {
  @IsIn(['REACHED', 'UNREACHABLE']) outcome: 'REACHED' | 'UNREACHABLE';
  @IsString() @IsNotEmpty() note: string;
}
export class ExtendHoldDto
  extends RequiredReasonDto
  implements ExtendHoldRequest
{
  @IsDateString() holdUntil: string;
}
export class CorrectOutcomeDto
  extends RequiredReasonDto
  implements CorrectBookingOutcomeRequest
{
  @IsIn(['COMPLETED', 'NO_SHOW']) status: 'COMPLETED' | 'NO_SHOW';
}
