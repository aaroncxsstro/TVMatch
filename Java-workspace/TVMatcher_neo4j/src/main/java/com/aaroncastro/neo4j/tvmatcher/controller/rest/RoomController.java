package com.aaroncastro.neo4j.tvmatcher.controller.rest;

import com.aaroncastro.neo4j.tvmatcher.dao.RoomRepository;
import com.aaroncastro.neo4j.tvmatcher.dao.SeriesRepository;
import com.aaroncastro.neo4j.tvmatcher.model.Player;
import com.aaroncastro.neo4j.tvmatcher.model.Room;
import com.aaroncastro.neo4j.tvmatcher.model.Series;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.neo4j.driver.Value;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeriesRepository seriesRepository;

    private final Neo4jClient neo4jClient;

    @Autowired
    public RoomController(Neo4jClient neo4jClient) {
        this.neo4jClient = neo4jClient;
    }

    @PostMapping("/room")
    public Room createRoom(@RequestBody Room room) {
        roomRepository.save(room);
        linkSeriesToRoom(room);
        return room;
    }

    @GetMapping("/room/{codigo}/series")
    public List<Series> getSeriesForRoom(@PathVariable String codigo) {
        Collection<Series> seriesCollection = neo4jClient.query(
                "MATCH (r:Room)-[:SERIES_AVAILABLE_IN_ROOM]->(s:Series) " +
                "WHERE r.codigo = $codigo " +
                "RETURN s")
                .bind(codigo).to("codigo")
                .fetchAs(Series.class)
                .mappedBy((typeSystem, record) -> {
                    Series series = new Series();
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

    private void linkSeriesToRoom(Room room) {
        String query = "MATCH (s:Series) WHERE " +
                "ANY(platform IN s.platforms WHERE platform IN $platforms) AND " +
                "ANY(genre IN s.genres WHERE genre IN $genres) AND " +
                "toFloat(SUBSTRING(s.year, 1, 4)) >= $startYear AND " +
                "toFloat(SUBSTRING(s.year, 1, 4)) <= $endYear " +
                (room.isKidModeChecked() ? "AND s.rated IN ['G', 'PG', 'TV-Y', 'TV-Y7', 'TV-Y7-FV', 'TV-G', 'TV-PG'] " : "") +
                "WITH s " +
                "MATCH (r:Room {codigo: $codigo}) " +
                "CREATE (r)-[:SERIES_AVAILABLE_IN_ROOM]->(s) " +
                "RETURN r, s";

        System.out.println(query);
        Map<String, Object> parameters = Map.of(
                "platforms", room.getPlatforms(),
                "genres", room.getGenres(),
                "startYear", room.getStartYear(),
                "endYear", room.getEndYear(),
                "codigo", room.getCodigo()
        );
        System.out.println(parameters);

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            System.out.println("Consulta ejecutada correctamente.");
        } catch (Exception e) {
            System.err.println("Error al ejecutar la consulta en Neo4j: " + e.getMessage());
        }
    }
    
    @PostMapping("/room/{codigo}/checkTotalMatch")
    public ResponseEntity<Map<String, Object>> checkTotalMatch(@PathVariable String codigo, @RequestBody List<String> seriesTitles) {
        List<String> totalMatchTitles = new ArrayList<>();

        for (String seriesTitle : seriesTitles) {
            System.out.println("codigo: " + codigo);
            System.out.println("seriesTitle: " + seriesTitle);

            String query = "MATCH (s:Series {title: $seriesTitle})<-[:LIKES]-(p:Player)-[:PLAYS_IN]->(r:Room {codigo: $codigo}) "
                    + "RETURN count(p) as playerCount";

            System.out.println("Query 1: " + query);

            Long playerCount = neo4jClient.query(query)
                    .bind(codigo).to("codigo")
                    .bind(seriesTitle).to("seriesTitle")
                    .fetchAs(Long.class)
                    .mappedBy((typeSystem, record) -> record.get("playerCount").asLong())
                    .one()
                    .orElse(0L);

            System.out.println("Query 1 - playerCount: " + playerCount);

            String totalPlayersQuery = "MATCH (r:Room {codigo: $codigo})<-[:PLAYS_IN]-(p:Player) "
                    + "RETURN count(p) as totalPlayerCount";

            System.out.println("Query 2: " + totalPlayersQuery);

            Long totalPlayerCount = neo4jClient.query(totalPlayersQuery)
                    .bind(codigo).to("codigo")
                    .fetchAs(Long.class)
                    .mappedBy((typeSystem, record) -> record.get("totalPlayerCount").asLong())
                    .one()
                    .orElse(0L);

            System.out.println("Query 2 - totalPlayerCount: " + totalPlayerCount);

            if (playerCount.equals(totalPlayerCount) && totalPlayerCount > 0) {
                totalMatchTitles.add(seriesTitle);
            }
        }

        return ResponseEntity.ok(Map.of("totalMatchTitles", totalMatchTitles));
    }

    @PostMapping("/room/{codigo}/partialMatches")
    public ResponseEntity<Map<String, Object>> getPartialMatches(@PathVariable String codigo, @RequestBody Map<String, Object> requestBody) {
        int chunkIndex = (int) requestBody.get("chunkIndex");
        List<Map<String, Object>> partialMatches = new ArrayList<>();

        String query = "MATCH (r:Room {codigo: $codigo})<-[:PLAYS_IN]-(p:Player)-[:LIKES]->(s:Series) " +
                       "RETURN s.title as title, s.poster_url as posterUrl, collect(p.nombre) as likes";
        
        System.out.println("End of chunk");
        Collection<Map<String, Object>> matches = neo4jClient.query(query)
                .bind(codigo).to("codigo")
                .fetch()
                .all();

        for (Map<String, Object> match : matches) {
            partialMatches.add(Map.of(
                "series", Map.of(
                    "title", match.get("title"),
                    "poster_url", match.get("posterUrl")
                ),
                "likes", match.get("likes")
            ));
        }

        return ResponseEntity.ok(Map.of("partialMatches", partialMatches));
    }


    @GetMapping("/room/{codigo}/players")
    public List<Player> getPlayersForRoom(@PathVariable String codigo) {
        Collection<Player> playersCollection = neo4jClient.query(
                "MATCH (r:Room {codigo: $codigo})-[:PLAYS_IN]-(p:Player) " +
                "RETURN p")
                .bind(codigo).to("codigo")
                .fetchAs(Player.class)
                .mappedBy((typeSystem, record) -> {
                    Player player = new Player();
                    player.setNombre(record.get("p").get("nombre").asString());
                    player.setGoogleUserId(record.get("p").get("googleUserId").asString());
                    player.setImagenURL(record.get("p").get("imagenURL").asString());
                    return player;
                })
                .all();
        System.out.println(playersCollection);
        return new ArrayList<>(playersCollection);
    }

    @GetMapping("/room/exists/{codigo}")
    public boolean roomExists(@PathVariable String codigo) {
        boolean exists = neo4jClient.query(
                "MATCH (r:Room {codigo: $codigo}) " +
                "RETURN r IS NOT NULL AS exists")
                .bind(codigo).to("codigo")
                .fetchAs(Boolean.class)
                .mappedBy((typeSystem, record) -> record.get("exists").asBoolean())
                .one()
                .orElse(false);
        return exists;
    }

    @GetMapping("/room/state/{codigo}")
    public String getRoomState(@PathVariable String codigo) {
        String state = neo4jClient.query(
                "MATCH (r:Room) WHERE r.codigo = $codigo RETURN r.estado AS state")
                .bind(codigo).to("codigo")
                .fetchAs(String.class)
                .mappedBy((typeSystem, record) -> record.get("state").asString())
                .one()
                .orElse("Estado desconocido");
        return state;
    }

    @DeleteMapping("/room/{codigo}")
    public ResponseEntity<Map<String, String>> deleteRoom(@PathVariable String codigo) {
        String query = "MATCH (r:Room {codigo: $codigo}) " +
                       "DETACH DELETE r";
        Map<String, Object> parameters = Map.of("codigo", codigo);

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error deleting the room"));
        }
    }

    @DeleteMapping("/rooms")
    public ResponseEntity<Map<String, String>> deleteAllRoomsAndRelations() {
        String deleteRelationsQuery = "MATCH ()-[rel:SERIES_AVAILABLE_IN_ROOM]->() DELETE rel";
        String deleteRoomsQuery = "MATCH (r:Room) DETACH DELETE r";

        try {
            neo4jClient.query(deleteRelationsQuery).run();
            neo4jClient.query(deleteRoomsQuery).run();
            return ResponseEntity.ok(Map.of("message", "All rooms and relationships deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error deleting rooms and relationships"));
        }
    }

    @PostMapping("/room/update-state/{codigo}")
    public ResponseEntity<Map<String, String>> updateRoomState(@PathVariable String codigo, @RequestBody String nuevoEstado) {
        String query = "MATCH (r:Room {codigo: $codigo}) SET r.estado = $nuevoEstado";
        Map<String, Object> parameters = Map.of(
                "codigo", codigo,
                "nuevoEstado", nuevoEstado
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            return ResponseEntity.ok(Map.of("message", "Room state updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error updating room state"));
        }
    }
    
    @GetMapping("/room/{codigo}")
    public ResponseEntity<Room> getRoomByCodigo(@PathVariable String codigo) {
        Room room = neo4jClient.query(
                "MATCH (r:Room {codigo: $codigo}) RETURN r")
                .bind(codigo).to("codigo")
                .fetchAs(Room.class)
                .mappedBy((typeSystem, record) -> {
                    Room r = new Room();
                    r.setId(record.get("r").get("id").asLong());
                    r.setCodigo(record.get("r").get("codigo").asString());
                    r.setEstado(record.get("r").get("estado").asString());
                    r.setKidModeChecked(record.get("r").get("kidModeChecked").asBoolean());
                    r.setPlatforms(record.get("r").get("platforms").asList(Value::asString));
                    r.setGenres(record.get("r").get("genres").asList(Value::asString));
                    r.setStartYear(record.get("r").get("startYear").asInt());
                    r.setEndYear(record.get("r").get("endYear").asInt());
                    return r;
                })
                .one()
                .orElse(null);
        
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(room);
    }
    
    @GetMapping("/room/{codigo}/creator")
    public ResponseEntity<String> getRoomCreatorId(@PathVariable String codigo) {
        String query = "MATCH (r:Room {codigo: $codigo}) RETURN r.creatorId AS creatorId";
        String creatorId = neo4jClient.query(query)
                .bind(codigo).to("codigo")
                .fetchAs(String.class)
                .mappedBy((typeSystem, record) -> record.get("creatorId").asString())
                .one()
                .orElse(null);
        if (creatorId == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        return ResponseEntity.ok(creatorId);
    }
    
    @PutMapping("/room/{codigo}/creator")
    public ResponseEntity<Map<String, String>> updateRoomCreatorId(@PathVariable String codigo, @RequestBody Map<String, String> requestBody) {
        String newCreatorId = requestBody.get("creatorId");

        if (newCreatorId == null || newCreatorId.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid Creator ID"));
        }

        String query = "MATCH (r:Room {codigo: $codigo}) SET r.creatorId = $newCreatorId";
        Map<String, Object> parameters = Map.of(
                "codigo", codigo,
                "newCreatorId", newCreatorId
        );

        try {
            neo4jClient.query(query)
                    .bindAll(parameters)
                    .run();
            return ResponseEntity.ok(Map.of("message", "Room creator ID updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error updating room creator ID"));
        }
    }

    @PostMapping("/room/{codigo}/increaseIndex")
    public ResponseEntity<Map<String, String>> increaseChunkIndex(@PathVariable String codigo) {
        try {
            Room room = roomRepository.findByCodigo(codigo);
            room.aumentarIndiceChunk();
            roomRepository.save(room);
            return ResponseEntity.ok(Map.of("message", "Chunk index increased successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error increasing chunk index"));
        }
    }
    
    @PostMapping("/room/{codigo}/resetIndex")
    public ResponseEntity<Map<String, String>> resetChunkIndex(@PathVariable String codigo) {
        try {
            Room room = roomRepository.findByCodigo(codigo);
            room.resetIndiceChunk();
            roomRepository.save(room);
            return ResponseEntity.ok(Map.of("message", "Chunk index reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error resetting chunk index"));
        }
    }

    @PostMapping("/room/{codigo}/increaseCompletedChunkPlayers")
    public ResponseEntity<Map<String, String>> increaseCompletedChunkPlayers(@PathVariable String codigo) {
        try {
            Room room = roomRepository.findByCodigo(codigo);
            room.aumentarJugadoresChunkCompletado();
            roomRepository.save(room);
            return ResponseEntity.ok(Map.of("message", "Completed chunk players increased successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error increasing completed chunk players"));
        }
    }

    @PostMapping("/room/{codigo}/resetChunkPlayers")
    public ResponseEntity<Map<String, String>> resetChunkPlayers(@PathVariable String codigo) {
        try {
            Room room = roomRepository.findByCodigo(codigo);
            room.reiniciarJugadoresChunkCompletado();
            roomRepository.save(room);
            return ResponseEntity.ok(Map.of("message", "Chunk players reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(Map.of("message", "Error resetting chunk players"));
        }
    }
    
    @GetMapping("/room/{codigo}/completedPlayers")
    public ResponseEntity<Integer> getCompletedPlayersForChunk(@PathVariable String codigo) {
        Room room = roomRepository.findByCodigo(codigo);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        int completedPlayers = room.getJugadoresChunkCompletado();
        
        return ResponseEntity.ok(completedPlayers);
    }

    @GetMapping("/room/{codigo}/currentIndex")
    public ResponseEntity<Integer> getCurrentChunkIndex(@PathVariable String codigo) {
        Room room = roomRepository.findByCodigo(codigo);
        if (room == null) {
            return ResponseEntity.notFound().build();
        }

        int currentIndex = room.getIndiceChunk();
        
        return ResponseEntity.ok(currentIndex);
    }


}
