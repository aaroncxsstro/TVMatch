package com.aaroncastro.TVMatcher.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "players")
public class PlayerModel {

    @Id
    private String id;
    private String nombre;
    private String token;
    private String imagenURL;
    private List<SeriesModel> series;
    private List<SeriesModel> seriesPartida;
    private String googleUserId;

    public PlayerModel(String id, String nombre, String token, String imagenURL, List<SeriesModel> series, List<SeriesModel>  seriesPartida, String googleUserId) {
    	this.id = id;
        this.nombre = nombre;
        this.token = token;
        this.imagenURL = imagenURL;
        this.series = series;
        this.seriesPartida = seriesPartida;
        this.googleUserId = googleUserId;
    }

    
    public List<SeriesModel> getSeriesPartida() {
		return seriesPartida;
	}


	public void setSeriesPartida(List<SeriesModel> seriesPartida) {
		this.seriesPartida = seriesPartida;
	}


	public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}


	public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getImagenURL() {
        return imagenURL;
    }

    public void setImagenURL(String imagenURL) {
        this.imagenURL = imagenURL;
    }

    public List<SeriesModel> getSeries() {
        return series;
    }

    public void setSeries(List<SeriesModel> series) {
        this.series = series;
    }

	public String getGoogleUserId() {
		return googleUserId;
	}

	public void setGoogleUserId(String googleUserId) {
		this.googleUserId = googleUserId;
	}
}
