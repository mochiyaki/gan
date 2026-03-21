import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUpload.css';

interface FileUploadProps {
  onCsvUpload: (file: File) => void;
  onImagesUpload: (files: File[]) => void;
  csvFile: File | null;
  imageCount: number;
  disabled: boolean;
}

function FileUpload({ onCsvUpload, onImagesUpload, csvFile, imageCount, disabled }: FileUploadProps) {
  const onCsvDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onCsvUpload(acceptedFiles[0]);
    }
  }, [onCsvUpload]);

  const onImagesDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImagesUpload(acceptedFiles);
    }
  }, [onImagesUpload]);

  const csvDropzone = useDropzone({
    onDrop: onCsvDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
    disabled
  });

  const imagesDropzone = useDropzone({
    onDrop: onImagesDrop,
    accept: { 
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/zip': ['.zip']
    },
    multiple: true,
    disabled,
    noClick: false,
    noKeyboard: false
  });

  return (
    <div className="file-upload-section">
      <h2>📁 Upload Dataset</h2>
      
      <div className="upload-row">
        <div
          {...csvDropzone.getRootProps()}
          className={`dropzone ${csvDropzone.isDragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        >
          <input {...csvDropzone.getInputProps()} />
          <div className="dropzone-content">
            <span className="icon">📄</span>
            <p className="main-text">
              {csvFile ? csvFile.name : 'Drop CSV file here'}
            </p>
            <p className="sub-text">or click to select</p>
            {csvFile && <span className="badge">✓ Uploaded</span>}
          </div>
        </div>

        <div
          {...imagesDropzone.getRootProps()}
          className={`dropzone ${imagesDropzone.isDragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        >
          <input {...imagesDropzone.getInputProps()} />
          <div className="dropzone-content">
            <span className="icon">🖼️</span>
            <p className="main-text">
              {imageCount > 0 ? `${imageCount} images` : 'Drop images or ZIP here'}
            </p>
            <p className="sub-text">Supports batch upload & ZIP files</p>
            {imageCount > 0 && <span className="badge">✓ Uploaded</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;
