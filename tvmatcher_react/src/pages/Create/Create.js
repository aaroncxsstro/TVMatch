import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import './Create.css';

const Create = () => {
  const [options, setOptions] = useState([
    { id: 1, secondId: 'netflix', label: 'Netflix', checked: false },
    { id: 2, secondId: 'amazon-prime-video', label: 'Prime', checked: false },
    { id: 3, secondId: 'hbo-max', label: 'HBO max', checked: false },
    { id: 4, secondId: 'movistar-plus', label: 'Movistar+', checked: false },
    { id: 5, secondId: 'disney-plus', label: 'Disney+', checked: false }
  ]);

  const [genres, setGenres] = useState([
    "Acción & Aventura",
    "Historia",
    "Terror",
    "Romance",
    "Deporte",
    "Guerra",
    "Animación",
    "Comedia",
    "Documental",
    "Familia",
    "Misterio & Suspense",
    "Ciencia ficción",
    "Reality TV",
    "Europeas",
    "Crimen",
    "Drama",
    "Fantasía",
    "Música",
    "Western"
  ].map((genre, index) => ({ id: index + 1, label: genre, checked: true })));

  const [isOptionsExpanded, setOptionsExpanded] = useState(true);
  const [isPlatformsExpanded, setPlatformsExpanded] = useState(true);
  const [isAdditionalConfigExpanded, setAdditionalConfigExpanded] = useState(true);
  const [isKidModeChecked, setKidModeChecked] = useState(false);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');


  function handleOptionChange(id) {
    const updatedOptions = options.map(option =>
      option.id === id ? { ...option, checked: !option.checked } : option
    );
    setOptions(updatedOptions);
  }

  function handleGenreChange(id) {
    const updatedGenres = genres.map(genre =>
      genre.id === id ? { ...genre, checked: !genre.checked } : genre
    );
    setGenres(updatedGenres);
  }

  function toggleOptionsVisibility(type) {
    if (type === 'platforms') {
      setPlatformsExpanded(!isPlatformsExpanded);
    } else if (type === 'genres') {
      setOptionsExpanded(!isOptionsExpanded);
    } else if (type === 'additionalConfig') {
      setAdditionalConfigExpanded(!isAdditionalConfigExpanded);
    }
  }

  function incrementStartYear() {
    if (startYear === '' || parseInt(startYear) < parseInt(endYear)) {
      setStartYear(Math.min(2030, parseInt(startYear || '1971', 10) + 1));
    }
  }

  function decrementStartYear() {
    if (startYear === '' || parseInt(startYear) > 1971) {
      setStartYear(Math.max(1971, parseInt(startYear || '1971', 10) - 1));
    }
  }

  function incrementEndYear() {
    if (endYear === '' || parseInt(endYear) < 2030) {
      setEndYear(Math.min(2030, parseInt(endYear || '2030', 10) + 1));
    }
  }

  function decrementEndYear() {
    if (endYear === '' || parseInt(endYear) > parseInt(startYear)) {
      setEndYear(Math.max(1971, parseInt(endYear || '2030', 10) - 1));
    }
  }

  const randomRoomNumber = Math.floor(10000 + Math.random() * 90000);

  async function createRoom() {
    let selectedPlatforms = options.filter(platform => platform.checked).map(platform => platform.secondId);
    let selectedGenres = genres.filter(genre => genre.checked).map(genre => genre.label);
  
    // If no platforms are selected, select all platforms
    if (selectedPlatforms.length === 0) {
      selectedPlatforms = options.map(platform => platform.secondId);
    }
  
    // If no genres are selected, select all genres
    if (selectedGenres.length === 0) {
      selectedGenres = genres.map(genre => genre.label);
    }
  
    const roomData = {
      codigo: randomRoomNumber,
      estado: "Espera",
      platforms: selectedPlatforms,
      genres: selectedGenres,
      startYear: startYear || 1971,
      endYear: endYear || 2030,
      isKidModeChecked: isKidModeChecked,
      creatorId: localStorage.getItem('googleUserId')
    };

    try {
      const createRoomResponse = await fetch('http://localhost:8080/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (createRoomResponse.ok) {
        console.log('Sala creada exitosamente.');
      } else {
        console.error('Error al crear la sala:', createRoomResponse.status);
      }
    } catch (error) {
      console.error('Error al crear la sala:', error);
    }

    const googleUserId = localStorage.getItem('googleUserId');

    const unlikeResponse = await fetch(`http://localhost:8080/players/unlikeAllSeries/${googleUserId}`, {
      method: 'DELETE',
    });

    if (!unlikeResponse.ok) {
      throw new Error('Error unliking all series: ' + unlikeResponse.statusText);
    } else {
      console.log('All series unliked successfully.');
    }
  }

  return (
    <div className="create-page">
      <div className="cancel-button-div">
        <Link to="/home" className="cancel-button"> 
          <CustomButton>Cancelar</CustomButton>
        </Link>
      </div>
      <div className="game-configuration-container">
        <h2 className='text-amber-800 font-bold py-6 px-4 text-3xl'>Configuración de juego:</h2>
        <div className="options-container">
          <div className="options-wrapper">
            <div className="platform-configuration-container">
              <div className="options-header">
                <h1>
                  <button onClick={() => toggleOptionsVisibility('platforms')}>
                    Plataformas {isPlatformsExpanded ? "▼" : "►"}
                  </button>
                </h1>
              </div>
              {isPlatformsExpanded && (
                <div className="platform-options">
                  {options.map(option => (
                    <div key={option.id} className="option">
                      <label htmlFor={`option-${option.id}`}>{option.label}</label>
                      <input
                        type="checkbox"
                        id={`option-${option.id}`}
                        checked={option.checked}
                        onChange={() => handleOptionChange(option.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="additional-configurations">
                <div className="options-header">
                  <h1>
                    <button onClick={() => toggleOptionsVisibility('additionalConfig')}>
                      Configuración adicional {isAdditionalConfigExpanded ? "▼" : "►"}
                    </button>
                  </h1>
                </div>
                {isAdditionalConfigExpanded && (
                  <div className="additional-options">
                    <div className="option">
                      <label htmlFor="kid-mode">Modo para niños</label>
                      <input
                        type="checkbox"
                        id="kid-mode"
                        checked={isKidModeChecked}
                        onChange={() => setKidModeChecked(!isKidModeChecked)}
                      />
                    </div>
                    <div className="option-year">
                      <div className="year-inputs">
                        <div>
                          <label htmlFor="start-year">Desde</label>
                          <input
                            type="number"
                            id="start-year"
                            value={startYear}
                            readOnly
                          />
                          <button onClick={decrementStartYear}>-</button>
                          <button onClick={incrementStartYear}>+</button>
                        </div>
                        <div>
                          <label htmlFor="end-year">Hasta</label>
                          <input
                            type="number"
                            id="end-year"
                            value={endYear}
                            readOnly
                          />
                          <button onClick={decrementEndYear}>-</button>
                          <button onClick={incrementEndYear}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="gender-configuration-container">
              <div className="options-header">
                <h1>
                  <button onClick={() => toggleOptionsVisibility('genres')}>
                    Géneros {isOptionsExpanded ? "▼" : "►"}
                  </button>
                </h1>
              </div>
              {isOptionsExpanded && (
                <div className="genre-options">
                  {genres.map(genre => (
                    <div key={genre.id} className="option">
                      <label htmlFor={`genre-${genre.id}`}>{genre.label}</label>
                      <input
                        type="checkbox"
                        id={`genre-${genre.id}`}
                        checked={genre.checked}
                        onChange={() => handleGenreChange(genre.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className='game-creation'>
            <Link to={`/room/${randomRoomNumber}`}>
              <CustomButton fullWidth onClick={createRoom}>Crear Sala</CustomButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
