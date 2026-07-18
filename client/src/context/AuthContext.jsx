import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('csea_token');
    if (token) {
      getMe()
        .then((res) => setUser(res.data.student))
        .catch(() => {
          localStorage.removeItem('csea_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, student) => {
    localStorage.setItem('csea_token', token);
    setUser(student);
  };

  const logout = () => {
    localStorage.removeItem('csea_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
