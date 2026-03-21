import { useState, useEffect } from 'react';
import './TrainingConfig.css';

interface TrainingConfigProps {
  onStartTraining: (config: any) => void;
  disabled: boolean;
  isTraining: boolean;
  initialConfig?: any;
}

function TrainingConfig({ onStartTraining, disabled, isTraining, initialConfig }: TrainingConfigProps) {
  const [config, setConfig] = useState({
    codings_size: 100,
    image_size: 24,
    image_channels: 4,
    batch_size: 16,
    epochs: 50
  });

  useEffect(() => {
    if (initialConfig) {
      setConfig({
        codings_size: initialConfig.codings_size || 100,
        image_size: initialConfig.image_size || 24,
        image_channels: initialConfig.image_channels || 4,
        batch_size: initialConfig.batch_size || 16,
        epochs: initialConfig.epochs || 50
      });
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTraining(config);
  };

  return (
    <div className="training-config-section">
      <h2>⚙️ Training Configuration</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="config-grid">
          <div className="config-item">
            <label>Latent Size</label>
            <input
              type="number"
              value={config.codings_size}
              onChange={(e) => setConfig({ ...config, codings_size: parseInt(e.target.value) })}
              disabled={disabled || isTraining}
              min="1"
            />
          </div>

          <div className="config-item">
            <label>Image Size</label>
            <input
              type="number"
              value={config.image_size}
              onChange={(e) => setConfig({ ...config, image_size: parseInt(e.target.value) })}
              disabled={disabled || isTraining}
              min="1"
            />
          </div>

          <div className="config-item">
            <label>Image Channels</label>
            <input
              type="number"
              value={config.image_channels}
              onChange={(e) => setConfig({ ...config, image_channels: parseInt(e.target.value) })}
              disabled={disabled || isTraining}
              min="1"
              max="4"
            />
          </div>

          <div className="config-item">
            <label>Batch Size</label>
            <input
              type="number"
              value={config.batch_size}
              onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
              disabled={disabled || isTraining}
              min="1"
            />
          </div>

          <div className="config-item">
            <label>Epochs</label>
            <input
              type="number"
              value={config.epochs}
              onChange={(e) => setConfig({ ...config, epochs: parseInt(e.target.value) })}
              disabled={disabled || isTraining}
              min="1"
            />
          </div>
        </div>

        <button
          type="submit"
          className={`start-button ${isTraining ? 'training' : ''}`}
          disabled={disabled || isTraining}
        >
          {isTraining ? (
            <>
              <span className="spinner"></span>
              Training...
            </>
          ) : (
            <>
              🚀 Start Training
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TrainingConfig;
