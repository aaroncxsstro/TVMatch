package com.aaroncastro.TVMatcher.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/platforms/netflix").allowedOrigins("*");
        registry.addMapping("/platforms/all").allowedOrigins("*");
        registry.addMapping("/platforms/{id}").allowedOrigins("*");
        registry.addMapping("/platforms/filtered").allowedOrigins("*");

        registry.addMapping("/api/rooms/create").allowedOrigins("*");
        registry.addMapping("/api/rooms/delete/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/join/{codigo}").allowedOrigins("*"); 
        registry.addMapping("/api/rooms/update-series").allowedOrigins("*");
        registry.addMapping("/api/rooms/players/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/exists/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/leave/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/update-state/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/state/{codigo}").allowedOrigins("*");
        registry.addMapping("/api/rooms/{codigo}").allowedOrigins("*");
        
        registry.addMapping("/api/players/get/{token}").allowedOrigins("*");
        registry.addMapping("/api/players/create").allowedOrigins("*");
        registry.addMapping("/api/players/exists/{token}").allowedOrigins("*");
        registry.addMapping("/api/players/addSeriesAndSeriesPartida/{googleUserId}").allowedOrigins("*");
    }
}
