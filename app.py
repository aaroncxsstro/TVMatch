import requests
from bs4 import BeautifulSoup
from mongo_connection import MongoDBConnection
from omdb_api import get_movie_info
import configparser

# Read configuration from config.ini file
config = configparser.ConfigParser()
config.read('config.ini')

#Get the connection URL to MongoDB from the configuration
connection_string = config['mongodb']['connection_string']

# Get the OMDB API key from configuration
omdb_api_key = config['omdb_api']['api_key']

# Define the URLs of the platforms
urls = [
    "https://www.justwatch.com/us/provider/netflix/tv-shows",
    "https://www.justwatch.com/us/provider/amazon-prime-video/tv-shows",
    "https://www.justwatch.com/us/provider/disney-plus/tv-shows",
    "https://www.justwatch.com/us/provider/max/tv-shows",
    "https://www.justwatch.com/us/provider/crunchyroll/tv-shows"
]

# Function to extract titles of series from multiple URLs
def extract_titles(urls):
    total_titles = []
    for url in urls:
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')
        titles_page = []
        for img in soup.find_all('img', class_='picture-comp__img'):
            titles_page.append(img.get('alt'))
        total_titles.extend(titles_page)
    return total_titles

# Establish MongoDB connection
mongo_connection = MongoDBConnection(connection_string)
database = mongo_connection.create_database("TVMatchDB")

# Create a single collection for all series
series_collection = mongo_connection.create_collection(database, "series")

# Iterate over the URLs and insert series info into the database
for url in urls:
    platform = url.split('/')[-2].replace('-', ' ').capitalize()  # Extracting platform name from URL
    if "/page=" in url:  # If the URL already has pagination
        titles = extract_titles([f"{url}&page={page}" for page in range(1, 5)]) 
    else:  # If it's the first page
        titles = extract_titles([url] + [f"{url}?page={page}" for page in range(2, 5)]) 
    for title in titles:
        # Get movie information from OMDB API
        genre, year, plot, country, poster_url, rated = get_movie_info(title, omdb_api_key) 
        
        # Check if the series already exists in the collection
        existing_series = series_collection.find_one({"title": title})
        
        if existing_series:
            # If the series already exists, check if the platform is already present
            if platform not in existing_series.get("platforms", []):
                # If the platform is not present, update its platforms list
                platforms = existing_series.get("platforms", [])
                platforms.append(platform)
                series_collection.update_one({"title": title}, {"$set": {"platforms": platforms}})
        else:
            # Prepare series document
            series_doc = {
                'title': title,
                'genre': genre,
                'year': year,
                'plot': plot,
                'country': country,
                'poster_url': poster_url,
                'rated': rated,
                'platforms': [platform] 
            }
            # Insert series info into the database
            series_collection.insert_one(series_doc)
