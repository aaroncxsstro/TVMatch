import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './Settings.css'; 

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-container">
      <button className="custom-button" onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
};

export default Settings;
