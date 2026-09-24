export interface CustomerFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface DeliveryFormValues {
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateCustomer = (
  values: CustomerFormValues,
): FieldErrors<CustomerFormValues> => {
  const errors: FieldErrors<CustomerFormValues> = {};
  if (values.fullName.trim().length < 3) {
    errors.fullName = 'Nombre completo requerido';
  }
  if (!EMAIL_RE.test(values.email)) {
    errors.email = 'Correo electrónico inválido';
  }
  if (values.phoneNumber.trim().length < 7) {
    errors.phoneNumber = 'Teléfono inválido';
  }
  return errors;
};

export const validateDelivery = (
  values: DeliveryFormValues,
): FieldErrors<DeliveryFormValues> => {
  const errors: FieldErrors<DeliveryFormValues> = {};
  if (values.addressLine.trim().length < 5) {
    errors.addressLine = 'Dirección requerida';
  }
  if (values.city.trim().length < 2) {
    errors.city = 'Ciudad requerida';
  }
  if (values.region.trim().length < 2) {
    errors.region = 'Departamento/Región requerido';
  }
  if (!/^\d{4,10}$/.test(values.postalCode.trim())) {
    errors.postalCode = 'Código postal inválido';
  }
  return errors;
};
