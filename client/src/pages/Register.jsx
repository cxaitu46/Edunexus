import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, bio, skills, linkedin }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        toast.success('Account created successfully!');
        navigate('/app');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 480 }}>
        <div className="auth-logo">EduNexus</div>
        <p className="auth-subtitle">Create your account and join the community</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Bio (optional)</label>
            <textarea placeholder="Tell us a bit about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ minHeight: 60 }} />
          </div>
          <div className="form-group">
            <label>Skills (comma-separated, optional)</label>
            <input type="text" placeholder="e.g. React, Node.js, MongoDB" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="form-group">
            <label>LinkedIn URL (optional)</label>
            <input type="url" placeholder="https://linkedin.com/in/yourname" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {isLoading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
