import { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import TrainingConfig from './components/TrainingConfig';
import ProgressDisplay from './components/ProgressDisplay';
import SessionSelector from './components/SessionSelector';
import './App.css';

interface TrainingProgress {
  epoch: number;
  total_epochs: number;
  gen_loss: number;
  disc_loss: number;
  progress: number;
  image_url?: string;
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

interface Session {
  session_id: string;
  session_name: string | null;
  status: string;
  created_at: string | null;
  config?: any;
  results?: any;
  artifacts?: any;
}

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [lossHistory, setLossHistory] = useState<LossData[]>([]);
  const [epochImages, setEpochImages] = useState<EpochImage[]>([]);

  const handleSessionSelect = (session: Session | null) => {
    setSelectedSession(session);
    
    if (session) {
      setSessionId(session.session_id);
      setSessionName(session.session_name || '');
      
      if (session.status === 'completed' && session.results) {
        setIsComplete(true);
        
        const transformedLossHistory = (session.results.loss_history || []).map((item: any) => ({
          epoch: item.epoch,
          genLoss: item.gen_loss,
          discLoss: item.disc_loss
        }));
        setLossHistory(transformedLossHistory);
        
        if (session.artifacts && session.artifacts.generated_images) {
          const images = session.artifacts.generated_images.map((filename: string) => {
            const epochMatch = filename.match(/epoch_(\d+)\.png/);
            const epoch = epochMatch ? parseInt(epochMatch[1]) : 0;
            return {
              epoch: epoch,
              url: `/api/generated-image/${session.session_id}/${filename}`
            };
          }).sort((a, b) => a.epoch - b.epoch);
          setEpochImages(images);
        }
        
        const finalLoss = session.results.loss_history?.[session.results.loss_history.length - 1];
        if (finalLoss) {
          setTrainingProgress({
            epoch: session.results.epochs_completed,
            total_epochs: session.config?.epochs || session.results.epochs_completed,
            gen_loss: finalLoss.gen_loss,
            disc_loss: finalLoss.disc_loss,
            progress: 100
          });
        }
        
        addLog(`Loaded session: ${session.session_name || session.session_id}`);
        addLog(`Status: ${session.status}`);
        addLog(`Epochs completed: ${session.results.epochs_completed}`);
      } else {
        resetTrainingState();
      }
    } else {
      resetSession();
    }
  };

  const resetSession = () => {
    setSessionId(null);
    setSessionName('');
    setSelectedSession(null);
    setCsvFile(null);
    setImageFiles([]);
    resetTrainingState();
  };

  const resetTrainingState = () => {
    setIsComplete(false);
    setTrainingProgress(null);
    setLossHistory([]);
    setEpochImages([]);
    setLogs([]);
  };

  const handleCsvUpload = async (file: File) => {
    setCsvFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload/csv', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setSessionId(data.session_id);
      addLog(`CSV uploaded: ${file.name}`);
    } catch (error) {
      addLog(`Error uploading CSV: ${error}`);
    }
  };

  const handleImagesUpload = async (files: File[]) => {
    if (!sessionId) {
      addLog('Please upload CSV first');
      return;
    }

    if (files.length === 0) {
      addLog('No images selected');
      return;
    }

    // Check if it's a ZIP file
    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      addLog(`Uploading ZIP file: ${files[0].name}...`);
      const formData = new FormData();
      formData.append('file', files[0]);

      try {
        const response = await fetch(`http://localhost:8000/api/upload/images-zip/${sessionId}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          addLog(`Error: ${errorData.detail || 'Failed to upload ZIP'}`);
          return;
        }
        
        const data = await response.json();
        setImageFiles(files);
        addLog(`✓ ${data.message}`);
      } catch (error) {
        addLog(`Error uploading ZIP: ${error}`);
      }
      return;
    }

    // Batch upload for multiple files
    const BATCH_SIZE = 500;
    const totalFiles = files.length;
    let totalUploaded = 0;

    addLog(`Uploading ${totalFiles} images in batches of ${BATCH_SIZE}...`);
    setImageFiles(files);

    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(totalFiles / BATCH_SIZE);

      addLog(`Uploading batch ${batchNum}/${totalBatches} (${batch.length} files)...`);

      const formData = new FormData();
      batch.forEach(file => formData.append('files', file));

      try {
        const response = await fetch(`http://localhost:8000/api/upload/images-batch/${sessionId}`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          addLog(`Error in batch ${batchNum}: ${errorData.detail || 'Failed to upload'}`);
          return;
        }
        
        const data = await response.json();
        totalUploaded += data.uploaded_count;
        addLog(`✓ Batch ${batchNum}/${totalBatches} complete (${totalUploaded}/${totalFiles} uploaded)`);
      } catch (error) {
        addLog(`Error uploading batch ${batchNum}: ${error}`);
        return;
      }
    }

    addLog(`🎉 All ${totalUploaded} images uploaded successfully!`);
  };

  const addLog = useCallback((message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  }, []);

  const startTraining = (config: any) => {
    if (!sessionId || !csvFile || imageFiles.length === 0) {
      addLog('Please upload CSV and images first');
      return;
    }

    setIsTraining(true);
    setIsComplete(false);
    setTrainingProgress(null);
    setLossHistory([]);
    setEpochImages([]);
    addLog('Starting training...');

    const ws = new WebSocket(`ws://localhost:8000/ws/train/${sessionId}`);

    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        session_id: sessionId, 
        session_name: sessionName,
        ...config 
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'progress') {
        setTrainingProgress(data);
        
        setLossHistory(prev => [...prev, {
          epoch: data.epoch,
          genLoss: data.gen_loss,
          discLoss: data.disc_loss
        }]);
        
        if (data.image_url) {
          setEpochImages(prev => [...prev, {
            epoch: data.epoch,
            url: data.image_url
          }]);
        }
      } else if (data.type === 'info') {
        addLog(data.message);
      } else if (data.type === 'status') {
        addLog(data.message);
      } else if (data.type === 'complete') {
        addLog(data.message);
        setIsComplete(true);
        setIsTraining(false);
      } else if (data.type === 'error') {
        addLog(`Error: ${data.message}`);
        setIsTraining(false);
      }
    };

    ws.onerror = (error) => {
      addLog(`WebSocket error: ${error}`);
      setIsTraining(false);
    };

    ws.onclose = () => {
      if (isTraining) {
        addLog('Connection closed');
        setIsTraining(false);
      }
    };
  };

  return (
    <div className="app">
      <div className="container">
        <h1>🎨 GAN Trainer</h1>
        <p className="subtitle">Train a Generative Adversarial Network</p>

        <SessionSelector
          onSessionSelect={handleSessionSelect}
          disabled={isTraining}
        />

        {!selectedSession || selectedSession.status !== 'completed' ? (
          <>
            <FileUpload
              onCsvUpload={handleCsvUpload}
              onImagesUpload={handleImagesUpload}
              csvFile={csvFile}
              imageCount={imageFiles.length}
              disabled={isTraining}
            />

            <div className="session-name-input">
              <label htmlFor="session-name">Session Name (optional):</label>
              <input
                id="session-name"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., My First Training Run"
                disabled={isTraining}
              />
            </div>

            <TrainingConfig
              onStartTraining={startTraining}
              disabled={!sessionId || !csvFile || imageFiles.length === 0 || isTraining}
              isTraining={isTraining}
              initialConfig={selectedSession?.config}
            />
          </>
        ) : null}

        <ProgressDisplay
          progress={trainingProgress}
          logs={logs}
          isComplete={isComplete}
          lossHistory={lossHistory}
          epochImages={epochImages}
          sessionId={sessionId}
          sessionName={sessionName || selectedSession?.session_name}
        />
      </div>
    </div>
  );
}

export default App;
