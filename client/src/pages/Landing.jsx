import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, MessageSquare, Users, Share2, Zap } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Resume Builder', desc: 'Build a professional resume with summary generation and print it as PDF.' },
  { icon: BookOpen, title: 'Notes Sharing', desc: 'Upload and download study notes. Earn reputation points for sharing knowledge.' },
  { icon: MessageSquare, title: 'Doubt Solving (Q&A)', desc: 'Ask questions and get answers from peers. Vote on the best answers.' },
  { icon: Share2, title: 'Social Feed', desc: 'Share updates, achievements and thoughts with the student community.' },
  { icon: Users, title: 'Student Network', desc: 'Connect with other students, send connection requests and grow your network.' },
  { icon: Zap, title: 'Gamification', desc: 'Earn reputation points, maintain daily streaks and compete on leaderboards.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">EduNexus</div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ borderRadius: 20 }}>
            Get Started
          </Link>
        </div>
      </nav>
      <section className="landing-hero">
        <span className="tag">The Ultimate Student Ecosystem</span>
        <h1>Empower Your Academic &amp; Career Journey</h1>
        <p>
          EduNexus brings resume building, notes sharing, doubt solving,
          and career development into one platform for students.
        </p>
        <div className="hero-btns">
          <Link to="/register">
            <button type="button" className="btn-big btn-primary">Join EduNexus Now →</button>
          </Link>
          <Link to="/login">
            <button type="button" className="btn-big btn-ghost" style={{ border: '1px solid #d1d5db' }}>
              Sign In
            </button>
          </Link>
        </div>
      </section>
      <section id="features" className="landing-features">
        <h2>Everything a Student Needs</h2>
        <div className="features-grid">
          {features.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="feature-card">
                <div className="icon">
                  <Icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
      <footer style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: 14 }}>
        © 2025 EduNexus. Built with MERN Stack.
      </footer>
    </div>
  );
}
