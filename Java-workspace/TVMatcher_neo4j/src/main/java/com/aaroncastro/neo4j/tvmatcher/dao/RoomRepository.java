package com.aaroncastro.neo4j.tvmatcher.dao;

import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import com.aaroncastro.neo4j.tvmatcher.model.Room;

@Repository
public interface RoomRepository extends Neo4jRepository<Room, Long> {
    Room findByCodigo(String codigo);
}
