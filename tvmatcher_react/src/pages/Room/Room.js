import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faCrown } from '@fortawesome/free-solid-svg-icons';
import CustomButton from '../../components/CustomButton';
import '../../assets/Equis.png';
import './Room.css';

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null);
  const [players, setPlayers] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const googleUserId = localStorage.getItem('googleUserId');
  let intervalId;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token && googleUserId) {
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => response.json())
      .then(data => {
        setUserName(data.name);
        
            
            setTimeout(() => {
              fetch(`http://localhost:8080/players/joinRoom?googleUserId=${googleUserId}&Codigo=${id}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                }
              })
              .then(response => response.json())
              .then(data => {
                intervalId = setInterval(() => {
                  fetch(`http://localhost:8080/room/${id}/players`)
                    .then(response => response.json())
                    .then(data => {
                      setPlayers(data);

                      // Fetch the creator ID
                      fetch(`http://localhost:8080/room/${id}/creator`)
                        .then(response => response.text())
                        .then(creatorId => {
                          setCreatorId(creatorId);
                          if (!data.some(player => player.googleUserId === creatorId)) {
                            assignNewCreator(data);
                          }
                        })
                        .catch(error => {
                          console.error('Error fetching room creator:', error);
                        });

                    })
                    .catch(error => {
                      console.error('Error fetching players:', error);
                    });

                  fetch(`http://localhost:8080/room/state/${id}`)
                    .then(response => response.text()) 
                    .then(state => {
                      if (state === "Juego") {
                        navigate(`/game/${id}`);
                      }
                    })
                    .catch(error => {
                      console.error('Error fetching room state:', error);
                    });

                }, 5000); 
              })
              .catch(error => {
                console.error('Error joining the room:', error);
              });
            }, 2000); 
          })
          .catch(error => {
            console.error('Error fetching player data:', error);
          });
    }
  
    const cleanupFunction = async () => {
      clearInterval(intervalId);
      try {
        const stateResponse = await fetch(`http://localhost:8080/room/state/${id}`);
        const state = await stateResponse.text();
        if (state === 'Juego') {
          return;
        }
    
        const response = await fetch(`http://localhost:8080/players/leaveRoom/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ googleUserId }),
        });
    
        if (!response.ok) {
          throw new Error('Error removing player from room: ' + response.statusText);
        } else {
        }
    
        const roomPlayersResponse = await fetch(`http://localhost:8080/room/${id}/players`);
        const roomPlayersData = await roomPlayersResponse.json();
    
        if (roomPlayersData.length === 0) {
          const deleteRoomResponse = await fetch(`http://localhost:8080/room/${id}`, {
            method: 'DELETE',
          });
    
          if (deleteRoomResponse.ok) {
          } else {
            throw new Error('Error deleting room: ' + deleteRoomResponse.statusText);
          }
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    
      
    };
  
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ''; 
      cleanupFunction(); 
    };
  
    window.addEventListener('beforeunload', handleBeforeUnload);
  
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupFunction();
    };
  }, [id]);

  const assignNewCreator = (playersData) => {
    if (playersData.length > 0) {
      const newCreator = playersData[0].googleUserId;
      fetch(`http://localhost:8080/room/${id}/creator`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ creatorId: newCreator })
      })
      .then(response => {
        if (!response.ok) {
          console.error('Error updating the room creator:', response.statusText);
        }
      })
      .catch(error => {
        console.error('Error updating the room creator:', error);
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(id);
    alert('Código copiado al portapapeles');
  };

  const goToGame = () => {
    fetch(`http://localhost:8080/room/update-state/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'Juego'
    })
    .then(response => {
      if (!response.ok) {
        console.error('Error starting the game:', response.statusText);
      } else {
        clearInterval(intervalId);
      }
    })
    .catch(error => {
      console.error('Error starting the game:', error);
    });
  };

  return (
    <div className="room-container">
      <div className="room-code-container">
        <h2 className="room-id">{id}</h2>
        <button onClick={copyToClipboard} className="copy-button">
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </div>
      <p className="invite-text">Invita a tus amigo(s) a unirse a tu juego compartiendo este código</p>
      <div className='players-list'>
        <h3 className='players-title'>Jugadores:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index} className="player-item">
              <img src={player.imagenURL} alt={`${player.nombre}'s profile`} className="player-icon" referrerPolicy="no-referrer" />
              {player.nombre === userName ? `${player.nombre} (yo)` : player.nombre}
              {player.googleUserId === creatorId && <FontAwesomeIcon icon={faCrown} className="crown-icon" />}
            </li>
          ))}
        </ul>
      </div>
      {googleUserId === creatorId && (
        <div className="button-container">
          <CustomButton onClick={goToGame}>Iniciar Juego</CustomButton>
        </div>
      )}
    </div>
  );
}

export default Room;
