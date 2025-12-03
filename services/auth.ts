import api from './api';
import { components } from '../types/schema';

type LoginRequest = components['schemas']['LoginRequest'];
type Token = components['schemas']['Token'];
type ChangePasswordRequest = components['schemas']['ChangePasswordRequest'];

export const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post<Token>('/api/v1/auth/login', data);
        return response.data;
    },
    changePassword: async (data: ChangePasswordRequest) => {
        const response = await api.post('/api/v1/auth/change-password', data);
        return response.data;
    },
};
