import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; 
import './SerieDetail.css'; 
import ImageNotFound from '../../assets/imagenotfound.png'; 

const SerieDetail = () => {
  const [serie, setSerie] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchSerie = async () => {
      try {
        const response = await axios.get(`http://192.168.0.30:8080/platforms/${id}`);
        setSerie(response.data);
        console.log(response.data);
      } catch (error) {
        console.error('Error fetching serie:', error);
      }
    };

    fetchSerie();
  }, [id]);

  if (!serie) {
    return <div>Loading...</div>;
  }

  const { title, original_title, year, genres, plot, production_country, rated, posterUrl, platforms } = serie;


  return (
<div className="parent-container">
    <div className="serie-detail-container">
      <div className="serie-detail-poster">
      <img src={posterUrl !== 'N/A' ? posterUrl : ImageNotFound} alt={title} />
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
