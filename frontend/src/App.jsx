import React, { useState, useEffect } from 'react';

export default function App() {
  const [connections, setConnections] = useState([]);
  const [selectedDev, setSelectedDev] = useState('Alice');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState('checking');
  const [error, setError] = useState('');

  const API_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const res = await fetch(`${API_URL}/graph`);
      if (!res.ok) throw new Error('Database or API server is unreachable');
      const data = await res.json();
      setConnections(data.connections || []);
      setDbStatus('connected');
    } catch (err) {
      setError(err.message);
      setDbStatus('error');
    }
  };

  const fetchMultiHopQuery = async (devName) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/recommendations/${devName}`);
      if (!res.ok) throw new Error('Failed to execute Cypher traversal query');
      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header Container */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Developer Network Explorer</h1>
          <p style={styles.subtitle}>
            Graph Database Visualizer powered by <strong>CognoDB Cloud</strong> & <strong>Neo4j Driver</strong>[cite: 1]
          </p>
        </div>
        <div style={styles.statusBadge(dbStatus)}>
          <span style={styles.statusDot(dbStatus)}></span>
          {dbStatus === 'connected' && 'CognoDB Connected'}
          {dbStatus === 'checking' && 'Connecting...'}
          {dbStatus === 'error' && 'Database Offline'}
        </div>
      </header>

      {/* Error Alert Box */}
      {error && (
        <div style={styles.errorBox}>
          <strong>Connection Alert:</strong> {error}
        </div>
      )}

      {/* Main Interactive Query Card */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Multi-Hop Skill Recommendation</h2>
          <span style={styles.tag}>2-Hop Traversal</span>
        </div>
        <p style={styles.cardDesc}>
          Executes a Cypher graph pattern match <code>(Developer)-[:KNOWS*1..2]-&gt;(Peer)-[:HAS_SKILL]-&gt;(Skill)</code> to discover reachable skills through network connections[cite: 1].
        </p>

        <div style={styles.controls}>
          <select 
            value={selectedDev} 
            onChange={(e) => setSelectedDev(e.target.value)}
            style={styles.select}
          >
            <option value="Alice">Developer: Alice</option>
            <option value="Bob">Developer: Bob</option>
            <option value="Charlie">Developer: Charlie</option>
          </select>

          <button 
            onClick={() => fetchMultiHopQuery(selectedDev)} 
            disabled={loading || dbStatus === 'error'}
            style={styles.button(loading || dbStatus === 'error')}
          >
            {loading ? 'Traversing Graph...' : 'Traverse Graph Network'}
          </button>
        </div>

        {/* Dynamic Query Results */}
        <div style={styles.resultsArea}>
          {loading && (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p>Executing Cypher query on CognoDB instance...</p>
            </div>
          )}

          {!loading && recommendations.length > 0 && (
            <div style={styles.grid}>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={styles.resultCard}>
                  <div style={styles.resultPeer}>👤 {rec.peer}</div>
                  <div style={styles.resultSkill}>
                    Skill: <strong>{rec.skill}</strong>
                  </div>
                  <span style={styles.proficiencyBadge}>{rec.proficiency}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div style={styles.emptyState}>
              Select a developer and click <strong>Traverse Graph Network</strong> to run the multi-hop query.
            </div>
          )}
        </div>
      </section>

      {/* Active Graph Relationships Table */}
      <section style={styles.card}>
        <h2 style={styles.cardTitle}>Active Graph Relationships</h2>
        <p style={styles.cardDesc}>Raw nodes and directional edges currently loaded in your graph database[cite: 1].</p>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Source Node</th>
                <th style={styles.th}>Relationship</th>
                <th style={styles.th}>Target Node</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((c, idx) => (
                <tr key={idx} style={idx % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>
                    <span style={styles.nodeBadge('#4f46e5')}>(:Developer {c.source})</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.relBadge}>-[ :{c.relationship} ]-&gt;</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.nodeBadge('#059669')}>({c.target})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// Inline Glassmorphism & Modern Dashboard Styling
const styles = {
  page: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '2.5rem 1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: 0,
    background: 'linear-gradient(to right, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: '0.25rem',
    fontSize: '0.95rem',
  },
  statusBadge: (status) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    color: status === 'connected' ? '#34d399' : '#f87171',
    border: `1px solid ${status === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
  }),
  statusDot: (status) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: status === 'connected' ? '#10b981' : '#ef4444',
  }),
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '1.75rem',
    marginBottom: '2rem',
    border: '1px solid #334155',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: 0,
    color: '#f1f5f9',
  },
  tag: {
    backgroundColor: '#3730a3',
    color: '#c7d2fe',
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  cardDesc: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    margin: '0.5rem 0 1.5rem 0',
    lineHeight: '1.4',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  select: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    border: '1px solid #475569',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    flex: '1',
    minWidth: '200px',
    outline: 'none',
  },
  button: (disabled) => ({
    backgroundColor: disabled ? '#475569' : '#6366f1',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s',
  }),
  resultsArea: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '1.25rem',
    border: '1px solid #334155',
    minHeight: '100px',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    color: '#818cf8',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #334155',
    borderTop: '3px solid #818cf8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '0.5rem',
  },
  emptyState: {
    color: '#64748b',
    textAlign: 'center',
    padding: '1rem',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  resultCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  resultPeer: {
    fontWeight: '700',
    fontSize: '1rem',
    color: '#38bdf8',
  },
  resultSkill: {
    fontSize: '0.9rem',
    color: '#cbd5e1',
  },
  proficiencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#34d399',
    fontSize: '0.75rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontWeight: '600',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
    fontSize: '0.9rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    borderBottom: '2px solid #334155',
    color: '#94a3b8',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #334155',
  },
  trEven: { backgroundColor: '#1e293b' },
  trOdd: { backgroundColor: '#182232' },
  nodeBadge: (bg) => ({
    backgroundColor: bg,
    color: '#ffffff',
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
  }),
  relBadge: {
    color: '#f59e0b',
    fontFamily: 'monospace',
    fontWeight: '700',
  },
};