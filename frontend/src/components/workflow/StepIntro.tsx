import React from 'react';
import './workflow.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface StepIntroProps {
  language: string;
  setLanguage: (lang: string) => void;
  onStart: () => void;
}

const steps = [
  'Upload a photo of your product',
  'Let us extract the ingredients for you',
  'Ask our AI any questions you have',
];

const StepIntro: React.FC<StepIntroProps> = ({ language, setLanguage, onStart }) => (
  <div
    style={{
      background: '#fff',
      borderRadius: '28px',
      boxShadow: '0 8px 32px rgba(60,60,60,0.18), 0 1.5px 8px rgba(0,0,0,0.08)',
      padding: '38px 44px 32px 44px',
      minWidth: 420,
      height: '450px',
      width: '600px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      border: '2px solid #E2E0DF',
    }}
  >
    <div style={{ fontWeight: 800, fontSize: "24px", letterSpacing: 1, marginBottom: 8, textAlign: 'center', color: '#444' }}>PRODUCT ADVISOR</div>
    <div style={{ fontSize: "16px", color: '#666', marginBottom: 32, textAlign: 'center' }}>
      Find the right insights for your product
    </div>
    <div style={{ marginBottom: 36, width: '100%' }}>
      {steps.map((step, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: idx < steps.length - 1 ? 24 : 0, position: 'relative' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#fff',
            border: '1.5px solid #E2E0DF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: 18,
            color: '#444',
            flexShrink: 0,
            position: 'relative'
          }}>
            {idx + 1}
            {idx < steps.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '100%',
                transform: 'translateX(-50%)',
                width: 2,
                height: 32,
                background: '#E2E0DF',
                zIndex: 0
              }} />
            )}
          </div>
          <div style={{ marginLeft: 18, fontSize: "18px", color: '#222', fontWeight: 400 }}>
            {step}
          </div>
        </div>
      ))}
    </div>
    <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 24, marginTop: 12 }}>
      <button
        className="step-intro-btn"
        onClick={onStart}
        style={{
          padding: '10px 38px',
          borderRadius: 22,
          color: '#fff',
          border: 'none',
          fontWeight: 500,
          fontSize: "18px",
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
        }}
      >
        Get Started
      </button>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        className="step-intro-select"
        style={{
            borderRadius: 12,
            border: 'none',
            background: '#F3F1F0',
            color: '#888',
            fontWeight: 500,
            fontSize: "16px",
            outline: 'none',
            minWidth: 110,
            cursor: 'pointer',
            appearance: 'none', // loại bỏ mũi tên mặc định
            paddingRight: 30, // chừa chỗ cho icon
          }}
      >
        <div className="step-intro-arrow">
          <KeyboardArrowDownRoundedIcon />
        </div>
        <option value="en">English</option>
        <option value="vi">Tiếng Việt</option>
      </select>

      <div style={{
        position: 'absolute',
        right: 10,
        top: '60%',
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
    }}>
        <KeyboardArrowDownRoundedIcon style={{ fontSize: 20, color: '#888' }} />
    </div>
      </div>
      
    </div>
  </div>
);

export default StepIntro;
