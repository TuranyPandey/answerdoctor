import React, { useState, useEffect } from 'react';
import { fetchGuilds, fetchMyGuilds, createGuild, joinGuild } from '../../services/api';
import { useToast } from '../Toast';

export default function UniversityGuildHub({ user }) {
  const [guilds, setGuilds] = useState([]);
  const [myGuilds, setMyGuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Guild Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [iconBadge, setIconBadge] = useState('🏛️');

  // Join Guild Code Form
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      const [allG, myG] = await Promise.all([fetchGuilds(), fetchMyGuilds()]);
      setGuilds(allG || []);
      setMyGuilds(myG || []);
    } catch (err) {
      toast(err.message || 'Failed to load live university guilds', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGuild = async (e) => {
    e.preventDefault();
    if (!name || !domain) return;
    try {
      const newG = await createGuild(name, domain, description, iconBadge);
      toast(`University Guild '${newG.name}' created! Code: ${newG.code}`, 'ok');
      setName('');
      setDomain('');
      setDescription('');
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      toast(err.message || 'Failed to create guild', 'err');
    }
  };

  const handleJoinGuild = async (code = '', guildId = '') => {
    setJoining(true);
    try {
      const joined = await joinGuild(code || joinCodeInput, guildId);
      toast(`Joined ${joined.name}!`, 'ok');
      setJoinCodeInput('');
      await loadData();
    } catch (err) {
      toast(err.message || 'Failed to join guild. Check code.', 'err');
    } finally {
      setJoining(false);
    }
  };

  const activeGuild = myGuilds[0] || guilds[0];

  return (
    <div className="page-body">
      <div className="flex justify-between items-center mb-16 flex-wrap gap-8">
        <div>
          <h2 className="page-title">🏛️ University Guild System & Campus Hubs</h2>
          <p className="page-subtitle">
            Join your university academic guild, compete on global university leaderboards, and share department resources.
          </p>
        </div>
        <div className="flex gap-8 flex-wrap">
          <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
            + Create University Guild
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="card mb-16 p-18">
          <div className="card-title mb-12">New University Academic Guild</div>
          <form onSubmit={handleCreateGuild} className="flex flex-col gap-12">
            <div className="flex gap-12 flex-wrap">
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="University Guild Name (e.g. MIT Engineering Guild)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                className="form-input"
                style={{ width: '200px' }}
                placeholder="Campus Domain (e.g. mit.edu)"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <textarea
              className="form-input text-sm"
              rows={2}
              placeholder="Guild description and department focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-8">
              <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="primary-btn">Create Guild</button>
            </div>
          </form>
        </div>
      )}

      {/* Join Guild Bar */}
      <div className="card mb-16 p-14 flex justify-between items-center flex-wrap gap-12">
        <div className="flex items-center gap-8">
          <span className="text-sm font-semibold">Join Campus Guild by Code:</span>
          <input
            type="text"
            className="form-input text-mono uppercase text-xs"
            style={{ width: '220px', padding: '6px 12px' }}
            placeholder="e.g. GUILD-MIT-1001"
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button
            className="primary-btn text-xs"
            onClick={() => handleJoinGuild()}
            disabled={joining || !joinCodeInput}
          >
            {joining ? 'Joining...' : 'Join Guild'}
          </button>
        </div>
        <div className="text-xs text-mute">
          Auto-Join: Accounts with academic domain emails (.edu, .ac.in) match automatically.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-16" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Left Column: My Active Guild & Roster */}
        <div className="flex flex-col gap-16">
          {activeGuild ? (
            <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className="card-header flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-8 mb-4">
                    <span className="text-2xl">{activeGuild.icon_badge || '🏛️'}</span>
                    <h3 className="card-title text-lg font-bold">{activeGuild.name}</h3>
                  </div>
                  <div className="text-xs text-mute font-mono">
                    Domain: <strong>{activeGuild.domain}</strong> | Code: <strong className="text-amber">{activeGuild.code}</strong>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="badge badge-sage mb-4">AVG RAS: {((activeGuild.avg_ras || 0.85) * 100).toFixed(0)}%</span>
                  <span className="text-xs text-mute">{activeGuild.member_count || 1} Enrolled Members</span>
                </div>
              </div>
              <div className="card-body">
                <p className="text-sm mb-16 text-light" style={{ lineHeight: 1.5 }}>
                  {activeGuild.description || 'Official University Academic Reasoning Guild for department collaboration and rubric alignment.'}
                </p>

                {/* Campus Roster */}
                <h4 className="text-xs text-mute uppercase font-semibold mb-12">Campus Faculty & Student Roster:</h4>
                <div className="flex flex-col gap-8">
                  {activeGuild.members?.map((m, idx) => (
                    <div key={m.id || idx} className="p-10 bg-slate border-rule rounded flex justify-between items-center">
                      <div className="flex items-center gap-8">
                        <div className="user-avatar" style={{ width: '26px', height: '26px', fontSize: '10px' }}>
                          {m.user?.name ? m.user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center gap-4">
                            <span>{m.user?.name || 'Academic Member'}</span>
                            <span className="text-sage">✓</span>
                          </div>
                          <div className="text-xs text-mute">{m.user?.email || ''}</div>
                        </div>
                      </div>
                      <span className="badge badge-amber text-xs uppercase">{m.user?.role || 'Member'}</span>
                    </div>
                  ))}
                  {(!activeGuild.members || activeGuild.members.length === 0) && (
                    <div className="text-mute text-xs p-12 text-center">No enrolled members listed yet.</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-24 text-center text-mute">
              No active campus guild joined yet. Join or create a University Guild above.
            </div>
          )}
        </div>

        {/* Right Column: Global University Leaderboard */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🏆 Global University Leaderboard</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>University Guild</th>
                  <th>Avg RAS</th>
                </tr>
              </thead>
              <tbody>
                {guilds.map((g, rank) => (
                  <tr key={g.id} className={g.has_joined ? 'bg-slate-soft' : ''}>
                    <td className="font-bold text-mono" style={{ color: rank === 0 ? '#f59e0b' : rank === 1 ? '#94a3b8' : '#d97706' }}>
                      #{rank + 1}
                    </td>
                    <td>
                      <div className="font-semibold text-xs flex items-center gap-4">
                        <span>{g.icon_badge}</span>
                        <span>{g.name}</span>
                      </div>
                      <div className="text-xs text-mute font-mono">{g.domain}</div>
                    </td>
                    <td className="text-mono font-bold text-sage">
                      {((g.avg_ras || 0.85) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
