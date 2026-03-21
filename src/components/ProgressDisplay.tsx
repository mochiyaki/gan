import { useEffect, useRef } from 'react';
import LossChart from './LossChart';
import EpochImageGallery from './EpochImageGallery';
import './ProgressDisplay.css';

interface TrainingProgress {
  epoch: number;
  total_epochs: number;
  gen_loss: number;
  disc_loss: number;
  progress: number;
}

interface LossData {
  epoch: number;
  genLoss: number;
  discLoss: number;
}

interface EpochImage {
  epoch: number;
  url: string;
}

interface ProgressDisplayProps {
  progress: TrainingProgress | null;
  logs: string[];
  isComplete: boolean;
  lossHistory: LossData[];
  epochImages: EpochImage[];
  sessionId: string | null;
  sessionName?: string | null;
}

function ProgressDisplay({ progress, logs, isComplete, lossHistory, epochImages, sessionId, sessionName }: ProgressDisplayProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleDownload = async () => {
    if (!sessionId) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/download/model/${sessionId}`);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generator_model.safetensors';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading model:', error);
      alert('Failed to download model. Please try again.');
    }
  };

  return (
    <div className="progress-section">
      <h2>📊 Training Progress</h2>
      {sessionName && (
        <div className="session-name-display">
          <strong>Session:</strong> {sessionName}
        </div>
      )}

      {progress && (
        <div className="progress-container">
          <div className="progress-header">
            <div className="epoch-info">
              <span className="label">Epoch</span>
              <span className="value">{progress.epoch} / {progress.total_epochs}</span>
            </div>
            <div className="percentage">{progress.progress.toFixed(1)}%</div>
          </div>

          <div className="progress-bar-container">
            <div 
              className={`progress-bar ${isComplete ? 'complete' : ''}`}
              style={{ width: `${progress.progress}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Generator Loss</div>
              <div className="stat-value">{progress.gen_loss.toFixed(4)}</div>
              <div className="stat-icon">🎨</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Discriminator Loss</div>
              <div className="stat-value">{progress.disc_loss.toFixed(4)}</div>
              <div className="stat-icon">🔍</div>
            </div>
          </div>
        </div>
      )}

      <LossChart data={lossHistory} />
      
      <EpochImageGallery images={epochImages} />

      {logs.length > 0 && (
        <div className="logs-container">
          <h3>📝 Logs</h3>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}

      {isComplete && (
        <div className="completion-banner">
          <span className="completion-icon">✨</span>
          <span>Training Complete!</span>
          <span className="completion-icon">✨</span>
          <button onClick={handleDownload} className="download-button">
            📥 Download Model
          </button>
        </div>
      )}
    </div>
  );
}

export default ProgressDisplay;
