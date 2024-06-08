import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Home.css';
import CustomButton from '../../components/CustomButton';
import SessionInfo from '../../components/SessionInfo/SessionInfo';
import logo from '../../assets/logo.png';

const Home = () => {
  const [showSlides, setShowSlides] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const slides = [
    { title: "Introducción al juego", text: "Únete a los demás jugadores con su código o creando uno" },
    { title: "Introducción al juego", text: "Desliza las series según si te apetece verlas o no" },
    { title: "Introducción al juego", text: "Cuando hagais MATCH, la aplicación os avisará" }
  ];

  const nextSlide = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowSlides(false);
      setSlideIndex(0);
    }
  };

  const renderSlides = () => {
    return (
      <div className="carousel-slide">
        <h1>{slides[slideIndex].title}</h1>
        <p className="slide-text">{slides[slideIndex].text}</p>
        {showSlides && (
          <CustomButton onClick={nextSlide} disabled={slideIndex === slides.length - 1}>
            {slideIndex === slides.length - 1 ? "Finalizar" : "Siguiente"}
          </CustomButton>
        )}
      </div>
    );
  };

  const handlePlayClick = () => {
    setShowSlides(true);
    setSlideIndex(0);
  };

  const handleJoinCodeChange = (event) => {
    setJoinCode(event.target.value);
  };

  const handleJoinClick = async () => {
    try {
      const googleUserId = localStorage.getItem('googleUserId');

      // Unlink all series from the player
      const unlikeResponse = await fetch(`http://localhost:8080/players/unlikeAllSeries/${googleUserId}`, {
        method: 'DELETE',
      });

      if (!unlikeResponse.ok) {
        throw new Error('Error unliking all series: ' + unlikeResponse.statusText);
      } else {
      }

      const response = await fetch(`http://localhost:8080/room/exists/${joinCode}`);
      const roomExists = await response.json();
      if (roomExists) {
        navigate(`/room/${joinCode}`);
      } else {
        setErrorMessage("La sala no existe. Por favor, verifica el código e intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error comprobando si la sala existe:", error);
      setErrorMessage("Ha ocurrido un error. Por favor, intenta nuevamente.");
    }
  };

  return (
    <div className="app-container">
      <SessionInfo />
      <div className="logo-container">
        <img src={logo} alt="Logo de la app" />
      </div>
      {showSlides && (
        <div className="carousel-slide-container">
          {renderSlides()}
        </div>
      )}
      <div className="content-container">
        <div className="play-button-container">
          {!showSlides && (
            <CustomButton onClick={handlePlayClick}>Como jugar</CustomButton>
          )}
        </div>
        <div className="input-button-container">
          <div className="join-container">
            <input
              type="text"
              value={joinCode}
              onChange={handleJoinCodeChange}
              placeholder="Introducir código"
            />
            <CustomButton onClick={handleJoinClick}>Unirse</CustomButton>
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <div className="create-game-container">
            <Link to="/create">
              <CustomButton fullWidth>Crear Partida</CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
