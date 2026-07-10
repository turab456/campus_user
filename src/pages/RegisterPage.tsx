import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, GraduationCap, MapPin, ArrowRight } from 'lucide-react';


export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    if (!email.includes('@')) {
      showToast('Please register with a valid email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password);
      showToast('Registration successful! Please check your email to verify your account.', 'success');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Registration failed.', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h3 className="text-lg font-bold text-textDark">Register student account</h3>
        <p className="text-xs text-muted mt-1">Unlock peer trading and connect with students anywhere.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Full Name *</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Karan Kumar"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Email Address *</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="email"
              placeholder="e.g. karan.cs22@rvce.edu.in"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Password *</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <input
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold py-2.5 px-4 rounded-lg shadow-subtle transition-colors flex items-center justify-center gap-1.5 mt-2 focus:outline-none disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Registering...' : 'Register Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <hr className="border-borderCustom" />

      <p className="text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-primary hover:underline">Sign In</Link>
      </p>
    </div>
  );
};
