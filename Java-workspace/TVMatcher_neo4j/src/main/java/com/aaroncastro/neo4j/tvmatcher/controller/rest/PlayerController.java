package com.aaroncastro.neo4j.tvmatcher.controller.rest;

import com.aaroncastro.neo4j.tvmatcher.model.Player;
import com.aaroncastro.neo4j.tvmatcher.model.Room;
import com.aaroncastro.neo4j.tvmatcher.model.Series;
import com.aaroncastro.neo4j.tvmatcher.dao.PlayerRepository;
import com.aaroncastro.neo4j.tvmatcher.dao.RoomRepository;

import org.neo4j.driver.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/players")
public class PlayerController {

    private final Neo4jClient neo4jClient;

    @Autowired
    public PlayerController(Neo4jClient neo4jClient) {
        this.neo4jClient = neo4jClient;
    }

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private RoomRepository roomRepository;

    @PostMapping("/create")
    public Player createPlayer(@RequestBody Player player) {
        Optional<Player> existingPlayer = playerRepository.findByGoogleUserId(player.getGoogleUserId());
        if (existingPlayer.isPresent()) {
            return existingPlayer.get();
        }
        return playerRepository.save(player);
    }

    @GetMapping("/find/{googleUserId}")
    public Player getPlayerByGoogleUserId(@PathVariable String googleUserId) {
        Optional<Player> player = playerRepository.findByGoogleUserId(googleUserId);
        if (player.isPresent()) {
            return player.get();
        } else {
            throw new PlayerNotFoundException("Player with googleUserId " + googleUserId + " not found");
        }
    }

    @ResponseStatus(code = HttpStatus.NOT_FOUND, reason = "Player not found")
    public static class PlayerNotFoundException extends RuntimeException {
        public PlayerNotFoundException(String message) {
            super(message);
        }
    }

    @PostMapping("/joinRoom")
    public ResponseEntity<Map<String, String>> joinRoom(@RequestParam String googleUserId, @RequestParam String Codigo) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId}) MATCH (r:Room {codigo: $Codigo}) " +
                       "CREATE (p)-[:PLAYS_IN]->(r)";
        Map<String, Object> parameters = Map.of(
                "googleUserId", googleUserId,
                "Codigo", Codigo
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            return ResponseEntity.ok(Map.of("message", "Player joined room successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error joining the room"));
        }
    }

    @DeleteMapping("/leaveRoom/{codigo}")
    public ResponseEntity<Map<String, String>> leaveRoom(@PathVariable String codigo, @RequestBody Map<String, String> body) {
        String googleUserId = body.get("googleUserId");
        if (googleUserId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "googleUserId is required"));
        }

        String checkPlayersQuery = "MATCH (:Room {codigo: $codigo})<-[:PLAYS_IN]-(:Player) RETURN count(*) as playerCount";
        Map<String, Object> checkPlayersParams = Map.of("codigo", codigo);

        try {
            // Verificar si hay otros jugadores en la sala
            int playerCount = neo4jClient.query(checkPlayersQuery)
                                         .bindAll(checkPlayersParams)
                                         .fetchAs(Integer.class)
                                         .one()
                                         .get();

            // Eliminar la relación entre el jugador y la sala
            String deleteRelationQuery = "MATCH (p:Player {googleUserId: $googleUserId})-[rel:PLAYS_IN]->(r:Room {codigo: $codigo}) DELETE rel";
            Map<String, Object> deleteRelationParams = Map.of(
                    "googleUserId", googleUserId,
                    "codigo", codigo
            );
            neo4jClient.query(deleteRelationQuery)
                        .bindAll(deleteRelationParams)
                        .run();

            // Si no hay más jugadores en la sala, eliminar la sala
            if (playerCount == 1) {
                String deleteRoomQuery = "MATCH (r:Room {codigo: $codigo}) DETACH DELETE r";
                Map<String, Object> deleteRoomParams = Map.of("codigo", codigo);
                neo4jClient.query(deleteRoomQuery)
                            .bindAll(deleteRoomParams)
                            .run();
                System.out.println("Sala borrada");
            }

            return ResponseEntity.ok(Map.of("message", "Player left room successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error leaving the room"));
        }
    }

    
    @PostMapping("/likeSeries/{googleUserId}")
    public ResponseEntity<Map<String, String>> likeSeries(@PathVariable String googleUserId, @RequestBody String title) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId}) " +
                       "MATCH (s:Series {title: $title}) " +
                       "MERGE (p)-[:LIKES]->(s)";
        Map<String, Object> parameters = Map.of(
                "googleUserId", googleUserId,
                "title", title
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            
            System.out.println(query);
            System.out.println(parameters);
            return ResponseEntity.ok(Map.of("message", "Player liked series successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error liking the series"));
        }
    }
    
    @DeleteMapping("/unlikeAllSeries/{googleUserId}")
    public ResponseEntity<Map<String, String>> unlikeAllSeries(@PathVariable String googleUserId) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId})-[rel:LIKES]->(s:Series) DELETE rel";
        Map<String, Object> parameters = Map.of("googleUserId", googleUserId);

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            return ResponseEntity.ok(Map.of("message", "All series unliked successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error unliking all series"));
        }
    }
    
    @PostMapping("/favoriteSeries/{googleUserId}")
    public ResponseEntity<Map<String, String>> favoriteSeries(@PathVariable String googleUserId, @RequestBody String title) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId}) " +
                       "MATCH (s:Series {title: $title}) " +
                       "MERGE (p)-[:FAVORITES]->(s)";
        Map<String, Object> parameters = Map.of(
                "googleUserId", googleUserId,
                "title", title
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            
            System.out.println(query);
            System.out.println(parameters);
            return ResponseEntity.ok(Map.of("message", "Player marked series as favorite successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error marking series as favorite"));
        }
    }
    
    @DeleteMapping("/favoriteSeries/{googleUserId}/{title}")
    public ResponseEntity<Map<String, String>> deleteFavoriteSeries(@PathVariable String googleUserId, @PathVariable String title) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId})-[f:FAVORITES]->(s:Series {title: $title}) DELETE f";
        Map<String, Object> parameters = Map.of(
                "googleUserId", googleUserId,
                "title", title
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();

            System.out.println(query);
            System.out.println(parameters);
            return ResponseEntity.ok(Map.of("message", "Player removed series from favorites successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error removing series from favorites"));
        }
    }

   

    @GetMapping("/favoriteSeries/{googleUserId}")
    public List<Series> getFavoriteSeries(@PathVariable String googleUserId) {
        Collection<Series> seriesCollection = neo4jClient.query(
                "MATCH (p:Player {googleUserId: $googleUserId})-[:FAVORITES]->(s:Series) RETURN s, id(s) as id" )
                .bind(googleUserId).to("googleUserId")
                .fetchAs(Series.class)
                .mappedBy((typeSystem, record) -> {
                    Series series = new Series();
                    series.setId(record.get("id").asLong()); 
                    series.setTitle(record.get("s").get("title").asString());
                    series.setOriginal_title(record.get("s").get("original_title").asString());
                    series.setYear(record.get("s").get("year").asString());
                    series.setGenres(record.get("s").get("genres").asList(Value::asString));
                    series.setPlot(record.get("s").get("plot").asString());
                    series.setProduction_country(record.get("s").get("production_country").asString());
                    series.setRated(record.get("s").get("rated").asString());
                    series.setPoster_url(record.get("s").get("poster_url").asString());
                    series.setPlatforms(record.get("s").get("platforms").asList(Value::asString));
                    return series;
                })
                .all();
        return new ArrayList<>(seriesCollection);
    }


    
    @GetMapping("/isFavoriteSeries/{googleUserId}/{title}")
    public boolean isFavoriteSeries(@PathVariable String googleUserId, @PathVariable String title) {
        String query = "MATCH (p:Player {googleUserId: $googleUserId})-[:FAVORITES]->(s:Series {title: $title}) RETURN COUNT(s) > 0 as isFavorite";
        Map<String, Object> parameters = Map.of(
                "googleUserId", googleUserId,
                "title", title
        );

        try {
            Boolean isFavorite = neo4jClient.query(query)
                    .bindAll(parameters)
                    .fetchAs(Boolean.class)
                    .one()
                    .get();

            return isFavorite;
        } catch (Exception e) {
            return false;
        }
    }
    
    @PostMapping("/checkSeriesLikes/{codigo}")
    public ResponseEntity<List<Series>> checkSeriesLikes(@PathVariable String codigo, @RequestBody List<String> seriesTitles) {
        List<Series> seriesWithEqualLikesToPlayers = new ArrayList<>();

        for (String title : seriesTitles) {
            String countLikesQuery = "MATCH (:Room {codigo: $codigo})<-[:PLAYS_IN]-(p:Player)-[:LIKES]->(s:Series {title: $title}) RETURN COUNT(p) as likesCount";
            Map<String, Object> parameters = Map.of(
                    "codigo", codigo,
                    "title", title
            );

            try {
                Integer likesCount = neo4jClient.query(countLikesQuery)
                        .bindAll(parameters)
                        .fetchAs(Integer.class)
                        .one()
                        .get();

                Map<String, Object> parameters2 = Map.of(
                        "codigo", codigo
                );

                int playersCount = neo4jClient.query("MATCH (:Room {codigo: $codigo})<-[:PLAYS_IN]-(:Player) RETURN COUNT(*) as playersCount")
                        .bindAll(parameters2)
                        .fetchAs(Integer.class)
                        .one()
                        .get();

                System.out.println(playersCount);
                System.out.println(likesCount);
                // Si el número de likes es igual al número de jugadores, buscar y agregar la serie a la lista de retorno
                if (likesCount.equals(playersCount)) {
                    String seriesQuery = "MATCH (s:Series {title: $title}) RETURN s";
                    Series seriesResult = neo4jClient.query(seriesQuery)
                            .bindAll(parameters)
                            .fetchAs(Series.class)
                            .mappedBy((typeSystem, record) -> {
                                Series s = new Series();
                                s.setPoster_url(record.get("s").get("poster_url").asString());
                                s.setTitle(record.get("s").get("title").asString());
                                s.setPlatforms(record.get("s").get("platforms").asList(Value::asString));
                                return s;
                            })
                            .one()
                            .orElse(null);

                    if (seriesResult != null) {
                        seriesWithEqualLikesToPlayers.add(seriesResult);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok(seriesWithEqualLikesToPlayers);
    }


}
