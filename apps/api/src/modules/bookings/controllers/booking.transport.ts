import { BadRequestException, ValidationPipe } from '@nestjs/common';
export const bookingValidation = new ValidationPipe({ transform:true, whitelist:true, forbidNonWhitelisted:true });
/** Transport requirement only; scoped replay/conflict checks remain pending. */
export function bookingKey(value: string | undefined): string {
 if (!value?.trim()) throw new BadRequestException('Idempotency-Key is required.');
 return value;
}
