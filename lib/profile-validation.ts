export const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

export function validateProfileForm(
  fullName: string,
  phoneNumber: string,
  isOrganization: boolean,
  description: string,
): string | null {
  if (!fullName.trim()) return "Введіть ім'я / назву";
  if (phoneNumber && !PHONE_REGEX.test(phoneNumber))
    return "Введіть коректний номер телефону (наприклад, +380XXXXXXXXX)";
  if (isOrganization && !description.trim()) return "Опис організації обов'язковий";
  return null;
}
