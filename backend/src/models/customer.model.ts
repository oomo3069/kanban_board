export interface Customer {
  id: number;
  name: string;
  email: string;
  phone_number: string; 
  password: string;
  created_at?: Date;
}