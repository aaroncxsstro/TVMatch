package com.aaroncastro.TVMatcher.bll;

import com.aaroncastro.TVMatcher.model.SeriesModel;
import com.aaroncastro.TVMatcher.dao.SeriesDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlatformServiceImpl implements PlatformService {

    @Autowired
    private SeriesDAO seriesDAO;

    @Override
    public List<SeriesModel> getAllShows() {
        return seriesDAO.findAll();
    }

    @Override
    public List<SeriesModel> getShowsByPlatforms(List<String> platforms) {
        if (platforms.isEmpty()) {
            return seriesDAO.findAll();
        } else {
            return seriesDAO.findByPlatformsIn(platforms);
        }
    }

    @Override
    public SeriesModel getShowById(String id) {
        return seriesDAO.findById(id).orElse(null);
    }

    @Override
    public List<SeriesModel> getFilteredShows(List<String> platforms, List<String> genres, int startYear, int endYear, boolean isKidModeChecked) {
        List<SeriesModel> filteredShows = seriesDAO.findAll();

        if (!platforms.isEmpty()) {
            filteredShows = filteredShows.stream()
                    .filter(show -> show.getPlatforms().stream().anyMatch(platforms::contains))
                    .collect(Collectors.toList());
        }

        if (!genres.isEmpty()) {
            List<String> modifiedGenres = genres.stream()
                    .map(genre -> genre.replace("y", " & "))
                    .collect(Collectors.toList());

            filteredShows = filteredShows.stream()
                    .filter(show -> show.getGenres().stream().anyMatch(modifiedGenres::contains))
                    .collect(Collectors.toList());
        }

        filteredShows = filteredShows.stream()
                .filter(show -> {
                    int year = Integer.parseInt(show.getYear().substring(1, show.getYear().length() - 1));
                    return year >= startYear && year <= endYear;
                })
                .collect(Collectors.toList());

        if (isKidModeChecked) {
            filteredShows = filteredShows.stream()
                    .filter(show -> {
                        String rating = show.getRated();
                        return rating.equals("G") || 
                               rating.equals("PG") || 
                               rating.equals("TV-Y") || 
                               rating.equals("TV-Y7") || 
                               rating.equals("TV-Y7-FV") || 
                               rating.equals("TV-G") || 
                               rating.equals("TV-PG");
                    })
                    .collect(Collectors.toList());
        }


        return filteredShows;
    }

}
