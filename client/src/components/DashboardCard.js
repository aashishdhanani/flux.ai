import React, { useState } from 'react';
import TransitionOverlay from '../pages/transistionOverlay';
import '../styles/DashboardCard.css';

const DashboardCard = ({ title, icon: Icon, children, color, to }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  const handleClick = () => {
    if (to) {
      setShowTransition(true);
    }
  };

  return (
    <>
      <TransitionOverlay 
        show={showTransition}
        to={to}
        color={color}
        onAnimationComplete={handleTransitionComplete}
      />
      <div
        className={`dashboard-card ${isHovered ? 'hovered' : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          '--card-color': color,
        }}
      >
        <div className="glow-border">
          <div className="inner-background" />
        </div>
        
        <div className="card-content">
          <div className="header-section">
            <Icon
              size={32}
              className={`card-icon ${isHovered ? 'hovered' : ''}`}
              style={{ color }}
            />
            <h2 className="card-title" style={{ color }}>{title}</h2>
          </div>
          
          <div className="content-section">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardCard;