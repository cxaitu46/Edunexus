import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Download, Plus, Trash2, Wand2, User, BookOpen, Briefcase, Award, Zap } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';

const defaultResume = {
  title: 'My Resume',
  personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
  education: [
    { institution: '', degree: '10th / High School', field: 'General', startDate: '', endDate: '' },
    { institution: '', degree: '12th / Intermediate', field: '', startDate: '', endDate: '' },
    { institution: '', degree: "B.Tech / Bachelor's", field: '', startDate: '', endDate: '' },
  ],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
};

const sections = [
  { key: 'personal',       label: 'Personal Info',   icon: User },
  { key: 'education',      label: 'Education',       icon: BookOpen },
  { key: 'experience',     label: 'Experience',      icon: Briefcase },
  { key: 'projects',       label: 'Projects',        icon: Zap },
  { key: 'skills',         label: 'Skills',          icon: Award },
  { key: 'certifications', label: 'Certifications',  icon: Award },
  { key: 'achievements',   label: 'Achievements',    icon: Award },
];

export default function ResumeBuilder() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(defaultResume);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showPreview, setShowPreview] = useState(false);
  const resumeRef = useRef(null);

  useEffect(() => {
    if (id) fetchResume();
  }, [id]);

  const fetchResume = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
    } catch (e) {
      toast.error('Failed to load resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = data._id ? `/api/resumes/${data._id}` : '/api/resumes';
      const method = data._id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const saved = await res.json();
        setData(saved);
        toast.success('Resume saved!');
        if (!data._id) navigate(`/app/resume/${saved._id}`);
      }
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/resumes/generate-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          skills: data.skills,
          experience: data.experience,
          education: data.education,
        })
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.summary != null) {
        setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, summary: body.summary } }));
        toast.success('Summary drafted from your profile');
      } else {
        toast.error(body.message || 'Could not generate summary');
      }
    } catch (e) {
      toast.error('Could not generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: data.title || 'Resume',
  });

  const updatePersonal = (field, value) => {
    setData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...data.education];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, education: updated }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (index) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...data.experience];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, experience: updated }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', techStack: '', link: '' }]
    }));
  };

  const removeProject = (index) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const updateProject = (index, field, value) => {
    const updated = [...data.projects];
    updated[index] = { ...updated[index], [field]: value };
    setData(prev => ({ ...prev, projects: updated }));
  };

  const arrayToString = (arr) => arr.join(', ');
  const stringToArray = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

  if (isLoading) return <div className="loading">Loading resume...</div>;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <input
            value={data.title}
            onChange={e => setData({ ...data, title: e.target.value })}
            style={{ fontSize: 20, fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: '#1e1b4b' }}
          />
          <p style={{ color: '#6b7280', fontSize: 13 }}>Fill in the sections on the left, preview on the right</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-ghost" onClick={() => setShowPreview(!showPreview)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={handlePrint}>
            <Download size={16} /> Print / PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: showPreview ? '200px 1fr 1fr' : '200px 1fr', gap: 16 }}>
        <div className="resume-sections-panel">
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sections</p>
          {sections.map(s => {
            const Icon = s.icon;
            return (
              <button type="button" key={s.key} className={`section-btn ${activeSection === s.key ? 'active' : ''}`} onClick={() => setActiveSection(s.key)}>
                <Icon size={15} /> {s.label}
              </button>
            );
          })}
        </div>
        <div className="resume-form-panel">
          {activeSection === 'personal' && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Personal Information</h2>
              {[
                { field: 'fullName', label: 'Full Name', placeholder: 'Your full name' },
                { field: 'email', label: 'Email', placeholder: 'email@example.com' },
                { field: 'phone', label: 'Phone', placeholder: '+91 9876543210' },
                { field: 'location', label: 'Location', placeholder: 'City, State' },
              ].map(f => (
                <div className="form-group" key={f.field}>
                  <label>{f.label}</label>
                  <input placeholder={f.placeholder} value={data.personalInfo[f.field]} onChange={e => updatePersonal(f.field, e.target.value)} />
                </div>
              ))}
              <div className="form-group">
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Professional Summary</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleGenerateSummary} disabled={isGenerating}>
                    <Wand2 size={13} /> {isGenerating ? 'Generating...' : 'Generate from profile'}
                  </button>
                </label>
                <textarea rows={4} placeholder="A short summary of who you are professionally..." value={data.personalInfo.summary} onChange={e => updatePersonal('summary', e.target.value)} />
              </div>
            </div>
          )}
          {activeSection === 'education' && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 16 }}>Education</h2>
              {data.education.map((edu, i) => (
                <div key={i} className="entry-row">
                  <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#4f46e5' }}>{edu.degree}</p>
                  <div className="grid-2">
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label>Institution</label>
                      <input placeholder="School/College name" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label>Field / Branch</label>
                      <input placeholder="e.g. Computer Science" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Start Year</label>
                      <input placeholder="2020" value={edu.startDate} onChange={e => updateEducation(i, 'startDate', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>End Year</label>
                      <input placeholder="2024 or Present" value={edu.endDate} onChange={e => updateEducation(i, 'endDate', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeSection === 'experience' && (
            <div>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700 }}>Work Experience</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addExperience}><Plus size={14} /> Add</button>
              </div>
              {data.experience.length === 0 && <p style={{ color: '#6b7280', fontSize: 14 }}>No experience added yet.</p>}
              {data.experience.map((exp, i) => (
                <div key={i} className="entry-row">
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>Experience #{i + 1}</span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeExperience(i)}><Trash2 size={12} /></button>
                  </div>
                  <div className="grid-2">
                    {[
                      { field: 'company', label: 'Company', placeholder: 'Company name' },
                      { field: 'role', label: 'Role / Title', placeholder: 'e.g. Software Intern' },
                      { field: 'startDate', label: 'Start Date', placeholder: 'Jan 2023' },
                      { field: 'endDate', label: 'End Date', placeholder: 'Jun 2023 or Present' },
                    ].map(f => (
                      <div key={f.field} className="form-group" style={{ marginBottom: 8 }}>
                        <label>{f.label}</label>
                        <input placeholder={f.placeholder} value={exp[f.field]} onChange={e => updateExperience(i, f.field, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Description</label>
                    <textarea rows={3} placeholder="What did you do there?" value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeSection === 'projects' && (
            <div>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <h2 style={{ fontWeight: 700 }}>Projects</h2>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addProject}><Plus size={14} /> Add</button>
              </div>
              {data.projects.length === 0 && <p style={{ color: '#6b7280', fontSize: 14 }}>No projects added yet.</p>}
              {data.projects.map((proj, i) => (
                <div key={i} className="entry-row">
                  <div className="flex-between" style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4f46e5' }}>Project #{i + 1}</span>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeProject(i)}><Trash2 size={12} /></button>
                  </div>
                  {[
                    { field: 'title', label: 'Project Title', placeholder: 'e.g. EduNexus' },
                    { field: 'techStack', label: 'Tech Stack', placeholder: 'React, Node.js, MongoDB' },
                    { field: 'link', label: 'GitHub/Live Link', placeholder: 'https://github.com/...' },
                  ].map(f => (
                    <div key={f.field} className="form-group" style={{ marginBottom: 8 }}>
                      <label>{f.label}</label>
                      <input placeholder={f.placeholder} value={proj[f.field]} onChange={e => updateProject(i, f.field, e.target.value)} />
                    </div>
                  ))}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Description</label>
                    <textarea rows={2} placeholder="What does this project do?" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {['skills', 'certifications', 'achievements'].includes(activeSection) && (
            <div>
              <h2 style={{ fontWeight: 700, marginBottom: 16, textTransform: 'capitalize' }}>{activeSection}</h2>
              <div className="form-group">
                <label>Enter comma-separated values</label>
                <textarea
                  rows={5}
                  placeholder={
                    activeSection === 'skills' ? 'JavaScript, React, Node.js, MongoDB...' :
                    activeSection === 'certifications' ? 'AWS Certified, Google Analytics...' :
                    "Winner of Hackathon 2024, Dean's List..."
                  }
                  value={arrayToString(data[activeSection])}
                  onChange={e => setData({ ...data, [activeSection]: stringToArray(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {data[activeSection].map((item) => (
                  <span key={item} className="badge">{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        {showPreview && (
          <div style={{ overflow: 'auto' }}>
            <ResumePreview data={data} ref={resumeRef} />
          </div>
        )}
      </div>
      <div style={{ display: 'none' }}>
        <ResumePreview data={data} ref={resumeRef} />
      </div>
    </div>
  );
}

const ResumePreview = React.forwardRef(({ data }, ref) => {
  const { personalInfo, education, experience, projects, skills, certifications, achievements } = data;
  return (
    <div ref={ref} className="resume-preview">
      <div className="name">{personalInfo.fullName || 'Your Name'}</div>
      <div className="contact-info">
        {personalInfo.email && <span>{personalInfo.email}</span>}
        {personalInfo.phone && <span>{personalInfo.phone}</span>}
        {personalInfo.location && <span>{personalInfo.location}</span>}
      </div>
      {personalInfo.summary && (
        <>
          <div className="section-heading">Summary</div>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: '#374151' }}>{personalInfo.summary}</p>
        </>
      )}
      {education.some(e => e.institution) && (
        <>
          <div className="section-heading">Education</div>
          {education.filter(e => e.institution).map((edu, i) => (
            <div key={i} className="resume-item">
              <div className="item-header">
                <span>{edu.institution}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{edu.startDate} – {edu.endDate}</span>
              </div>
              <div className="item-sub">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</div>
            </div>
          ))}
        </>
      )}
      {experience.length > 0 && (
        <>
          <div className="section-heading">Experience</div>
          {experience.map((exp, i) => (
            <div key={i} className="resume-item">
              <div className="item-header">
                <span>{exp.role} at {exp.company}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{exp.startDate} – {exp.endDate}</span>
              </div>
              {exp.description && <div className="item-sub">{exp.description}</div>}
            </div>
          ))}
        </>
      )}
      {projects.length > 0 && (
        <>
          <div className="section-heading">Projects</div>
          {projects.map((proj, i) => (
            <div key={i} className="resume-item">
              <div className="item-header">
                <span>{proj.title}</span>
                {proj.link && <a href={proj.link} style={{ fontSize: 11, color: '#4f46e5' }}>Link</a>}
              </div>
              {proj.techStack && <div className="item-sub">Tech: {proj.techStack}</div>}
              {proj.description && <div className="item-sub">{proj.description}</div>}
            </div>
          ))}
        </>
      )}
      {skills.length > 0 && (
        <>
          <div className="section-heading">Skills</div>
          <div className="skills-list">
            {skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
          </div>
        </>
      )}
      {certifications.length > 0 && (
        <>
          <div className="section-heading">Certifications</div>
          {certifications.map((c, i) => <div key={i} className="item-sub" style={{ marginBottom: 4 }}>• {c}</div>)}
        </>
      )}
      {achievements.length > 0 && (
        <>
          <div className="section-heading">Achievements</div>
          {achievements.map((a, i) => <div key={i} className="item-sub" style={{ marginBottom: 4 }}>• {a}</div>)}
        </>
      )}
    </div>
  );
});
