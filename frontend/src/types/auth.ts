export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  confirmPassword: string;
}