package com.aaroncastro.TVMatcher.dao;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.aaroncastro.TVMatcher.model.SeriesModel;

import java.util.List;

public interface SeriesDAO extends MongoRepository<SeriesModel, String> {

    @Query("{'platforms': ?0}")
    List<SeriesModel> findByPlatformsContaining(String platform);
    List<SeriesModel> findByPlatformsIn(List<String> platforms);

}

