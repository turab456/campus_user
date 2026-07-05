import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, GraduationCap, MapPin, ArrowRight } from 'lucide-react';
import { COLLEGES, DEPARTMENTS, SEMESTERS } from '../constants';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    department: '',
    semester: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, college, department, semester } = formData;

    if (!name.trim() || !email.trim() || !password.trim() || !college || !department) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    if (!email.includes('@')) {
      showToast('Please register with a valid email address.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, college, department, semester);
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

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">College Campus *</label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-muted absolute left-3 pointer-events-none" />
            <select
              value={formData.college}
              onChange={(e) => setFormData(prev => ({ ...prev, college: e.target.value }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 pl-9 pr-4 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="">Select College</option>
              {COLLEGES.map(c => (
                <option key={c} value={c}>{c.split(',')[0]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Dept *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 px-3 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            >
              <option value="">Select Dept</option>
              {DEPARTMENTS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-textDark uppercase tracking-wider">Semester *</label>
            <select
              value={formData.semester}
              onChange={(e) => setFormData(prev => ({ ...prev, semester: Number(e.target.value) }))}
              className="w-full bg-[#F5F3EF] border border-borderCustom rounded-[10px] py-2.5 px-3 text-xs text-textDark focus:bg-white focus:border-primary focus:outline-none"
            >
              {SEMESTERS.map(s => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>
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
