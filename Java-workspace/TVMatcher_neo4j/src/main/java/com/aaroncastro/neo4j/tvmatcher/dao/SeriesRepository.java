package com.aaroncastro.neo4j.tvmatcher.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import com.aaroncastro.neo4j.tvmatcher.model.Series;

public interface SeriesRepository extends Neo4jRepository<Series, Long> {
    Optional<Series> findByTitle(String title);
    
    @Query("MATCH (s:Series) WHERE ANY(platform IN s.platforms WHERE platform IN $platforms) RETURN s")
    List<Series> findByPlatformsIn(List<String> platforms);
}
