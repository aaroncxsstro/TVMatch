import requests
import os

def get_movie_info(title, omdb_api_key):
    api_key = os.getenv('OMDB_API_KEY')
    if (api_key): 
        api_key
    else:
        api_key=omdb_api_key
    url = f'http://www.omdbapi.com/?t={title}&apikey={api_key}'
    response = requests.get(url)
    data = response.json()

    genre = data.get('Genre', 'N/A')
    year = data.get('Year', 'N/A')
    plot = data.get('Plot', 'N/A')
    country = data.get('Country', 'N/A')
    poster_url = data.get('Poster', 'N/A')
    rated = data.get('Rated', 'N/A') 

    return poster_url, rated