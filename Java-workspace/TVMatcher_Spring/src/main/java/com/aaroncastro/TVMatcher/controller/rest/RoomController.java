package com.aaroncastro.TVMatcher.controller.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.aaroncastro.TVMatcher.model.RoomsModel;
import com.aaroncastro.TVMatcher.model.SeriesModel;
import com.aaroncastro.TVMatcher.model.PlayerModel;
import com.aaroncastro.TVMatcher.dao.RoomDAO;

import java.util.Iterator;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomDAO roomDAO;

    @PostMapping("/create")
    public RoomsModel createSala(@RequestBody RoomsModel sala) {
        return roomDAO.save(sala);
    }

    @PostMapping("/delete/{codigo}")
    public void deleteSala(@PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null && !sala.getEstado().equals("Juego")) {
            roomDAO.delete(sala);
        }
    }
    
    @PostMapping("/join/{codigo}")
    public RoomsModel joinSala(@RequestBody PlayerModel jugador, @PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            sala.addJugador(jugador);
            return roomDAO.save(sala);
        }
        return null;
    }

    @PostMapping("/leave/{codigo}")
    public RoomsModel leaveSala(@RequestBody String playerId, @PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null && !sala.getEstado().equals("Juego")) {
            Iterator<PlayerModel> iterator = sala.getJugadores().iterator();
            while (iterator.hasNext()) {
                PlayerModel player = iterator.next();
                if (player.getGoogleUserId().equals(playerId)) {
                    iterator.remove();
                    return roomDAO.save(sala);
                }
            }
        }
        return null;
    }

    @PostMapping("/update-series")
    public RoomsModel updateSeries(@RequestParam String codigo, @RequestBody List<SeriesModel> series) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            sala.setSeries(series);
            return roomDAO.save(sala);
        }
        return null;
    }

    @GetMapping("/players/{codigo}")
    public List<PlayerModel> getPlayers(@PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            return sala.getJugadores();
        }
        return null;
    }

    @GetMapping("/exists/{codigo}")
    public boolean roomExists(@PathVariable String codigo) {
        return roomDAO.findByCodigo(codigo) != null;
    }
    
    @PostMapping("/update-state/{codigo}")
    public ResponseEntity<String> updateState(@PathVariable String codigo, @RequestBody String estado) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            sala.setEstado(estado);
            roomDAO.save(sala);
            return ResponseEntity.ok("Estado de la sala actualizado a " + estado + ".");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sala no encontrada.");
        }
    }
    
    @GetMapping("/{codigo}")
    public ResponseEntity<RoomsModel> getSala(@PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            return ResponseEntity.ok(sala);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/state/{codigo}")
    public ResponseEntity<String> getRoomState(@PathVariable String codigo) {
        RoomsModel sala = roomDAO.findByCodigo(codigo);
        if (sala != null) {
            return ResponseEntity.ok(sala.getEstado());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sala no encontrada.");
        }
    }
}
