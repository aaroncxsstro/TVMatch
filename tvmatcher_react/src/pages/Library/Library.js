import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Library.css';
import ImageNotFound from '../../assets/imagenotfound.png';
import { Link } from 'react-router-dom';
import LazyImage from '../../components/LazyImage';
import DisneyLogo from '../../assets/disney-plus_logo.png';
import NetflixLogo from '../../assets/netflix_logo.png';
import MovistarLogo from '../../assets/movistar-plus_logo.png';
import HBOMaxLogo from '../../assets/hbo-max_logo.png';
import AmazonLogo from '../../assets/amazon-prime-video_logo.png';

const platformLogos = {
  'disney-plus': DisneyLogo,
  'netflix': NetflixLogo,
  'movistar-plus': MovistarLogo,
  'hbo-max': HBOMaxLogo,
  'amazon-prime-video': AmazonLogo,
};

const Library = () => {
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const googleUserId = localStorage.getItem('googleUserId');

  useEffect(() => {
    const fetchFavoriteSeries = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/players/favoriteSeries/${googleUserId}`);
        setFavoriteSeries(response.data);
      } catch (error) {
        console.error('Error fetching favorite series:', error);
      }
    };

    if (googleUserId) {
      fetchFavoriteSeries();
    }
  }, [googleUserId]);

  const getPlatformLogo = (platform) => {
    return platformLogos[platform] || ImageNotFound;
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
          body: JSON.stringify({ title: serie.title }),
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
    <div className="library-wrapper">
      <div className="library-container">
        {favoriteSeries.map(serie => (
          <div key={serie.title} className="serie-container">
            <Link to={`/explore/${serie.id}`} className="serie-link">
              <div className="serie-content">
                {serie.poster_url !== 'N/A' ? (
                  <LazyImage src={serie.poster_url} alt={serie.title} className="serie-poster" />
                ) : (
                  <img src={ImageNotFound} alt={serie.title} className="serie-poster" />
                )}
                <div className="serie-details">
                  <h2>{serie.title}</h2>
                  <p>{serie.year}</p>
                  <div className="platform-logos">
                    {serie.platforms.map(platform => (
                      <img
                        key={platform}
                        src={getPlatformLogo(platform)}
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

export default Library;
