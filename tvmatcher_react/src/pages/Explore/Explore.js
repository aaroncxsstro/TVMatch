import React, { useState, useEffect, Suspense, useCallback, createContext, useContext } from 'react';
import axios from 'axios';
import './Explore.css';
import ImageNotFound from '../../assets/imagenotfound.png';
import DisneyLogo from '../../assets/disney-plus_logo.png';
import DisneyLogoDark from '../../assets/dark-disney-plus_logo.png';
import NetflixLogo from '../../assets/netflix_logo.png';
import NetflixLogoDark from '../../assets/dark-netflix_logo.png';
import MovistarLogo from '../../assets/movistar-plus_logo.png';
import MovistarLogoDark from '../../assets/dark-movistar-plus_logo.png';
import HBOMaxLogo from '../../assets/hbo-max_logo.png';
import HBOMaxLogoDark from '../../assets/dark-hbo-max_logo.png';
import AmazonLogo from '../../assets/amazon-prime-video_logo.png';
import AmazonLogoDark from '../../assets/dark-amazon-prime-video_logo.png';
import { Link } from 'react-router-dom';
import LazyImage from '../../components/LazyImage';

const ExploreContext = createContext();

const ExploreProvider = ({ children }) => {
  const [series, setSeries] = useState([]);
  const [plataformasSeleccionadas, setPlataformasSeleccionadas] = useState(['disney-plus', 'netflix', 'movistar-plus', 'hbo-max', 'amazon-prime-video']);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const googleUserId = localStorage.getItem('googleUserId');

  const fetchSeries = useCallback(async () => {
    try {
      const selectedPlatforms = plataformasSeleccionadas.join(',');
      const url = selectedPlatforms ? `http://localhost:8080/series/by-platforms?platforms=${selectedPlatforms}` : 'http://localhost:8080/series/by-platforms/all';
      const response = await axios.get(url);

      setSeries(response.data.map(serie => ({
        ...serie,
        posterUrl: serie.poster_url === 'N/A' ? ImageNotFound : serie.poster_url
      })));
    } catch (error) {
      console.error('Error fetching series:', error);
    }
  }, [plataformasSeleccionadas]);

  const fetchFavoriteSeries = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:8080/players/favoriteSeries/${googleUserId}`);
      setFavoriteSeries(response.data);
    } catch (error) {
      console.error('Error fetching favorite series:', error);
    }
  }, [googleUserId]);

  useEffect(() => {
    fetchSeries();
    if (googleUserId) {
      fetchFavoriteSeries();
    }
  }, [fetchSeries, fetchFavoriteSeries, googleUserId]);

  return (
    <ExploreContext.Provider value={{ series, plataformasSeleccionadas, setPlataformasSeleccionadas, favoriteSeries, setFavoriteSeries }}>
      {children}
    </ExploreContext.Provider>
  );
};

const useExploreContext = () => useContext(ExploreContext);

const Explore = () => {
  const { series, plataformasSeleccionadas, setPlataformasSeleccionadas, favoriteSeries, setFavoriteSeries } = useExploreContext();
  const googleUserId = localStorage.getItem('googleUserId');

  const getPlatformLogo = (platform, isSelected) => {
    switch(platform) {
      case 'disney-plus':
        return isSelected ? DisneyLogo : DisneyLogoDark;
      case 'netflix':
        return isSelected ? NetflixLogo : NetflixLogoDark;
      case 'movistar-plus':
        return isSelected ? MovistarLogo : MovistarLogoDark;
      case 'hbo-max':
        return isSelected ? HBOMaxLogo : HBOMaxLogoDark;      
      case 'amazon-prime-video':
        return isSelected ? AmazonLogo : AmazonLogoDark;
      default:
        return null;
    }
  };

  const handlePlatformChange = (platform) => {
    if (plataformasSeleccionadas.includes(platform)) {
      setPlataformasSeleccionadas(prevPlataformas => prevPlataformas.filter(plat => plat !== platform));
    } else {
      setPlataformasSeleccionadas(prevPlataformas => [...prevPlataformas, platform]);
    }
  
    if (plataformasSeleccionadas.length === 1 && plataformasSeleccionadas.includes(platform)) {
      setPlataformasSeleccionadas(['disney-plus', 'netflix', 'movistar-plus', 'hbo-max', 'amazon-prime-video']);
    }
  };

  const handleStarClick = async (serie) => {
    const isFavorite = favoriteSeries.some(favSerie => favSerie.title === serie.title);
    try {
      if (isFavorite) {
        await fetch(`http://localhost:8080/players/favoriteSeries/${googleUserId}/${serie.title}`, {
          method: 'DELETE',
        });
        setFavoriteSeries(favoriteSeries.filter(favSerie => favSerie.title !== serie.title));
      } else {
        await fetch(`http://localhost:8080/players/favoriteSeries/${googleUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: serie.title ,
        });
        setFavoriteSeries([...favoriteSeries, serie]);
      }
    } catch (error) {
      console.error(`Error ${isFavorite ? 'removing' : 'adding'} favorite series:`, error);
    }
  };

  const getStarIconState = (serie) => {
    return favoriteSeries.some(favSerie => favSerie.title === serie.title) ? '' : 'grayscale(1)';
  };

  return (
    <div className="explore-wrapper">
      <div className="filtro-container">
        <div className="platform-logos">
          {['disney-plus', 'netflix', 'movistar-plus', 'hbo-max', 'amazon-prime-video'].map(platform => (
            <img
              key={platform}
              src={getPlatformLogo(platform, plataformasSeleccionadas.includes(platform))}
              alt={platform}
              className={`filter-platform-logo ${plataformasSeleccionadas.includes(platform) ? 'selected' : ''}`}
              style={{ width: '72px', height: '72px' }}
              onClick={() => handlePlatformChange(platform)}
            />
          ))}
        </div>
      </div>
      <div className="explore-container">
        {series.map(serie => (
          <div key={serie.id} className="serie-container">
            <Link to={`/explore/${serie.id}`} className="serie-link">
              <div className="serie-content">
                <Suspense fallback={<div>Loading...</div>}>
                  <LazyImage src={serie.posterUrl} alt={serie.title} className="serie-poster" />
                </Suspense>
                <div className="serie-details">
                  <h2>{serie.title}</h2>
                  <p>{serie.year}</p>
                  <div className="platform-logos">
                    {serie.platforms.map(platform => (
                      <img
                        key={platform}
                        src={getPlatformLogo(platform, true)}
                        alt={platform}
                        className="platform-logo"
                        style={{ width: '32px', height: '32px' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Link>
            <span
              className="star-icon-explore"
              style={{ filter: getStarIconState(serie) }}
              onClick={() => handleStarClick(serie)}
            >
              ⭐️
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ExploreProvider, Explore };
