import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Trigger loading state if window.showLoading is available (set by App.tsx)
        if (window.showLoading) {
            window.showLoading();
        }

        return config;
    },
    (error) => {
        if (window.hideLoading) {
            window.hideLoading();
        }
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        if (window.hideLoading) {
            window.hideLoading();
        }
        return response;
    },
    (error) => {
        if (window.hideLoading) {
            window.hideLoading();
        }

        // Handle global errors
        if (error.response) {
            // 401 Unauthorized - Redirect to login
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            // Show error toast if window.showErrorToast is available
            if (window.showErrorToast) {
                const message = error.response.data?.detail || 'An error occurred';
                // Don't show toast for 404s that we might handle locally (like in mocks)
                if (error.response.status !== 404) {
                    window.showErrorToast(message);
                }
            }
        } else if (error.request) {
            // Network error
            if (window.showErrorToast) {
                window.showErrorToast('Network error. Please check your connection.');
            }
        }

        return Promise.reject(error);
    }
);

// Add types to window
declare global {
    interface Window {
        showLoading?: () => void;
        hideLoading?: () => void;
        showErrorToast?: (message: string) => void;
    }
}

export default api;
