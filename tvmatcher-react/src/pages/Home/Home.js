import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Home.css';
import CustomButton from '../../components/CustomButton';
import logo from '../../assets/logo.png';

const Home = () => {
  const [showSlides, setShowSlides] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [joinCode, setJoinCode] = useState("");

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

  return (
    <div className="app-container">
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
            <CustomButton>Unirse</CustomButton>
          </div>
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
