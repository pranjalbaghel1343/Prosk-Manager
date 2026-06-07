import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

export default function Bestfriend() {
  const [showSurprise, setShowSurprise] = useState(false);
  const [windowDimension, setWindowDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle window resize for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle "Logout on Back Button"
  useEffect(() => {
    // Push a new state so that pressing back triggers our popstate listener
    window.history.pushState(null, '', window.location.href);

    const handleBackButton = () => {
      dispatch(logout());
      navigate('/login', { replace: true });
    };

    window.addEventListener('popstate', handleBackButton);
    return () => window.removeEventListener('popstate', handleBackButton);
  }, [dispatch, navigate]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundImage: 'url("/bg-bestfriend.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#fff',
        textShadow: '2px 2px 8px rgba(0,0,0,0.8), -2px -2px 8px rgba(0,0,0,0.8)',
        zIndex: 9999, // Ensure it covers everything
        overflow: 'hidden'
      }}
    >
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={true}
        numberOfPieces={300}
        gravity={0.15}
      />

      {/* Top Heading */}
      <h1 style={{ 
        position: 'absolute',
        top: '8%',
        width: '100%',
        fontSize: '4rem', 
        fontWeight: '900', 
        margin: '0', 
        color: '#ff4757', 
        letterSpacing: '2px',
        padding: '0 20px'
      }}>
        HAPPPPPYYYYYYYY BESTFFFFF DAYYYYYYYYYYY
      </h1>

      {/* Bottom Heading */}
      <h2 style={{ 
        position: 'absolute',
        top: '60%',
        width: '100%',
        fontSize: '3.5rem', 
        fontWeight: '800', 
        margin: '0', 
        color: '#ffa502', 
        letterSpacing: '4px',
        padding: '0 20px'
      }}>
        GADHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
      </h2>

      {/* Button / Surprise Text */}
      <div style={{
        position: 'absolute',
        top: '75%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: '0 20px'
      }}>
        {!showSurprise ? (
          <button
            onClick={() => setShowSurprise(true)}
            style={{
              padding: '15px 30px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#fff',
              backgroundColor: '#e056fd',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(224, 86, 253, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.target.style.transform = 'scale(1.1)')}
            onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
          >
            click here more suprise ✨
          </button>
        ) : (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              color: '#333',
              maxWidth: '600px',
              textShadow: 'none',
              fontSize: '1.2rem',
              fontWeight: '600',
              lineHeight: '1.6',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 0.5s ease-out'
            }}
          >
            <p>
              (hopefully next yr tak AGARRR IFFFFF baat hoti rhegi toh ye page mai or 100 photo add krdunga..hehheehe...khikhi..ye addkrna jruri tha btw...)
            </p>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

    </div>
  );
}
