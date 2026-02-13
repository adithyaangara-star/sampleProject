const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LoginValidation {
  email?: string;
  password?: string;
}

export function validateEmail(email: string): string | undefined {
  const t = email.trim();
  if (!t) return 'Email is required';
  if (!EMAIL_REGEX.test(t)) return 'Enter a valid email address';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
}

export function validateLogin(email: string, password: string): LoginValidation {
  const errors: LoginValidation = {};
  const e = validateEmail(email);
  const p = validatePassword(password);
  if (e) errors.email = e;
  if (p) errors.password = p;
  return errors;
}
