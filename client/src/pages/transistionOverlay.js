import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import deloreanImg from '../images/bttfdelorean.png'

const TransitionOverlay = ({ show, to, color = '#00ffff', onAnimationComplete }) => {
  const navigate = useNavigate();
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        navigate(to);
        if (onAnimationComplete) onAnimationComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, to, navigate, onAnimationComplete]);

  useEffect(() => {
    if (show) {
      const newSparks = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        angle: Math.random() * Math.PI * 2,
        velocity: 10 + Math.random() * 25,
        size: 0.5 + Math.random() * 3.5,
        delay: Math.random() * 0.2,
        duration: 0.6 + Math.random() * 1,
        glow: Math.random() > 0.5
      }));
      setSparks(newSparks);
    }
  }, [show]);

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.95)',
      zIndex: 9999,
      overflow: 'hidden',
    },
    deloreanContainer: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '100%',
      height: '200px',
      overflow: 'hidden'
    },
    delorean: {
      position: 'absolute',
      width: '300px',
      height: 'auto',
      left: '-320px',
      top: '50%',
      transform: 'translateY(-50%)',
      animation: show ? 'driveAcross 1.8s cubic-bezier(0.2, 0, 0.9, 0.5) forwards' : 'none',
      filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))',
      mixBlendMode: 'screen',
      zIndex: 2
    },
    fireTrails: {
      position: 'absolute',
      height: '8px',
      background: `linear-gradient(to right, 
        transparent,
        ${color}88,
        ${color}
      )`,
      top: 'calc(50% + 40px)',
      left: '-100%',
      right: '100%',
      opacity: 0,
      animation: show ? 'fireTrail 0.15s ease-out infinite' : 'none',
      filter: 'blur(4px)',
      boxShadow: `0 0 30px ${color}66, 0 0 60px ${color}44, 0 0 90px ${color}22`,
      zIndex: 1
    },
    explosion: {
      position: 'absolute',
      top: '50%',
      left: '90%',
      width: '200px',
      height: '200px',
      transform: 'translate(-50%, -50%)',
      opacity: 0,
      animation: show ? 'explosion 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards 1.8s' : 'none',
      zIndex: 3,
      pointerEvents: 'none'
    },
    explosionInner: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: `radial-gradient(circle, transparent 0%, ${color} 30%, transparent 70%)`,
      animation: show ? 'pulseExplosion 0.4s ease-out infinite' : 'none',
      opacity: 0
    },
    spark: (sparkData) => ({
      position: 'absolute',
      left: '90%',
      top: '50%',
      width: `${sparkData.size}px`,
      height: `${sparkData.size}px`,
      backgroundColor: sparkData.glow ? 'white' : color,
      borderRadius: '50%',
      boxShadow: sparkData.glow 
        ? `0 0 4px white, 0 0 8px ${color}, 0 0 12px ${color}, 0 0 16px ${color}`
        : `0 0 4px ${color}, 0 0 8px ${color}`,
      animation: show ? `spark ${sparkData.duration}s cubic-bezier(0.2, 0, 0.2, 1) forwards ${1.8 + sparkData.delay}s` : 'none',
      transform: `rotate(${sparkData.angle}rad)`,
      '--velocity': sparkData.velocity,
      '--angle': sparkData.angle,
      opacity: 0
    }),
    fadeOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'black',
      opacity: 0,
      animation: show ? 'fadeIn 0.5s ease-in forwards 2.5s' : 'none',
      zIndex: 10
    }
  };

  useEffect(() => {
    const keyframes = `
      @keyframes driveAcross {
        0% {
          left: -320px;
          transform: translateY(-50%) scale(1);
          opacity: 1;
        }
        99% {
          left: calc(90% - 300px);
          transform: translateY(-50%) scale(1);
          opacity: 1;
        }
        100% {
          left: calc(90% - 300px);
          transform: translateY(-50%) scale(1);
          opacity: 0;
        }
      }

      @keyframes fireTrail {
        0% {
          opacity: 0;
          left: -100%;
          right: 100%;
        }
        50% {
          opacity: 1;
          left: 0;
          right: 0;
        }
        100% {
          opacity: 0;
          left: 0;
          right: 0;
        }
      }

      @keyframes explosion {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.1);
        }
        1% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(0.1);
        }
        10% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.5);
        }
        80% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(2.5);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(3);
        }
      }

      @keyframes pulseExplosion {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.3);
          opacity: 0;
        }
      }

      @keyframes spark {
        0% {
          opacity: 0;
        }
        1% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
        }
        15% {
          opacity: 1;
          transform: translate(
            calc(cos(var(--angle)) * var(--velocity) * 30px),
            calc(sin(var(--angle)) * var(--velocity) * 30px)
          ) scale(1.2) rotate(180deg);
        }
        100% {
          opacity: 0;
          transform: translate(
            calc(cos(var(--angle)) * var(--velocity) * 200px),
            calc(sin(var(--angle)) * var(--velocity) * 200px)
          ) scale(0) rotate(360deg);
        }
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 1;
        }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = keyframes;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!show) return null;

  return (
    <div style={styles.overlay}>
      <div className="delorean-container" style={styles.deloreanContainer}>
        <div style={styles.explosion}>
          <div style={styles.explosionInner} />
        </div>
        <img 
          src={deloreanImg}
          alt="DeLorean Time Machine"
          style={styles.delorean}
        />
        <div style={styles.fireTrails} />
        {sparks.map(sparkData => (
          <div key={sparkData.id} style={styles.spark(sparkData)} />
        ))}
      </div>
      <div style={styles.fadeOverlay} />
    </div>
  );
};

export default TransitionOverlay;