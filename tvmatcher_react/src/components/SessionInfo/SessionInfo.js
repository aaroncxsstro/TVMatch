import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CustomButton from '../CustomButton';
import './SessionInfo.css';

const SessionInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setUser(data);
          setLoading(false);
          console.log(data.name);
          console.log(data.picture);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="session-info">Cargando...</div>;
  }

  return (
    <div className="session-info">
      {user ? (
        <div className="user-info">
          <img src={user.picture} alt="User Profile" className="user-picture" referrerPolicy="no-referrer"/>
          <span className="user-name">{user.name}</span>
        </div>
      ) : (
        <Link to="/login">
          <CustomButton>Inicia sesión</CustomButton>
        </Link>
      )}
    </div>
  );
};

export default SessionInfo;