package com.aaroncastro.TVMatcher.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "salas")
public class RoomsModel {
    @Id
    private String codigo;
    private String estado;
    private List<PlayerModel> players = new ArrayList<>();
    private List<SeriesModel> series = new ArrayList<>();

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public List<PlayerModel> getJugadores() {
        return players;
    }

    public void setJugadores(List<PlayerModel> players) {
        this.players = players;
    }

    public List<SeriesModel> getSeries() {
        return series;
    }

    public void setSeries(List<SeriesModel> series) {
        this.series = series;
    }

    public void addJugador(PlayerModel player) {
        this.players.add(player);
    }

    public void addSeries(List<SeriesModel> series) {
        this.series.addAll(series);
    }

    public void removeJugadorById(String playerId) {
        for (PlayerModel player : players) {
            if (player.getId().equals(playerId)) {
                players.remove(player);
                break;
            }
        }
    }

	public String getEstado() {
		return estado;
	}

	public void setEstado(String estado) {
		this.estado = estado;
	}
}
