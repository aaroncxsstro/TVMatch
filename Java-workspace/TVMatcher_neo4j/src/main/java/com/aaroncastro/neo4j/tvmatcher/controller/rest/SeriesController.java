package com.aaroncastro.neo4j.tvmatcher.controller.rest;

import com.aaroncastro.neo4j.tvmatcher.dao.SeriesRepository;
import com.aaroncastro.neo4j.tvmatcher.model.Series;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.neo4j.core.Neo4jClient;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class SeriesController {

    @Autowired
    private SeriesRepository seriesRepository;
    private final Neo4jClient neo4jClient;

    @Autowired
    public SeriesController(Neo4jClient neo4jClient) {
        this.neo4jClient = neo4jClient;
    }

    @PostMapping("/series")
    public void createSeries(@RequestBody Series series) {
        saveSeries(series);
    }

    @GetMapping("/existence")
    public boolean seriesExists(@RequestParam String title) {
        Optional<Series> series = seriesRepository.findByTitle(title);
        return series.isPresent();
    }

    private void saveSeries(Series series) {
        Map<String, Object> parameters = seriesToMap(series);
        neo4jClient.query("CREATE (s:Series) SET s = $series")
                .bind(parameters).to("series")
                .run();
    }

    private Map<String, Object> seriesToMap(Series series) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", series.getId());
        map.put("title", series.getTitle());
        map.put("original_title", series.getOriginal_title());
        map.put("year", series.getYear());
        map.put("genres", series.getGenres());
        map.put("plot", series.getPlot());
        map.put("production_country", series.getProduction_country());
        map.put("rated", series.getRated());
        map.put("poster_url", series.getPoster_url());
        map.put("platforms", series.getPlatforms());
        return map;
    }

    @GetMapping("/series/platforms")
    public List<String> getSeriesPlatforms(@RequestParam String title) {
        Optional<Series> seriesOptional = seriesRepository.findByTitle(title);
        if (seriesOptional.isPresent()) {
            Series series = seriesOptional.get();
            return series.getPlatforms();
        } else {
            return null;
        }
    }

    @PostMapping("/series/platforms/add")
    public boolean addPlatformToSeries(@RequestParam String title, @RequestParam String platform) {
        Optional<Series> seriesOptional = seriesRepository.findByTitle(title);
        if (seriesOptional.isPresent()) {
            Series series = seriesOptional.get();
            List<String> platforms = series.getPlatforms();
            if (!platforms.contains(platform)) {
                platforms.add(platform);
                series.setPlatforms(platforms);
                seriesRepository.save(series);
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    @GetMapping("/series/by-platforms")
    public List<Series> getSeriesByPlatforms(@RequestParam List<String> platforms) {
        return seriesRepository.findByPlatformsIn(platforms);
    }

    @GetMapping("/series/by-platforms/all")
    public List<Series> getAllSeries() {
        return seriesRepository.findAll();
    }

    @GetMapping("/series/{id}")
    public Optional<Series> getSeriesById(@PathVariable Long id) {
        return seriesRepository.findById(id);
    }
}
