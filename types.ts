export enum LeadStatus {
  NEW = 'NEW',
  CALLED = 'CALLED',
  BOOKED = 'BOOKED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
  NO_ANSWER = 'NO_ANSWER',
}

export interface Lead {
  id: string;
  name: string;
  idNumber?: string;
  phone: string;
  email: string;
  company: string;
  role?: string;
  notes?: string;
  status: LeadStatus;
  lastContacted?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}