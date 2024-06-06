import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import CustomButton from '../../components/CustomButton';
import logo from '../../assets/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = async (response) => {
    try {
      console.log('Login Successful:', response);
      login(response.access_token);
      console.log('Token saved in localStorage:', localStorage.getItem('authToken'));
  
      setLoading(true);
      if (response.access_token) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${response.access_token}`,
          },
        })
          .then(response => response.json())
          .then(data => {
            const { sub: googleUserId, name, picture } = data; 
            console.log('User Data:', googleUserId, name, picture);
            localStorage.setItem('googleUserId', googleUserId);
            createNewUser(googleUserId, name, picture);
          })
          .catch(error => {
            console.error('Error fetching user data:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };
  

  const handleLoginFailure = (error) => {
    console.error('Login Failed:', error);
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: handleLoginFailure,
  });

  const createNewUser = async (googleUserId, name, picture) => {
    try {
      const createResponse = await fetch('http://localhost:8080/players/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleUserId: googleUserId,
          imagenURL: picture,
          nombre: name
          
        }),
      });
      if (!createResponse.ok) {
        console.error('Error creating user:', createResponse.statusText);
      } else {
        console.log('User created successfully.');
      }
      setLoading(false);
      navigate('/home');
    } catch (error) {
      console.error('Error creating user:', error);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={logo} alt="Logo" />
      </div>
      <CustomButton onClick={loading ? null : loginWithGoogle}>
        {loading ? 'Loading...' : '🚀 Iniciar sesión con Google 🚀'}
      </CustomButton>
    </div>
  );
};

export default Login;
