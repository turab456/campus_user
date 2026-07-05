import { useAdminAuth } from '../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAdminProtection = () => {
  const { admin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/login');
    }
  }, [admin, loading, navigate]);

  return { isProtected: !!admin, loading };
};
