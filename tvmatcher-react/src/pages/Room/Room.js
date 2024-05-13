import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Alert, Share } from 'react-native'; 

const Room = () => {
  const location = useLocation();
  const { id } = useParams(); // Extraer el ID de la URL

  const { options, genres, isKidModeChecked, startYear, endYear } = location.state;

  useEffect(() => {
    // Lógica para obtener y filtrar datos
  }, [location.state]);

  // Función para compartir la URL de la sala
  const onShare = async () => {
    try {
      await Share.share({
        message: `¡Únete a mi sala de películas! ID: ${id}`,
      });
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  return (
    <div>
      <h2>Código de la sala: {id}</h2> {/* Muestra el ID de la sala */}
      <input type="text" value={id} readOnly /> {/* Input con el ID de la sala */}
      <button onClick={onShare}>Compartir</button> {/* Botón para compartir la URL */}
    </div>
  );
}

export default Room;
