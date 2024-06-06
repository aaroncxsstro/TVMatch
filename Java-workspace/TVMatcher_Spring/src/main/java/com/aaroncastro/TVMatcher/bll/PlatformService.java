package com.aaroncastro.TVMatcher.bll;

import java.util.List;
import com.aaroncastro.TVMatcher.model.*;

public interface PlatformService {

    List<SeriesModel> getAllShows();
    
    List<SeriesModel> getShowsByPlatforms(List<String> platforms);

    SeriesModel getShowById(String id);

    List<SeriesModel> getFilteredShows(List<String> platforms, List<String> genres, int startYear, int endYear, boolean isKidModeChecked);

    
}
