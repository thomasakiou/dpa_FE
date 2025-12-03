import api from './api';
import { components } from '../types/schema';

type UserResponse = components['schemas']['UserResponse'];
type UserCreate = components['schemas']['UserCreate'];
type LoanResponse = components['schemas']['LoanResponse'];
type LoanCreate = components['schemas']['LoanCreate'];
type SavingsResponse = components['schemas']['SavingsResponse'];

export const adminService = {
    // User Management
    getAllUsers: async () => {
        const response = await api.get<UserResponse[]>('/api/v1/admin/users');
        return response.data;
    },
    createUser: async (data: UserCreate) => {
        const response = await api.post<UserResponse>('/api/v1/admin/users', data);
        return response.data;
    },
    updateUser: async (userId: number, data: Partial<UserCreate>) => {
        const response = await api.put<UserResponse>(`/api/v1/admin/users/${userId}`, data);
        return response.data;
    },
    suspendUser: async (userId: number) => {
        const response = await api.post<UserResponse>(`/api/v1/admin/users/${userId}/suspend`);
        return response.data;
    },
    activateUser: async (userId: number) => {
        const response = await api.post<UserResponse>(`/api/v1/admin/users/${userId}/activate`);
        return response.data;
    },
    resetPassword: async (email: string) => {
        // 1. Find user by email
        const users = await adminService.getAllUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw new Error(`User with email ${email} not found`);
        }

        // 2. Call reset password endpoint
        // The backend generates a new password and returns it
        const response = await api.post<components['schemas']['PasswordResetResponse']>(
            `/api/v1/admin/users/${user.id}/reset-password`
        );

        return response.data;
    },

    // Loan Management
    closeLoan: async (loanId: number) => {
        const response = await api.post<LoanResponse>(`/api/v1/admin/loans/${loanId}/close`);
        return response.data;
    },
    approveLoan: async (loanId: number) => {
        const response = await api.post<LoanResponse>(`/api/v1/admin/loans/${loanId}/approve`);
        return response.data;
    },
    deleteLoan: async (loanId: number) => {
        await api.delete(`/api/v1/admin/loans/${loanId}`);
    },
    recordPartialPayment: async (loanId: number, amount: number) => {
        const response = await api.post<LoanResponse>(`/api/v1/admin/loans/${loanId}/payment`, { amount });
        return response.data;
    },
};

export const loansService = {
    applyForLoan: async (data: LoanCreate) => {
        const response = await api.post<LoanResponse>('/api/v1/loans/apply', data);
        return response.data;
    },
    getMyLoans: async () => {
        const response = await api.get<LoanResponse[]>('/api/v1/loans/me');
        return response.data;
    },
    getAllLoans: async () => {
        const response = await api.get<LoanResponse[]>('/api/v1/admin/loans');
        return response.data;
    },
};

export const savingsService = {
    getAllSavings: async () => {
        const response = await api.get<SavingsResponse[]>('/api/v1/admin/savings');
        return response.data;
    },
    createSavings: async (data: any) => {
        const response = await api.post<SavingsResponse>('/api/v1/admin/savings', data);
        return response.data;
    },
    updateSavings: async (id: number, data: any) => {
        const response = await api.put<SavingsResponse>(`/api/v1/admin/savings/${id}`, data);
        return response.data;
    },
    deleteSavings: async (id: number) => {
        await api.delete(`/api/v1/admin/savings/${id}`);
    }
};

export const sharesService = {
    getAllShares: async () => {
        const response = await api.get('/api/v1/admin/shares');
        return response.data;
    },
    createShare: async (data: any) => {
        const response = await api.post('/api/v1/admin/shares', data);
        return response.data;
    },
    updateShare: async (id: number, data: any) => {
        const response = await api.put(`/api/v1/admin/shares/${id}`, data);
        return response.data;
    },
    deleteShare: async (id: number) => {
        await api.delete(`/api/v1/admin/shares/${id}`);
    }
};

