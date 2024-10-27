import React, { useState } from 'react';
import { Clock, Zap, Eye, Brain, PiggyBank } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TransitionOverlay from './transistionOverlay';

const DashboardCard = ({ title, icon: Icon, children, color, to }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const navigate = useNavigate();


  const styles = {
    card: {
      position: 'relative',
      padding: '2rem',
      height: '300px',
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
      borderRadius: '20px',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      overflow: 'hidden',
      cursor: isHovered ? 'pointer' : 'default',
    },
    cardContent: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 2
    },
    headerSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '0.05em',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    contentSection: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    glowBorder: {
      position: 'absolute',
      inset: 0,
      padding: '2px',
      borderRadius: '20px',
      background: `linear-gradient(45deg, ${color}40, ${color})`,
      opacity: isHovered ? 1 : 0.3,
      transition: 'opacity 0.3s ease'
    },
    innerBackground: {
      position: 'absolute',
      inset: '2px',
      borderRadius: '18px',
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))'
    }
  };

  const handleHover = (hover) => {
    setIsHovered(hover);
  };

  const handleClick = () => {
    if (to) {
      setShowTransition(true);
    }
  };

  const handleTransitionComplete = () => {
    setShowTransition(false);
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
        onClick={handleClick}
        style={{
          ...styles.card,
          transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
          boxShadow: isHovered 
            ? `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 30px ${color}30` 
            : '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <div style={styles.glowBorder}>
          <div style={styles.innerBackground} />
        </div>
        
        <div style={styles.cardContent}>
          <div style={styles.headerSection}>
            <Icon
              size={32}
              style={{
                color: color,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }}
            />
            <h2 style={{ ...styles.title, color: color }}>{title}</h2>
          </div>
          
          <div style={styles.contentSection}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

const Home = () => {
  const colors = {
    temporal: '#2D9CCE',
    future: '#B50D13',
    flux: '#D85116',
    timeline: '#E4801D',
    popular: '#F0A81A',
    savings: '#F7DC11'
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a, #2D9CCE 140%)',
      padding: '2rem'
    },
    header: {
      background: 'linear-gradient(145deg, rgba(20, 20, 20, 0.9), rgba(30, 30, 30, 0.8))',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: '800',
      background: 'linear-gradient(45deg, #F7DC11, #E4801D)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      letterSpacing: '0.15em',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif"
    },
    subtitle: {
      color: '#2D9CCE',
      fontFamily: "'Segoe UI', 'Roboto', sans-serif",
      fontSize: '1.1rem',
      letterSpacing: '0.05em'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', // Increased minmax value
      gap: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>FLUX</h1>
            <p style={{color: 'white', fontSize: '25px'}}>"Shopping at 88mph"</p>
            <button>Logout</button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div style={styles.grid}>
        <DashboardCard title="Future Picks" icon={Brain} color={colors.future} to="/recommendations">
          <p style={{ color: colors.future, fontSize: '1.1rem', lineHeight: '1.6' }}>
            AI-powered<br/>recommendations
          </p>
        </DashboardCard>

        <DashboardCard title="Timeline Analysis" icon={Clock} color={colors.timeline} to='/mostviewed'>
          <p style={{ color: colors.timeline, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Your shopping patterns<br/>across time
          </p>
        </DashboardCard>

        <DashboardCard title="Popular Dimensions" icon={Eye} color={colors.popular} to='/patterns'>
          <p style={{ color: colors.popular, fontSize: '1.1rem', lineHeight: '1.6' }}>
            Most viewed<br/>categories
          </p>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Home;