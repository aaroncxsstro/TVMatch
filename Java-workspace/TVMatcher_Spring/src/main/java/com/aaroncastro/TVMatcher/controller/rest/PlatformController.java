package com.aaroncastro.TVMatcher.controller.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.aaroncastro.TVMatcher.bll.PlatformService;
import com.aaroncastro.TVMatcher.model.SeriesModel;

import java.util.List;

@RestController
@RequestMapping("/platforms")
public class PlatformController {

    @Autowired
    private PlatformService platformService;

    @GetMapping("/filtered")
    public ResponseEntity<List<SeriesModel>> getFilteredShows(
            @RequestParam(required = false) List<String> platforms,
            @RequestParam(required = false) List<String> genres,
            @RequestParam(required = false, defaultValue = "1971") int startYear,
            @RequestParam(required = false, defaultValue = "2030") int endYear,
            @RequestParam(required = false, defaultValue = "false") boolean isKidModeChecked) {

        if ((platforms == null || platforms.isEmpty()) && (genres == null || genres.isEmpty())) {
            return ResponseEntity.ok(platformService.getAllShows());
        }

        List<SeriesModel> filteredShows = platformService.getFilteredShows(platforms, genres, startYear, endYear, isKidModeChecked);

        return ResponseEntity.ok(filteredShows);
    }

    @GetMapping("/all")
    public List<SeriesModel> getAllShows(@RequestParam List<String> platforms) {
        if (platforms.isEmpty()) {
            return platformService.getAllShows();
        } else {
            return platformService.getShowsByPlatforms(platforms);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SeriesModel> getShowById(@PathVariable String id) {
        SeriesModel serie = platformService.getShowById(id);
        if (serie != null) {
            return ResponseEntity.ok(serie);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/filtered")
    public ResponseEntity<List<SeriesModel>> getFilteredShowsPost(
            @RequestBody FilterRequest filterRequest) {

        List<String> platforms = filterRequest.getPlatforms();
        List<String> genres = filterRequest.getGenres();
        int startYear = filterRequest.getStartYear();
        int endYear = filterRequest.getEndYear();
        boolean isKidModeChecked = filterRequest.isKidModeChecked();

        if ((platforms == null || platforms.isEmpty()) && (genres == null || genres.isEmpty())) {
            return ResponseEntity.ok(platformService.getAllShows());
        }

        List<SeriesModel> filteredShows = platformService.getFilteredShows(platforms, genres, startYear, endYear, isKidModeChecked);

        return ResponseEntity.ok(filteredShows);
    }

    static class FilterRequest {
        private List<String> platforms;
        private List<String> genres;
        private int startYear;
        private int endYear;
        private boolean isKidModeChecked;

        // Getters y Setters
        public List<String> getPlatforms() {
            return platforms;
        }

        public void setPlatforms(List<String> platforms) {
            this.platforms = platforms;
        }

        public List<String> getGenres() {
            return genres;
        }

        public void setGenres(List<String> genres) {
            this.genres = genres;
        }

        public int getStartYear() {
            return startYear;
        }

        public void setStartYear(int startYear) {
            this.startYear = startYear;
        }

        public int getEndYear() {
            return endYear;
        }

        public void setEndYear(int endYear) {
            this.endYear = endYear;
        }

        public boolean isKidModeChecked() {
            return isKidModeChecked;
        }

        public void setKidModeChecked(boolean kidModeChecked) {
            isKidModeChecked = kidModeChecked;
        }
    }
}
