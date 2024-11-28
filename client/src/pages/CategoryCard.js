import React, { useState } from 'react';
import '../styles/CategoryCard.css';

const CategoryCard = ({ title, products, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardContent, setCardContent] = useState([title]);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => {
      setCardContent(isFlipped ? [title] : products);
    }, 130);
  };

  return (
    <div
      className={`category-card ${isHovered ? 'hovered' : ''} ${isFlipped ? 'flipped' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--card-color': color }}
    >
      <div className="glow-border">
        <div className="inner-background" />
      </div>
      
      <div className={`card-content ${isFlipped ? 'flipped' : ''}`}>
        <div className="header-section">
          {cardContent.map((content, index) => (
            <div key={index}>
              <h2 className={isFlipped ? 'card-products' : 'card-title'}>
                {content}
              </h2>
              <br />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;