import api from './api';
import { components } from '../types/schema';

type SavingsPaymentResponse = components['schemas']['SavingsPaymentResponse'];
type ShareResponse = components['schemas']['ShareResponse'];
type LoanResponse = components['schemas']['LoanResponse'];
type LoanCreate = components['schemas']['LoanCreate'];

export const financeService = {
    getSavings: async () => {
        const response = await api.get<SavingsPaymentResponse[]>('/api/v1/savings/me');
        return response.data;
    },
    getSavingsSummary: async () => {
        const response = await api.get('/api/v1/savings/me/sum');
        return response.data;
    },
    getShares: async () => {
        const response = await api.get<ShareResponse[]>('/api/v1/shares/me');
        return response.data;
    },
    getSharesSummary: async () => {
        const response = await api.get('/api/v1/shares/me/summary');
        return response.data;
    },
    getLoans: async () => {
        const response = await api.get<LoanResponse[]>('/api/v1/loans/me');
        return response.data;
    },
    applyLoan: async (data: LoanCreate) => {
        const response = await api.post<LoanResponse>('/api/v1/loans/apply', data);
        return response.data;
    },
};
