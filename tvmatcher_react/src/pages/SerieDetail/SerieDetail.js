import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import './SerieDetail.css'; 
import ImageNotFound from '../../assets/imagenotfound.png'; 

const SerieDetail = () => {
  const [serie, setSerie] = useState(null);
  const [favoriteSeries, setFavoriteSeries] = useState([]);
  const { id } = useParams();
  const googleUserId = localStorage.getItem('googleUserId');

  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/series/${id}`);
        setSerie(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching serie:', error);
      }
    };

    const fetchFavoriteSeries = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/players/favoriteSeries/${googleUserId}`);
        setFavoriteSeries(response.data);
      } catch (error) {
        console.error('Error fetching favorite series:', error);
      }
    };

    fetchSerie();
    if (googleUserId) {
      fetchFavoriteSeries();
    }
  }, [id, googleUserId]);

  if (!serie) {
    return <div>Loading...</div>;
  }

  const { title, original_title, year, genres, plot, production_country, rated, poster_url, platforms } = serie;

  const handleStarClick = async () => {
    const isFavorite = favoriteSeries.some(favSerie => favSerie.title === title);
    try {
      if (isFavorite) {
        await fetch(`http://localhost:8080/players/favoriteSeries/${googleUserId}/${title}`, {
          method: 'DELETE',
        });
        setFavoriteSeries(favoriteSeries.filter(favSerie => favSerie.title !== title));
      } else {
        await fetch(`http://localhost:8080/players/favoriteSeries/${googleUserId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: title,
        });
        setFavoriteSeries([...favoriteSeries, serie]);
      }
    } catch (error) {
      console.error(`Error ${isFavorite ? 'removing' : 'adding'} favorite series:`, error);
    }
  };

  const getStarIconState = () => {
    return favoriteSeries.some(favSerie => favSerie.title === title) ? '' : 'grayscale(1)';
  };

  return (
    <div className="parent-container">
      <div className="serie-detail-container">
        <div className="serie-detail-poster">
          <img src={poster_url !== 'N/A' ? poster_url : ImageNotFound} alt={title} />
          <span
            className="star-icon"
            style={{ filter: getStarIconState() }}
            onClick={handleStarClick}
          >
            ⭐️
          </span>
        </div>

        <div className="serie-detail-content">
          <div className="serie-detail-header">
            <h1>{title}</h1>
            <h2>{year}</h2>
          </div>
          <p>{plot}</p>
          <div className="serie-detail-info">
            <p><strong>Géneros:</strong> {genres.join(', ')}</p>
            <p><strong>País de producción:</strong> {production_country}</p>
            <p><strong>Clasificación:</strong> {rated}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerieDetail;
