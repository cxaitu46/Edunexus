import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Users } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Network() {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');

  useEffect(() => {
    fetchNetworkData();
  }, [searchQuery]);

  const fetchNetworkData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, requestsRes, connectionsRes] = await Promise.all([
        fetch(`/api/users${searchQuery ? `?query=${encodeURIComponent(searchQuery)}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/users/connections/pending', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users/connections/accepted', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (requestsRes.ok) setPendingRequests(await requestsRes.json());
      if (connectionsRes.ok) setMyConnections(await connectionsRes.json());
    } catch (e) {
      toast.error('Failed to load network');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    try {
      const res = await fetch(`/api/users/${userId}/connect`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Connection request sent!');
        setUsers(prev => prev.map(u =>
          u._id === userId ? { ...u, connectionStatus: 'pending', isRequester: true } : u
        ));
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to send request');
      }
    } catch (e) {
      toast.error('Something went wrong');
    }
  };

  const handleAccept = async (requesterId) => {
    try {
      const res = await fetch(`/api/users/${requesterId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Request accepted!');
        fetchNetworkData();
      }
    } catch (e) {
      toast.error('Failed to accept');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this connection?')) return;
    try {
      const res = await fetch(`/api/users/${userId}/connection`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Connection removed');
        fetchNetworkData();
      }
    } catch (e) {
      toast.error('Failed to remove');
    }
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  const renderConnectionBtn = (u) => {
    if (u.connectionStatus === 'accepted') {
      return <span className="badge badge-green">✓ Connected</span>;
    }
    if (u.connectionStatus === 'pending' && u.isRequester) {
      return <span className="badge badge-orange">⏳ Pending</span>;
    }
    if (u.connectionStatus === 'pending' && !u.isRequester) {
      return (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAccept(u._id)}>
          <Check size={14} /> Accept
        </button>
      );
    }
    return (
      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleConnect(u._id)}>
        <UserPlus size={14} /> Connect
      </button>
    );
  };

  return (
    <div>
      <div className="page-header">
        <h1>Student Network</h1>
        <p>Discover and connect with other students</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'discover', label: 'Discover Students' },
          { key: 'requests', label: `Requests (${pendingRequests.length})` },
          { key: 'connections', label: `My Connections (${myConnections.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            type="button"
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'discover' && (
        <>
          <div className="search-bar">
            <Search size={16} style={{ color: '#9ca3af' }} />
            <input
              placeholder="Search by name, skill, or bio..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <Users size={40} style={{ margin: '0 auto 12px', color: '#d1d5db' }} />
              <h3>No students found</h3>
            </div>
          ) : (
            users.map(u => (
              <div key={u._id} className="user-card">
                <div className="avatar avatar-lg">
                  {u.avatar ? <img src={u.avatar} alt="" /> : getInitial(u.name)}
                </div>
                <div className="user-info">
                  <Link to={`/app/profile/${u._id}`} className="user-name">{u.name}</Link>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{u.role}</div>
                  {u.bio && <div className="user-bio">{u.bio}</div>}
                  <div className="skills-list">
                    {u.skills?.slice(0, 4).map(s => (
                      <span key={s} className="badge">{s}</span>
                    ))}
                  </div>
                </div>
                <div>{renderConnectionBtn(u)}</div>
              </div>
            ))
          )}
        </>
      )}
      {activeTab === 'requests' && (
        <>
          {pendingRequests.length === 0 ? (
            <div className="empty-state"><h3>No pending requests</h3></div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req._id} className="user-card">
                <div className="avatar">{getInitial(req.requester?.name)}</div>
                <div className="user-info">
                  <div className="user-name">{req.requester?.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{req.requester?.role}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAccept(req.requester._id)}>
                    <Check size={14} /> Accept
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
      {activeTab === 'connections' && (
        <>
          {myConnections.length === 0 ? (
            <div className="empty-state"><h3>No connections yet</h3></div>
          ) : (
            myConnections.map((peer) => (
              <div key={peer._id} className="user-card">
                <div className="avatar">{getInitial(peer.name)}</div>
                <div className="user-info">
                  <Link to={`/app/profile/${peer._id}`} className="user-name">{peer.name}</Link>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{peer.role}</div>
                  {peer.bio && <div className="user-bio">{peer.bio}</div>}
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemove(peer._id)}>
                  <X size={14} /> Remove
                </button>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
