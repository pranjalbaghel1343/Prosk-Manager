import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const PrankPage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Instantly destroy their session! 
    // If they click the browser's back button, they will be kicked back to the login screen.
    dispatch(logout());
  }, [dispatch]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#ef4444',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      <h1 style={{
        fontSize: '4rem',
        fontWeight: '900',
        letterSpacing: '2px',
        lineHeight: '1.2',
        textShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
      }}>
        CHUTIYAAAA BANAYA TUMKOOO<br />
        BHAISSS KI BUCHIIIIIIIIIII 🐃

        kaan ki baat sun koi bhi dusri id se krle hojaegaaa ye tohh prank thaa khiikhiiii
      </h1>
    </div>
  );
};

export default PrankPage;
