import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to extract Django REST Framework error messages
const extractError = (error, fallback = 'Something went wrong') => {
  const data = error.response?.data;
  if (!data) return error.message || fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (data.message) return data.message;
  if (data.non_field_errors?.[0]) return data.non_field_errors[0];
  const firstValue = Object.values(data).flat()[0];
  return typeof firstValue === 'string' ? firstValue : fallback;
};

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

class AuthService {
  // ==========================
  // LOGIN
  // ==========================
  async login(email, password) {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/login/`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractError(error, 'Login failed'));
    }
  }

  // ==========================
  // REGISTER
  // ==========================
  async register(userData) {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/register/`,
        userData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractError(error, 'Registration failed'));
    }
  }

  // ==========================
  // LOGOUT
  // ==========================
  async logout() {
    const refresh = localStorage.getItem('refresh_token');

    try {
      // Backend only needs refresh to blacklist.
      // Don't hard-fail logout if refresh is missing/invalid.
      const response = await axios.post(
        `${API_URL}/api/users/logout/`,
        { refresh },
        {
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      return null;
    }
  }

  // ==========================
  // RESET PASSWORD
  // ==========================
  async resetPassword(email) {
    try {
      const response = await axios.post(
        `${API_URL}/api/users/password-reset/`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractError(error, 'Password reset failed'));
    }
  }

  // ==========================
  // GET CURRENT USER
  // ==========================
  async getCurrentUser() {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/me/`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractError(error, 'Failed to get user'));
    }
  }

  // ==========================
  // REFRESH TOKEN (Bonus)
  // ==========================
  async refreshToken() {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token available');

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error(extractError(error, 'Token refresh failed'));
    }
  }
}

export default new AuthService();


// import api from './api';
// import axios from 'axios';

// class AuthService {
//   async login(email, password) {
//     try {
//       const response = await api.post('/auth/login/', { email, password });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Login failed');
//     }
//   }

//   async register(userData) {
//     try {
//       const response = await api.post('/auth/register/', userData);
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Registration failed');
//     }
//   }

//   async logout() {
//     const refresh = localStorage.getItem('refresh_token');

//     try {
//       // Backend only needs refresh to blacklist.
//       // Don't hard-fail logout if refresh is missing/invalid.
//       return await api.post('/users/logout/', { refresh });
//     } catch (error) {
//       console.error('Logout error:', error);
//       return null;
//     }
//   }



//   async resetPassword(email) {
//     try {
//       const response = await api.post('/users/password-reset/', { email });
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Password reset failed');
//     }
//   }

//   async getCurrentUser() {
//     try {
//       const response = await api.get('/auth/me');
//       return response.data;
//     } catch (error) {
//       throw new Error(error.response?.data?.message || 'Failed to get user');
//     }
//   }
// }

// export default new AuthService();
