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

      <div style={{ padding: '20px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '20px', backdropFilter: 'blur(5px)', margin: '20px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '900', margin: '10px 0', color: '#ff4757', letterSpacing: '2px' }}>
          HAPPPPPYYYYYYYY BESTFFFFF DAYYYYYYYYYYY
        </h1>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: '10px 0', color: '#ffa502', letterSpacing: '4px' }}>
          GADHIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
        </h2>

        {!showSurprise ? (
          <button
            onClick={() => setShowSurprise(true)}
            style={{
              marginTop: '40px',
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
              marginTop: '40px',
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

      {/* Manual Logout Button */}
      <button
        onClick={() => {
          dispatch(logout());
          navigate('/login', { replace: true });
        }}
        style={{
          position: 'absolute',
          bottom: '20px',
          padding: '8px 16px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          zIndex: 10000,
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.8)')}
        onMouseOut={(e) => (e.target.style.backgroundColor = 'rgba(0,0,0,0.6)')}
      >
        Not you? Log out
      </button>
    </div>
  );
}
