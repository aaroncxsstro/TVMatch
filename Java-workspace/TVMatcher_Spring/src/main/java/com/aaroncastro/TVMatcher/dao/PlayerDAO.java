package com.aaroncastro.TVMatcher.dao;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.aaroncastro.TVMatcher.model.PlayerModel;

public interface PlayerDAO extends MongoRepository<PlayerModel, String> {
    PlayerModel findByGoogleUserId(String googleUserId);
}
