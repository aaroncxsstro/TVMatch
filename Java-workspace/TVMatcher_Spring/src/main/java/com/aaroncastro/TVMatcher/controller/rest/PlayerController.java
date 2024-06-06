package com.aaroncastro.TVMatcher.controller.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.aaroncastro.TVMatcher.model.PlayerModel;
import com.aaroncastro.TVMatcher.model.SeriesModel;
import com.aaroncastro.TVMatcher.dao.PlayerDAO;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerDAO playerDAO;

    @PostMapping("/create")
    public PlayerModel createPlayer(@RequestBody PlayerModel player) {
        PlayerModel existingPlayer = playerDAO.findByGoogleUserId(player.getGoogleUserId());
        if (existingPlayer != null) {
            existingPlayer.setNombre(player.getNombre());
            existingPlayer.setToken(player.getToken());
            existingPlayer.setImagenURL(player.getImagenURL());
            existingPlayer.setSeries(player.getSeries());
            existingPlayer.setSeriesPartida(player.getSeriesPartida());
            return playerDAO.save(existingPlayer);
        } else {
            return playerDAO.save(player);
        }
    }

    @GetMapping("/get/{googleUserId}")
    public PlayerModel getPlayerByGoogleUserId(@PathVariable String googleUserId) {
        return playerDAO.findByGoogleUserId(googleUserId);
    }

    @GetMapping("/exists/{googleUserId}")
    public boolean checkPlayerExists(@PathVariable String googleUserId) {
        PlayerModel player = playerDAO.findByGoogleUserId(googleUserId);
        return player != null; 
    }

    @PostMapping("/addSeries/{googleUserId}")
    public PlayerModel addSeries(@PathVariable String googleUserId, @RequestBody SeriesModel series) {
        PlayerModel player = playerDAO.findByGoogleUserId(googleUserId);
        if (player != null) {
            player.getSeries().add(series);
            return playerDAO.save(player);
        } else {
            throw new RuntimeException("Player not found");
        }
    }

    @PostMapping("/addSeriesAndSeriesPartida/{googleUserId}")
    public PlayerModel addSeriesAndSeriesPartida(@PathVariable String googleUserId, @RequestBody SeriesModel series) {
        PlayerModel player = playerDAO.findByGoogleUserId(googleUserId);
        if (player != null) {
            player.getSeries().add(series);
            player.getSeriesPartida().add(series);
            return playerDAO.save(player);
        } else {
            throw new RuntimeException("Player not found");
        }
    }
}
