const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getEmailError(email: string): string {
  if (!email.trim()) return "El email es obligatorio";
  if (!EMAIL_REGEX.test(email)) return "Formato de email inválido";
  return "";
}

export function getPasswordError(password: string): string {
  if (!password.trim()) return "La contraseña es obligatoria";
  const letters = password.replace(/[^a-zA-Z]/g, "").length;
  const numbers = password.replace(/[^0-9]/g, "").length;
  if (letters < 3 || numbers < 3) {
    return "Mínimo 3 letras y 3 números";
  }
  return "";
}