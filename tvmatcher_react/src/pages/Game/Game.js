import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import ImageNotFound from '../../assets/imagenotfound.png';
import CustomButton from '../../components/CustomButton';
import './Game.css';

const Game = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [seriesChunks, setSeriesChunks] = useState([]);
  const [currentSeriesIndex, setCurrentSeriesIndex] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [showSeriesInfo, setShowSeriesInfo] = useState(false);
  const [partialMatches, setPartialMatches] = useState([]);
  const [showPartialMatches, setShowPartialMatches] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [likes, setLikes] = useState([]);
  const [creatorId, setCreatorId] = useState(null);
  const [numPlayers, setNumPlayers] = useState(0);
  const [completedPlayers, setCompletedPlayers] = useState(0);
  const [starIconState, setStarIconState] = useState("grayscale(1)");
  const [favoritedSeriesTitles, setFavoritedSeriesTitles] = useState([]);
  const [totalMatches, setTotalMatches] = useState([]);
  const [currentTotalMatchIndex, setCurrentTotalMatchIndex] = useState(0);

  useEffect(() => {
    fetchSeriesData();
    fetchCreatorId();
    fetchPlayersForRoom();
    const interval = setInterval(fetchGameData, 5000);

    const cleanupFunction = async () => {
      clearInterval(interval);
      try {
        const googleUserId = localStorage.getItem('googleUserId');

        const unlikeResponse = await fetch(`http://localhost:8080/players/unlikeAllSeries/${googleUserId}`, {
          method: 'DELETE',
        });

        if (!unlikeResponse.ok) {
          throw new Error('Error unliking all series: ' + unlikeResponse.statusText);
        } else {
        }

        const leaveRoomResponse = await fetch(`http://localhost:8080/players/leaveRoom/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ googleUserId }),
        });

        if (!leaveRoomResponse.ok) {
          throw new Error('Error removing player from room: ' + leaveRoomResponse.statusText);
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

  useEffect(() => {
    fetchFavoriteStatus();
  }, [currentSeriesIndex, currentChunkIndex]);

  const isCreator = creatorId === localStorage.getItem('googleUserId');

  const fetchFavoriteStatus = async () => {
    try {
      const response = await fetch(`http://localhost:8080/players/isFavoriteSeries/${localStorage.getItem('googleUserId')}/${currentSeries.title}`);
      if (!response.ok) {
        throw new Error('Failed to fetch favorite status.');
      }
      const isFavorite = await response.json();
      setStarIconState(isFavorite ? 'grayscale(0)' : 'grayscale(1)');
    } catch (error) {
      
    }
  };

  const fetchGameData = async () => {
    try {
      const responseState = await fetch(`http://localhost:8080/room/state/${id}`);
      if (!responseState.ok) {
        throw new Error('Failed to fetch room state.');
      }
      const roomState = await responseState.text();
      if (roomState === "Finalizado") {
        navigate(`/home`);
      }

      const responseIndex = await fetch(`http://localhost:8080/room/${id}/currentIndex`);
      if (!responseIndex.ok) {
        throw new Error('Failed to fetch current chunk index.');
      }
      const currentIndex = await responseIndex.json();

      fetchCompletedPlayers();
      handleEndOfChunk();

      if (currentIndex !== 0) {
        const resetResponse = await fetch(`http://localhost:8080/room/${id}/resetIndex`, {
          method: 'POST'
        });
        if (!resetResponse.ok) {
          throw new Error('Failed to reset chunk index.');
        }

        setShowPartialMatches(false);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCreatorId = async () => {
    try {
      const response = await fetch(`http://localhost:8080/room/${id}/creator`);
      const creatorId = await response.text();
      setCreatorId(creatorId);
      if (!response.ok) {
        throw new Error('Failed to fetch creator ID');
      }
    } catch (error) {
      console.error('Error fetching creator ID:', error);
    }
  };

  const fetchCompletedPlayers = async () => {
    try {
      const response = await fetch(`http://localhost:8080/room/${id}/completedPlayers`);
      const completedPlayers = await response.json();
      setCompletedPlayers(completedPlayers);
    } catch (error) {
      console.error('Error fetching completed players:', error);
    }
  };

  const fetchSeriesData = () => {
    fetch(`http://localhost:8080/room/${id}/series`)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        const chunks = chunkArray(data, 30);
        const shuffledChunks = chunks.map(chunk => shuffleArray(chunk));
        setSeriesChunks(shuffledChunks);
      })
      .catch(error => {
        console.error('Error fetching room data:', error);
      });
  };



  const chunkArray = (array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const fetchPlayersForRoom = async () => {
    try {
      const response = await fetch(`http://localhost:8080/room/${id}/players`);
      const players = await response.json();
      setNumPlayers(players.length);
    } catch (error) {
      console.error('Error fetching players for room:', error);
    }
  };

  const shuffleArray = array => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleButtonClick = async (action) => {
    const currentChunk = seriesChunks[currentChunkIndex];
    const currentSeries = currentChunk[currentSeriesIndex];
  
    if (currentSeries) {
      const googleUserId = localStorage.getItem('googleUserId');
  
      if (action === 'like') {
        try {
          const response = await fetch(`http://localhost:8080/players/likeSeries/${googleUserId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: currentSeries.title
          });
  
          if (!response.ok) {
            throw new Error('Failed to add series to player.');
          }
          if(numPlayers>1){
          setFavoritedSeriesTitles(prevTitles => [...prevTitles, currentSeries.title]);
  
          // Obtener coincidencias totales
          const myString = JSON.stringify(favoritedSeriesTitles);
          const response2 = await fetch(`http://localhost:8080/players/checkSeriesLikes/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: myString
          });
  
          if (response2.ok) {
            const matchedSeries = await response2.json();
          
  
            setTotalMatches(matchedSeries);

            // Obtener títulos de matchedSeries
            const matchedSeriesTitles = matchedSeries.map(series => series.title);

            // Filtrar las series favoritas para eliminar las que ya han sido devueltas
            setFavoritedSeriesTitles(prevTitles =>
              prevTitles.filter(title => !matchedSeriesTitles.includes(title))
            );
          } else {
            throw new Error('Failed to check for total matches.');
          }
        }
        } catch (error) {
          console.error('Error processing like:', error);
        }
      
      }
      
  

      const nextSeriesIndex = currentSeriesIndex + 1;
      if (nextSeriesIndex < currentChunk.length) {
        setCurrentSeriesIndex(nextSeriesIndex);
      } else {
        const nextChunkIndex = currentChunkIndex + 1;
        if (nextChunkIndex < seriesChunks.length) {
          handleEndOfChunk();
          setCurrentChunkIndex(nextChunkIndex);
          setCurrentSeriesIndex(0);
          setShowPartialMatches(true);
        } else {

        }

        try {
          const response = await fetch(`http://localhost:8080/room/${id}/increaseCompletedChunkPlayers`, {
            method: 'POST',
          });

          if (!response.ok) {
            throw new Error('Failed to increase completed chunk players.');
          }
        } catch (error) {
          console.error('Error increasing completed chunk players:', error);
        }
      }
    }

      // Aplica la clase de animación correspondiente
  if (action === 'dislike') {
    document.querySelector('.series-card').classList.add('swipe-right');
  } else if (action === 'like') {
    document.querySelector('.series-card').classList.add('swipe-left');
  }

  // Elimina la clase de animación después de un tiempo para que la animación se pueda repetir
  setTimeout(() => {
    document.querySelector('.series-card').classList.remove('swipe-left', 'swipe-right');
  }, 300);
  };

  const handleEndOfChunk = async () => {
    try {
      const response = await fetch(`http://localhost:8080/room/${id}/partialMatches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chunkIndex: currentChunkIndex })
      });

      const matchData = await response.json();
      if (matchData.partialMatches.length > 0) {
        setPartialMatches(matchData.partialMatches);
      }
    } catch (error) {
      console.error('Error fetching partial matches:', error);
    }
  };

  const openSeriesInfo = (series, likes) => {
    setSelectedSeries(series);
    setLikes(likes);
    setShowSeriesInfo(true);
  };

  const closeSeriesInfo = () => {
    setShowSeriesInfo(false);
  };

  const closePartialMatches = () => {
    setShowPartialMatches(false);
  };

  const currentChunk = seriesChunks[currentChunkIndex];
  const currentSeries = currentChunk ? currentChunk[currentSeriesIndex] : null;

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleButtonClick('like'),
    onSwipedRight: () => handleButtonClick('dislike'),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleStarIconClick = (e) => {
    e.stopPropagation();
    if (starIconState === 'grayscale(1)') {
      setStarIconState('grayscale(0)');
      try {
         fetch(`http://localhost:8080/players/favoriteSeries/${localStorage.getItem('googleUserId')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: currentSeries.title,
        });
      } catch (error) {
        console.error('Error al agregar a favoritos:', error);
      }
    } else {
      setStarIconState('grayscale(1)');
      try {
          fetch(`http://localhost:8080/players/favoriteSeries/${localStorage.getItem('googleUserId')}/${currentSeries.title}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
      }
    }
  };

  if (!currentSeries) {
    return <div>Loading...</div>;
  }

  const truncatedTitle = currentSeries.title.length > 22
    ? currentSeries.title.substring(0, 19) + "..."
    : currentSeries.title;

  const imageUrl = currentSeries.poster_url !== "N/A" ? currentSeries.poster_url : ImageNotFound;

  const maxLikes = Math.max(...partialMatches.map(match => match.likes.length));

  const partialMatchesByLikes = Array.from({ length: maxLikes }, () => []);

  partialMatches.forEach(match => {
    const likesCount = match.likes.length;
    partialMatchesByLikes[maxLikes - likesCount].push(match);
  });

  const handleFinishGame = async () => {
    fetch(`http://localhost:8080/room/update-state/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'Finalizado'
    })
    .then(response => {
      if (!response.ok) {
        console.error('Error finishing the game:', response.statusText);
      } else {
      }
    })
    .catch(error => {
      console.error('Error finishing the game:', error);
    });
  };

  const handleContinueGame = async () => {
    try {
      const responseReset = await fetch(`http://localhost:8080/room/${id}/resetChunkPlayers`, {
        method: 'POST',
      });
      if (!responseReset.ok) {
        throw new Error('Failed to reset chunk players.');
      }

      const responseIncreaseIndex = await fetch(`http://localhost:8080/room/${id}/increaseIndex`, {
        method: 'POST',
      });
      if (!responseIncreaseIndex.ok) {
        throw new Error('Failed to increase chunk index.');
      }
    } catch (error) {
      console.error('Error continuing game:', error);
    }
  };

  const handleContinueTotal = async () => {
    setTotalMatches(prevTotalMatches => prevTotalMatches.slice(1));
  }

  const exitRoom = () => {
    navigate(`/home`);
  }

  return (
    <div className="game-container">
      <div className="exit-button">
      <CustomButton onClick={exitRoom}>Salir del juego</CustomButton>
      </div>

      <div className="series-card" {...swipeHandlers}>
      <div
          className="image-container"
          onClick={() => openSeriesInfo(currentSeries, [])}
          onMouseDown={(e) => e.preventDefault()}
          onMouseUp={(e) => e.preventDefault()}
        >
          <img src={imageUrl} alt={currentSeries.title} className="series-image" />
          <span className="star-icon" style={{ filter: starIconState }} onClick={handleStarIconClick}>
            ⭐️
          </span>
        </div>

        <p className="series-title">{truncatedTitle}</p>
        <div className="button-group">
        <CustomButton onClick={() => handleButtonClick('like')}>
            <picture>
              <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.webp" type="image/webp" />
              <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44d/512.gif" alt="👍" width="32" height="32" />
            </picture>
          </CustomButton>
          <CustomButton onClick={() => handleButtonClick('dislike')}>
            <picture>
              <source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.webp" type="image/webp" />
              <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44e/512.gif" alt="👎" width="32" height="32" />
            </picture>
          </CustomButton>
        </div>
      </div>
      {showSeriesInfo && selectedSeries && (
        <div className="series-info-overlay">
          <div className="series-info">
            <span className="close-button" onClick={closeSeriesInfo}>X</span>
            <h2 className="series-info-large">{selectedSeries.title} {selectedSeries.year}</h2>
            <p>{selectedSeries.plot}</p>
            <p>{selectedSeries.production_country}</p>
            {likes.length > 0 && (
              <div className="likes-container">
                {likes.map((like, index) => (
                  <div key={index} className="like">
                    <span className="like-name">{like}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {showPartialMatches && (
        <div className="overlay-background">
          <div className="partial-matches-overlay">
            <div className="partial-matches">
              {partialMatchesByLikes.map((matches, likesCount) => (
                <div key={likesCount} className="partial-matches-group">
                  <div className="partial-match-container">
                    {matches.map((match, index) => (
                      <div key={index} className="partial-match" onClick={() => openSeriesInfo(match.series, match.likes)}>
                        <img src={match.series.poster_url !== "N/A" ? match.series.poster_url : ImageNotFound} alt={match.series.title} />
                        <p><span role="img" aria-label="heart">❤️</span> {match.likes.length}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {isCreator && completedPlayers === numPlayers && (
              <div className="continue-button">
                <CustomButton onClick={handleContinueGame}>Continuar partida</CustomButton>
                <CustomButton onClick={handleFinishGame}>Finalizar partida</CustomButton>
              </div>
            )}
          </div>
        </div>
      )}
      {totalMatches.length > 0 && (
        <div className="overlay-background">
          <div className="total-matches-overlay">
              <div className="total-match">
               <p>¡{totalMatches[0].title} es un MATCH!</p> 
               <img src={totalMatches[0].poster_url !== "N/A" ? totalMatches[0].poster_url : ImageNotFound} alt={totalMatches[0].title} />
              </div>
              <CustomButton onClick={handleContinueTotal}>Continuar partida</CustomButton>
            </div>
          </div>
      )}

    </div>
  );
};

export default Game;
