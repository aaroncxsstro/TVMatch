package com.aaroncastro.TVMatcher.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "series_collection") 
public class SeriesModel {
    
    @Id
    private String id;
    private String title;
    private String original_title; 
    private String year;
    private List<String> genres;
    private String plot;
    private String production_country;
	private String rated;
    private String poster_url; 
    private List<String> platforms;
    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getOriginalTitle() {
        return original_title;
    }
    public void setOriginalTitle(String originalTitle) {
        this.original_title = originalTitle;
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
    public String getPosterUrl() {
        return poster_url;
    }
    public void setPosterUrl(String posterUrl) {
        this.poster_url = posterUrl;
    }
    public List<String> getPlatforms() {
        return platforms;
    }
    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }
    
}
