export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'EMERGENCY';
  enabled: boolean;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string;
  chronicDiseases?: string;
  specialization?: string;
  hospital?: string;
  createdAt?: string;
}

export interface AuthRequest { email: string; password: string; otpCode?: string; }
export interface RegisterRequest {
  email: string; password: string; firstName: string; lastName: string;
  phone?: string; role?: string; bloodType?: string; height?: number; weight?: number;
  allergies?: string; chronicDiseases?: string; specialization?: string; hospital?: string;
}
export interface AuthResponse {
  accessToken: string; refreshToken: string; email: string;
  firstName: string; lastName: string; role: string;
  userId: number; twoFactorRequired?: boolean; message?: string;
}
