import api from './api';
import { components } from '../types/schema';

type UserResponse = components['schemas']['UserResponse'];
type UserUpdate = components['schemas']['UserUpdate'];

export const membersService = {
    getProfile: async () => {
        const response = await api.get<UserResponse>('/api/v1/members/me');
        return response.data;
    },
    updateProfile: async (data: UserUpdate) => {
        const response = await api.put<UserResponse>('/api/v1/members/me', data);
        return response.data;
    },
    getDashboard: async () => {
        const response = await api.get('/api/v1/members/me/dashboard');
        return response.data;
    },
};
