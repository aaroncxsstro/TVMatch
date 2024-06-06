package com.aaroncastro.neo4j.tvmatcher.model;

import java.util.List;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import com.aaroncastro.neo4j.tvmatcher.relations.SeriesAvailableInRoom;

@Node
public class Series {
    @Id @GeneratedValue
    private Long id;
    private String title;
    private String original_title;
    private String year;
    private List<String> genres;
    private String plot;
    private String production_country;
    private String rated;
    private String poster_url;
    private List<String> platforms;

    @Relationship(type = "SERIES_AVAILABLE_IN_ROOM")
    private List<SeriesAvailableInRoom> seriesAvailableInRoom;

    public List<SeriesAvailableInRoom> getSeriesAvailableInRoom() {
        return seriesAvailableInRoom;
    }

    public void setSeriesAvailableInRoom(List<SeriesAvailableInRoom> seriesAvailableInRoom) {
        this.seriesAvailableInRoom = seriesAvailableInRoom;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginal_title() {
        return original_title;
    }

    public void setOriginal_title(String original_title) {
        this.original_title = original_title;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public String getPlot() {
        return plot;
    }

    public void setPlot(String plot) {
        this.plot = plot;
    }

    public String getProduction_country() {
        return production_country;
    }

    public void setProduction_country(String production_country) {
        this.production_country = production_country;
    }

    public String getRated() {
        return rated;
    }

    public void setRated(String rated) {
        this.rated = rated;
    }

    public String getPoster_url() {
        return poster_url;
    }

    public void setPoster_url(String poster_url) {
        this.poster_url = poster_url;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }
}
