import { useState } from 'react';
import './EpochImageGallery.css';

interface EpochImageGalleryProps {
  images: Array<{
    epoch: number;
    url: string;
  }>;
}

function EpochImageGallery({ images }: EpochImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <div className="epoch-gallery-empty">
        <p>Generated images will appear here...</p>
      </div>
    );
  }

  const latestImage = images[images.length - 1];

  return (
    <div className="epoch-gallery-container">
      <h3>🎨 Generated Images</h3>
      
      <div className="preview-section">
        <div className="preview-label">
          Latest: Epoch {selectedEpoch || latestImage.epoch}
        </div>
        <div className="preview-image-container">
          <img 
            src={`http://localhost:8000${selectedImage || latestImage.url}`}
            alt={`Epoch ${selectedEpoch || latestImage.epoch}`}
            className="preview-image"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
            }}
          />
        </div>
      </div>

      <div className="thumbnail-grid">
        {images.slice().reverse().map((img) => (
          <div 
            key={img.epoch}
            className={`thumbnail-item ${selectedImage === img.url ? 'selected' : ''}`}
            onClick={() => {
              setSelectedImage(img.url);
              setSelectedEpoch(img.epoch);
            }}
          >
            <img 
              src={`http://localhost:8000${img.url}`}
              alt={`Epoch ${img.epoch}`}
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
            <div className="thumbnail-label">Epoch {img.epoch}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EpochImageGallery;
