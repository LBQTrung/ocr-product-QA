import React from 'react';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import ContentPasteSearchRoundedIcon from '@mui/icons-material/ContentPasteSearchRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

interface StepLoadingProps {
  step: 1 | 2 | 3;
}

const stepData = [
  {
    icon: (
      <ContentPasteSearchRoundedIcon style={{ fontSize: 80 }} />
    ),
    desc: 'Analyzing image layout, detecting key text regions...',
    progress: 20,
  },
  {
    icon: (
      <InsightsRoundedIcon style={{ fontSize: 80 }} />
    ),
    desc: 'Recognizing text and extracting ingredients, usage info...',
    progress: 60,
  },
  {
    icon: (
      <TranslateRoundedIcon style={{ fontSize: 80 }} />
    ),
    desc: 'Translating extracted content to your preferred language...',
    progress: 100,
  },
];

const StepLoading: React.FC<StepLoadingProps> = ({ step }) => {
  const { icon, desc, progress } = stepData[step - 1];
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
      <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: 1, marginBottom: 8, textAlign: 'center', color: '#444' }}>ANALYZING YOUR PRODUCT IMAGE</h2>
      <p style={{ color: '#444', fontSize: 16, marginTop: 8, textAlign: 'center' }}>We're extracting ingredients and product info so you can ask anything about it</p>
      <div style={{ margin: '32px 0', textAlign: 'center' }}>{icon}</div>
      <div style={{ width: 300, height: 20, background: '#eee', borderRadius: 10, margin: '0 auto 16px auto', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: '#222', transition: 'width 1s' }} />
      </div>
      <p style={{ minHeight: 40 }}>{desc}</p>
    </div>
  );
};

export default StepLoading; 