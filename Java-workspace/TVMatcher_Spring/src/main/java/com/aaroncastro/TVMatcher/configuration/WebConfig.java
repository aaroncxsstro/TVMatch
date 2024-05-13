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
    }
}
