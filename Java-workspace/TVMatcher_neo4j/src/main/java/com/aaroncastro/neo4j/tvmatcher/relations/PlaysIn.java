package com.aaroncastro.neo4j.tvmatcher.relations;

import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import com.aaroncastro.neo4j.tvmatcher.model.Room;

@RelationshipProperties
public class PlaysIn {
    @Id @GeneratedValue
    private Long id;
    
    @TargetNode
    private Room room;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Room getRoom() {
		return room;
	}

	public void setRoom(Room room) {
		this.room = room;
	}
    
    
}
