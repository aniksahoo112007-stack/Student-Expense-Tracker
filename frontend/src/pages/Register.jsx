import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/validators';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!validateEmail(form.email)) errs.email = 'Valid email is required';
    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length) errs.password = pwdErrors.join(', ');
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully! Welcome to SpendWise 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem',
            background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            💸 SpendWise
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Create your account to start tracking</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="Your full name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange} />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group" style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Create a strong password" value={form.password}
                onChange={handleChange} style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-input)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 2, transition: 'all 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '0.6875rem', color: strength.color, fontWeight: 500 }}>{strength.label}</span>
              </div>
            )}
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password"
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? <div className="spinner" /> : <>Create Account <ArrowRight size={18} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
