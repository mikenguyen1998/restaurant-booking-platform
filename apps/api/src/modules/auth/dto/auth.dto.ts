import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class SignUpDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  // Trimmed so " an@example.com " is accepted; lower-casing happens in the repository.
  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email: string;

  // Not trimmed: spaces are legitimate password characters.
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}

/** No minimum length here, so a password set under an older rule still signs in. */
export class SignInDto {
  @Transform(trim)
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/** The token from the verification link, posted by the web page the link opens. */
export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class EmailDto {
  @Transform(trim)
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}
