package com.aaroncastro.neo4j.tvmatcher.dao;

import java.util.Optional;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import com.aaroncastro.neo4j.tvmatcher.model.Player;

@Repository
public interface PlayerRepository extends Neo4jRepository<Player, Long> {
	Optional<Player> findByGoogleUserId(String googleUserId);
}
