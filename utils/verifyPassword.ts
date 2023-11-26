import { scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

/**
 * Verifies if the passed password matches the hashed password.
 *
 * @param storedPassword
 * @param suppliedPassword
 * @return
 **/
export default async function (
  storedPassword: string,
  suppliedPassword: string
): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split('.');
  const hashedPasswordBuffer = Buffer.from(hashedPassword, 'hex');
  const suppliedPasswordBuffer = (await scryptAsync(
    suppliedPassword,
    salt,
    64
  )) as Buffer;

  return timingSafeEqual(hashedPasswordBuffer, suppliedPasswordBuffer);
}
