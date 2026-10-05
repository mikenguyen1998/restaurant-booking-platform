import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class GetRestaurantAvailabilityDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsOptional()
  slot?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  partySize: number;

  @IsOptional()
  @IsString()
  preference?: string;
}
