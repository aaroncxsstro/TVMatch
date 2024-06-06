package com.aaroncastro.neo4j.tvmatcher.relations;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import com.aaroncastro.neo4j.tvmatcher.model.Player;
import com.aaroncastro.neo4j.tvmatcher.model.Series;

@RelationshipProperties
public class Favorites {
    @Id @GeneratedValue
    private Long id;

    @TargetNode
    private Series series;

    @TargetNode
    private Player player;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Series getSeries() {
        return series;
    }

    public void setSeries(Series series) {
        this.series = series;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }
}