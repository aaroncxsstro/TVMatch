package com.aaroncastro.TVMatcher.dao;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.aaroncastro.TVMatcher.model.RoomsModel;

public interface RoomDAO extends MongoRepository<RoomsModel, String> {
	
    RoomsModel findByCodigo(String codigo);
}
