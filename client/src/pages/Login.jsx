import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginStudent } from '../api/axios';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginStudent(form);
      login(res.data.token, res.data.student);
      toast.success(`Welcome back, ${res.data.student.name}! 👋`);
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">⚡</div>
          <h1>Welcome Back</h1>
          <p>Login to CSEA Event Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" placeholder="your@email.com"
              value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? <span className="btn-spinner"></span> : 'Login'}
          </button>
        </form>

        <div className="demo-creds">
          <p className="demo-title">🔑 Demo Admin Account</p>
          <code>admin@csea.com / Admin@123</code>
        </div>

        <p className="auth-switch">
          New student? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
