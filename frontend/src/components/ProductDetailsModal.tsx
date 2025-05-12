import React from 'react';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import './ProductDetailsModal.css';

interface ProductDetailsModalProps {
  data: {
    Ingredients: string[];
    image: string;
    [key: string]: string | string[] | undefined;
  };
  onClose: () => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ data, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="product-details-modal"
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="close-button"
          onClick={onClose}
        >
          <CloseRoundedIcon />
        </button>

        <h2>Product Details</h2>
        
        <div className="modal-content">
          <div className="image-section">
            <div className="image-preview-container">
              <div className="image-wrapper">
                {data.image ? (
                  <img 
                    src={data.image} 
                    alt="Product" 
                    className="product-image"
                  />
                ) : (
                  <div className="no-image">No image</div>
                )}
              </div>
            </div>
          </div>

          <div className="details-section">
            <div className="ingredients-section">
              <h3>Ingredients</h3>
              <div className="ingredients-list">
                {data.Ingredients.map((ing: string, idx: number) => (
                  <span key={idx} className="ingredient-tag">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            <div className="additional-info-section">
              <h3>Additional Information</h3>
              {Object.entries(data)
                .filter(([key]) => !['ingredients', 'image'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="info-item">
                    <span className="info-label">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="info-value">{value}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal; 