import { useState, useEffect } from 'react';
import './SessionSelector.css';

interface Session {
  session_id: string;
  session_name: string | null;
  status: string;
  created_at: string | null;
  config?: any;
  results?: any;
  artifacts?: any;
}

interface SessionSelectorProps {
  onSessionSelect: (session: Session | null) => void;
  disabled: boolean;
}

function SessionSelector({ onSessionSelect, disabled }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('new');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/sessions');
      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessionId = e.target.value;
    setSelectedSessionId(sessionId);

    if (sessionId === 'new') {
      onSessionSelect(null);
    } else {
      try {
        const response = await fetch(`http://localhost:8000/api/session/${sessionId}`);
        const sessionData = await response.json();
        onSessionSelect(sessionData);
      } catch (error) {
        console.error('Error fetching session details:', error);
      }
    }
  };

  const formatSessionDisplay = (session: Session) => {
    const name = session.session_name || 'Unnamed Session';
    const date = session.created_at 
      ? new Date(session.created_at).toLocaleString()
      : 'Unknown date';
    const status = session.status ? `[${session.status}]` : '';
    return `${name} - ${date} ${status}`;
  };

  return (
    <div className="session-selector-section">
      <h2>📁 Session</h2>
      <div className="session-selector-container">
        <select
          value={selectedSessionId}
          onChange={handleSessionChange}
          disabled={disabled || loading}
          className="session-select"
        >
          <option value="new">➕ New Session</option>
          {sessions.map((session) => (
            <option key={session.session_id} value={session.session_id}>
              {formatSessionDisplay(session)}
            </option>
          ))}
        </select>
        <button 
          onClick={fetchSessions}
          disabled={disabled || loading}
          className="refresh-button"
          title="Refresh sessions"
        >
          🔄
        </button>
      </div>
    </div>
  );
}

export default SessionSelector;
