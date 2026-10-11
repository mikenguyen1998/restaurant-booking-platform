import type { User } from '@restaurant-platform/database';

/** A user as it may leave the users module: never carries the password hash. */
export type PublicUser = Omit<User, 'passwordHash'>;

/** What the repository needs to insert a user (the password is already hashed). */
export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

/** Sign-in lookup result: the only shape that exposes the hash. */
export interface UserCredentials {
  user: PublicUser;
  passwordHash: string | null;
}

/** Input of the register use case (plain password, before hashing). */
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
