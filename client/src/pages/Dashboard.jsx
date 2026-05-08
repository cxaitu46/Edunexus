import React, { useEffect, useState } from 'react';
import { FileText, BookOpen, MessageSquare, Award, Clock } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    notesUploaded: 0,
    questionsAsked: 0,
    resumesCount: 0,
    reputation: 0,
    streak: 0,
  });
  const [timer, setTimer] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [meRes, resumesRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/resumes', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (meRes.ok) {
          const data = await meRes.json();
          setStats({
            notesUploaded: data.stats.notesCount,
            questionsAsked: data.stats.questionsCount,
            resumesCount: data.stats.resumesCount,
            reputation: data.reputation,
            streak: data.streak,
          });
        }
        if (resumesRes.ok) {
          const data = await resumesRes.json();
          setResumes(data.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data');
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsActive(false);
      toast.success('Focus session complete! Take a break. 🎉');
    }
    return () => clearInterval(interval);
  }, [isActive, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimer(25 * 60);
  };

  const statCards = [
    { icon: BookOpen,      label: 'Notes Uploaded',     value: stats.notesUploaded },
    { icon: MessageSquare, label: 'Questions Asked',     value: stats.questionsAsked },
    { icon: FileText,      label: 'Resumes Created',     value: stats.resumesCount },
    { icon: Award,         label: 'Reputation Points',   value: stats.reputation },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p>You have a {stats.streak}-day streak! Keep it up.</p>
      </div>
      <div className="stats-grid">
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card">
              <div className="stat-icon"><Icon size={20} /></div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
            </div>
          );
        })}
      </div>
      <div className="grid-2">
        <div className="timer-card">
          <Clock size={20} style={{ color: '#4f46e5', margin: '0 auto' }} />
          <div className="timer-label">Focus Timer (Pomodoro)</div>
          <div className="timer-display">{formatTime(timer)}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button type="button" className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`} onClick={() => setIsActive(!isActive)}>
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetTimer}>Reset</button>
          </div>
        </div>
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, fontSize: 15 }}>Your Resumes</h3>
            <Link to="/app/resume" className="btn btn-secondary btn-sm">+ New Resume</Link>
          </div>
          {resumes.length === 0 ? (
            <div className="empty-state">
              <p>No resumes yet. Create your first one!</p>
            </div>
          ) : (
            resumes.map(r => (
              <Link key={r._id} to={`/app/resume/${r._id}`} style={{ display: 'block' }}>
                <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f9fafb', marginBottom: 8, fontSize: 14, color: '#374151' }}>
                  📄 {r.title}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="card" style={{ marginTop: 0 }}>
        <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link to="/app/notes" className="btn btn-secondary">📚 Browse Notes</Link>
          <Link to="/app/qa" className="btn btn-secondary">❓ Ask a Question</Link>
          <Link to="/app/feed" className="btn btn-secondary">📢 Social Feed</Link>
          <Link to="/app/network" className="btn btn-secondary">🤝 Find Connections</Link>
        </div>
      </div>
    </div>
  );
}
