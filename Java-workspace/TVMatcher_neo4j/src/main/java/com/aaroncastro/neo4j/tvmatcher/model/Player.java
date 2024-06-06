package com.aaroncastro.neo4j.tvmatcher.model;

import java.util.List;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import com.aaroncastro.neo4j.tvmatcher.relations.Favorites;
import com.aaroncastro.neo4j.tvmatcher.relations.Likes;
import com.aaroncastro.neo4j.tvmatcher.relations.PlaysIn;

@Node
public class Player {
    @Id @GeneratedValue
    private Long id;
    private String nombre;
    private String imagenURL;
    private String googleUserId;

    @Relationship(type = "LIKES")
    private List<Likes> likes;

    @Relationship(type = "PLAYS_IN")
    private List<PlaysIn> playsIn;
    
    @Relationship(type = "FAVORITES")
    private List<Favorites> favorites;
    
    
    public List<Favorites> getFavorites() {
        return favorites;
    }

    public void setFavorites(List<Favorites> favorites) {
        this.favorites = favorites;
    }
    
    public List<Likes> getLikes() {
        return likes;
    }
    public void setLikes(List<Likes> likes) {
        this.likes = likes;
    }
    public List<PlaysIn> getPlaysIn() {
        return playsIn;
    }
    public void setPlaysIn(List<PlaysIn> playsIn) {
        this.playsIn = playsIn;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getNombre() {
        return nombre;
    }
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    public String getImagenURL() {
        return imagenURL;
    }
    public void setImagenURL(String imagenURL) {
        this.imagenURL = imagenURL;
    }
    public String getGoogleUserId() {
        return googleUserId;
    }
    public void setGoogleUserId(String googleUserId) {
        this.googleUserId = googleUserId;
    }
}
