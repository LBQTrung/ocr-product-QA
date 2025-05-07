import React, { useRef, useState } from 'react';
import DriveFolderUploadRoundedIcon from '@mui/icons-material/DriveFolderUploadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

interface StepUploadProps {
  onUpload: (img: string) => void;
}

const StepUpload: React.FC<StepUploadProps> = ({ onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [readyToContinue, setReadyToContinue] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImgUrl(url);
      setReadyToContinue(true);
    }
  };

  // Placeholder for camera (chưa làm chức năng camera thực)
  const handleCameraClick = () => {
    alert('Camera capture is not implemented yet.');
  };

  const handleRemoveImage = () => {
    setImgUrl(null);
    setReadyToContinue(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContinue = () => {
    if (imgUrl) {
      onUpload(imgUrl);
    }
  };

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '28px',
        boxShadow: '0 8px 32px rgba(60,60,60,0.18), 0 1.5px 8px rgba(0,0,0,0.08)',
        padding: '38px 44px 32px 44px',
        minWidth: 480,
        maxWidth: 600,
        height: '450px',
        margin: '40px auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        border: '2px solid #E2E0DF',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: '24px', letterSpacing: 1, marginBottom: 8, textAlign: 'center', color: '#444' }}>
        UPLOAD YOUR PRODUCT IMAGE
      </div>
      <div style={{ fontSize: '16px', color: '#666', marginBottom: 20, textAlign: 'center', maxWidth: 480 }}>
        Choose a clear photo of the back of product packaging - where the ingredients, nutritional facts, or usage instructions are printed
      </div>
      {imgUrl ? (
        <div style={{ position: 'relative', margin: '0 auto 32px auto', width: 300, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={imgUrl}
            alt="preview"
            style={{
              width: 300,
              height: 180,
              objectFit: 'contain',
              borderRadius: 12,
              border: '1.5px solid #888',
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          />
          <button
            onClick={handleRemoveImage}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: '#545454',
              border: '1.5px solid #bbb',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              padding: 0,
            }}
            aria-label="Remove image"
          >
            <CloseRoundedIcon style={{ fontSize: 22, color: '#fff' }} />
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 34, marginTop: 10, width: '100%' }}>
          {/* Upload file */}
          <div
            style={{
              border: '2px dashed #222',
              borderRadius: 16,
              padding: '2px 6px',
              cursor: 'pointer',
              minWidth: 210,
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s',
              background: '#fff',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <span role="img" aria-label="upload" style={{ fontSize: 54 }}>
              <DriveFolderUploadRoundedIcon style={{ fontSize: 54 }} />
            </span>
            <div style={{ fontSize: 16, color: '#222', fontWeight: 500, textAlign: 'center', marginTop: 8 }}>
              Drag and drop an image here or<br />click to upload
            </div>
          </div>
          {/* Camera */}
          <div
            style={{
              border: '2px dashed #222',
              borderRadius: 16,
              padding: '2px 16px',
              cursor: 'pointer',
              minWidth: 210,
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s',
              background: '#fff',
            }}
            onClick={handleCameraClick}
          >
            <span role="img" aria-label="camera" style={{ fontSize: 54}}>
              <CameraAltRoundedIcon style={{ fontSize: 54 }} />
            </span>
            <div style={{ fontSize: 16, color: '#222', fontWeight: 500, textAlign: 'center', marginTop: 20 }}>
              Take a photo with camera
            </div>
          </div>
        </div>
      )}
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
      <button
        className="step-upload-btn"
        disabled={!readyToContinue}
        style={readyToContinue ? {
          padding: '12px 38px',
          borderRadius: 22,
          color: '#fff',
          border: 'none',
          fontWeight: 500,
          fontSize: 18,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          minWidth: 140,
          transition: 'background 0.2s, color 0.2s',
        }: {
            padding: '12px 38px',
            borderRadius: 22,
            background: '#E2E0DF',
            color: '#fff',
            border: 'none',
            fontWeight: 500,
            fontSize: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'not-allowed',
            minWidth: 140,
            transition: 'background 0.2s, color 0.2s',
        }}
        onClick={handleContinue}
      >
        Continue
      </button>
    </div>
  );
};

export default StepUpload; 