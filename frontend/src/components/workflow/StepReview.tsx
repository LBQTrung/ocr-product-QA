import React, { useState, useRef } from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import './StepReview.css';

interface StepReviewProps {
  data: {
    Ingredients: string[];
    image: string;
    [key: string]: string | string[] | undefined; // Allow for additional fields
  };
  setData: (data: StepReviewProps['data']) => void;
  onContinue: () => void;
}

const StepReview: React.FC<StepReviewProps> = ({ data, setData, onContinue }) => {
  const [newIngredient, setNewIngredient] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0, zoomX: 0, zoomY: 0 });
  const [previewVisible, setPreviewVisible] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate the position for the preview tooltip
    const tooltipX = e.clientX + 20; // 20px offset from cursor
    const tooltipY = e.clientY - 150; // Center vertically

    // Calculate the zoom position relative to the image size
    const zoomX = ((x / rect.width) * 100 - 50) * -1; // Center the zoom
    const zoomY = ((y / rect.height) * 100 - 50) * -1; // Center the zoom

    setPreviewPosition({ 
      x: tooltipX, 
      y: tooltipY,
      zoomX,
      zoomY
    });
  };

  const handleMouseEnter = () => {
    setPreviewVisible(true);
  };

  const handleMouseLeave = () => {
    setPreviewVisible(false);
  };

  const handleRemoveIngredient = (idx: number) => {
    const newIngredients = data.Ingredients.filter((_, i) => i !== idx);
    setData({ ...data, Ingredients: newIngredients });
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setData({ ...data, Ingredients: [...data.Ingredients, newIngredient.trim()] });
      setNewIngredient('');
    }
  };

  // Get all fields except ingredients and image
  const additionalFields = Object.entries(data).filter(([key]) => !['Ingredients', 'image'].includes(key));

  return (
    <div
    style={{
      background: '#fff',
      borderRadius: '28px',
      boxShadow: '0 8px 32px rgba(60,60,60,0.18), 0 1.5px 8px rgba(0,0,0,0.08)',
      padding: '38px 44px 32px 44px',
      minWidth: 480,
      maxWidth: 800,
      height: '450px',
      margin: '40px auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      border: '2px solid #E2E0DF',
    }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: 8 , fontSize: 24, fontWeight: 800}}>YOUR PRODUCT ANALYSIS RESULTS</h2>
      <div style={{ textAlign: 'center', color: '#444', marginBottom: 24, fontSize: 16, marginTop: 8 }}>
        Here's the information we extracted from your image. Please review it before chatting with the AI.
      </div>

      <div className="review-content">
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 24, width: '100%'}}>
          <div style={{ flex: '0 0 140px' }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 18 }}>Product Image</div>
            <div className="image-preview-container">
              <div style={{ width: 120, height: 150, border: '1.5px solid #ccc', borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0' }}>
                {data.image ? (
                  <>
                    <img 
                      ref={imageRef}
                      src={data.image} 
                      alt="Product" 
                      style={{ maxWidth: 110, maxHeight: 140, borderRadius: 8 }} 
                      onMouseMove={handleMouseMove}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    />
                    {previewVisible && (
                      <div 
                        className="image-preview-tooltip"
                        style={{
                          left: previewPosition.x,
                          top: previewPosition.y,
                          display: 'block'
                        }}
                      >
                        <img 
                          src={data.image} 
                          alt="Product Preview"
                          style={{
                            transform: `translate(calc(-50% + ${previewPosition.zoomX}%), calc(-50% + ${previewPosition.zoomY}%)) scale(1)`,
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ color: '#bbb' }}>No image</div>
                )}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 18 }}>Ingredients</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {data.Ingredients.map((ing: string, idx: number) => (
                <span key={idx} style={{ display: 'flex', alignItems: 'center', background: '#e6e6e6', borderRadius: 20, padding: '4px 12px', fontSize: 15 }}>
                  {ing}
                  <button onClick={() => handleRemoveIngredient(idx)} style={{ marginLeft: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontWeight: 700, fontSize: 16, lineHeight: 1, padding: 0 }} title="Remove">
                    <CloseRoundedIcon style={{ fontSize: 16, transform: 'translateY(1px)' }} />
                  </button>
                </span>
              ))}
              {showAddInput ? (
                <span style={{ display: 'flex', alignItems: 'center', background: '#e6e6e6', borderRadius: 20, padding: '2px 8px' }}>
                  <input
                    value={newIngredient}
                    onChange={e => setNewIngredient(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleAddIngredient();
                        setShowAddInput(false);
                      } else if (e.key === 'Escape') {
                        setShowAddInput(false);
                        setNewIngredient('');
                      }
                    }}
                    onBlur={() => {
                      setShowAddInput(false);
                      setNewIngredient('');
                    }}
                    placeholder="Enter..."
                    autoFocus
                    style={{ border: 'none', background: 'transparent', width: 110, outline: 'none', fontSize: 16, textAlign: 'left', color: '#444' }}
                  />
                  <button onClick={() => { handleAddIngredient(); setShowAddInput(false); }} style={{ background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer', marginLeft: 2, fontWeight: 700, padding: 0 }} title="Add">
                    <AddCircleRoundedIcon style={{ fontSize: 16, transform: 'translateY(1px)' }} />
                  </button>
                </span>
              ) : (
                <button onClick={() => setShowAddInput(true)} style={{ background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28 }} title="Add ingredient">
                  <AddCircleRoundedIcon style={{ fontSize: 20 }} />
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: 8, marginBottom: 16, width: '100%' }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 18 }}>Additional Information</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {additionalFields.map(([key, value]) => (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span 
                    style={{ cursor: 'pointer', color: '#444' }} 
                    onClick={() => setEditingField(editingField === key ? null : key)} 
                    title="Edit"
                  >
                    <BorderColorRoundedIcon style={{ fontSize: 16 }} />
                  </span>
                </div>
                {editingField === key ? (
                  <textarea
                    value={value}
                    onChange={e => setData({ ...data, [key]: e.target.value })}
                    onBlur={() => setEditingField(null)}
                    autoFocus
                    style={{ 
                      width: '100%', 
                      minHeight: 60, 
                      borderRadius: 4, 
                      border: '1px solid #ccc', 
                      padding: 8,
                      fontSize: 14,
                      fontFamily: 'inherit',
                      background: '#f5f5f5',
                      color: '#333',
                      outline: 'none',
                      resize: 'none',
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: '8px 12px', 
                    background: '#f5f5f5', 
                    borderRadius: 4,
                    whiteSpace: 'pre-wrap',
                    fontSize: 14,
                    color: '#333'
                  }}>
                    {value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <button onClick={onContinue} style={{ padding: '8px 32px', borderRadius: 20, background: '#444', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16 }}>Continue</button>
      </div>
    </div>
  );
};

export default StepReview; 