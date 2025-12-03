export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  filled?: boolean;
}

export interface AdminDashboardStats {
  total_members: number;
  total_savings: number;
  total_shares: number;
  total_loans: number;
  outstanding_balances: number;
  monthly_savings?: { month: string; amount: number }[];
  share_growth?: { month: string; amount: number }[];
  loan_distribution?: { status: string; count: number }[];
  pending_requests?: any[];
}