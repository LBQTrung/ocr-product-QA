import React from 'react';

interface StepReviewProps {
  data: {
    ingredients: string[];
    usage: string;
    image: string;
  };
  setData: (data: any) => void;
  onContinue: () => void;
}

const StepReview: React.FC<StepReviewProps> = ({ data, setData, onContinue }) => {
  const handleIngredientChange = (idx: number, value: string) => {
    const newIngredients = [...data.ingredients];
    newIngredients[idx] = value;
    setData({ ...data, ingredients: newIngredients });
  };
  return (
    <div className="modal" style={{ minWidth: 400 }}>
      <h2>YOUR PRODUCT ANALYSIS RESULTS</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        <img src={data.image} alt="Product" width={120} style={{ borderRadius: 8, border: '1px solid #eee' }} />
        <div>
          <h4>Ingredients:</h4>
          {data.ingredients.map((ing, idx) => (
            <input
              key={idx}
              value={ing}
              onChange={e => handleIngredientChange(idx, e.target.value)}
              style={{ marginBottom: 8, width: 180, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
            />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>How to use:</h4>
        <textarea
          value={data.usage}
          onChange={e => setData({ ...data, usage: e.target.value })}
          style={{ width: '100%', minHeight: 48, borderRadius: 4, border: '1px solid #ccc', padding: 4 }}
        />
      </div>
      <button onClick={onContinue} style={{ marginTop: 24, padding: '8px 24px', borderRadius: 8, background: '#444', color: '#fff', border: 'none', fontWeight: 600 }}>Continue</button>
    </div>
  );
};

export default StepReview; 