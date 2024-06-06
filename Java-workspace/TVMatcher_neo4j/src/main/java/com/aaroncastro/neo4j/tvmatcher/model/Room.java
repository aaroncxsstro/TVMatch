package com.aaroncastro.neo4j.tvmatcher.model;

import java.util.List;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import com.aaroncastro.neo4j.tvmatcher.relations.PlaysIn;
import com.aaroncastro.neo4j.tvmatcher.relations.SeriesAvailableInRoom;

@Node
public class Room {
    @Id @GeneratedValue
    private Long id;
    private String codigo;
    private String estado;
    private List<String> platforms;
    private List<String> genres;
    private int startYear;
    private int endYear;
    private boolean kidModeChecked;
    private String creatorId;
    private int jugadoresChunkCompletado = 0;
    private int indiceChunk = 0;

    @Relationship(type = "PLAYS_IN", direction = Relationship.Direction.INCOMING)
    private List<PlaysIn> players;

    @Relationship(type = "SERIES_AVAILABLE_IN_ROOM")
    private List<SeriesAvailableInRoom> availableSeries;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public int getStartYear() {
        return startYear;
    }

    public void setStartYear(int startYear) {
        this.startYear = startYear;
    }

    public int getEndYear() {
        return endYear;
    }

    public void setEndYear(int endYear) {
        this.endYear = endYear;
    }

    public boolean isKidModeChecked() {
        return kidModeChecked;
    }

    public void setKidModeChecked(boolean kidModeChecked) {
        this.kidModeChecked = kidModeChecked;
    }

    public List<PlaysIn> getPlayers() {
        return players;
    }

    public void setPlayers(List<PlaysIn> players) {
        this.players = players;
    }

    public List<SeriesAvailableInRoom> getAvailableSeries() {
        return availableSeries;
    }

    public void setAvailableSeries(List<SeriesAvailableInRoom> availableSeries) {
        this.availableSeries = availableSeries;
    }

    public String getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(String creatorId) {
        this.creatorId = creatorId;
    }

    public int getJugadoresChunkCompletado() {
        return jugadoresChunkCompletado;
    }

    public void setJugadoresChunkCompletado(int jugadoresChunkCompletado) {
        this.jugadoresChunkCompletado = jugadoresChunkCompletado;
    }

    public int getIndiceChunk() {
        return indiceChunk;
    }

    public void setIndiceChunk(int indiceChunk) {
        this.indiceChunk = indiceChunk;
    }
    
    public void aumentarIndiceChunk() {
        this.indiceChunk++;
    }

    public void aumentarJugadoresChunkCompletado() {
        this.jugadoresChunkCompletado++;
    }

    public void reiniciarJugadoresChunkCompletado() {
        this.jugadoresChunkCompletado = 0;
    }

    public void resetIndiceChunk() {
        this.indiceChunk = 0;
    }
}
