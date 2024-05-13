import requests
import time
import random
from bs4 import BeautifulSoup
from mongo_connection import MongoDBConnection
from omdb_api import get_movie_info
import os
import re
from datetime import datetime, timedelta

base_url = "https://www.justwatch.com/es/proveedor/{}/series{}"

providers_str = os.getenv("PROVIDERS")
providers = providers_str.split(",") if providers_str else ["netflix", "amazon-prime-video", "disney-plus", "hbo-max", "movistar-plus"]

pages = ["", *[f"?page={i}" for i in range(2, 5)]]

urls = [base_url.format(provider, page) for provider in providers for page in pages]

connection_string = os.getenv('MONGODB_CONNECTION_STRING')
mongo_connection = MongoDBConnection(connection_string)
database = mongo_connection.create_database("TVMatchDB")
collection = mongo_connection.create_collection(database, "series_collection")  # Create collection for series

def series_exists(title):
    query = {'title': title}
    result = mongo_connection.find_document(collection, query)
    return result

def scrape_spanish_info(title, series_url):

    while True:
            try:
                response = requests.get(series_url)
                soup = BeautifulSoup(response.content, 'html.parser')
                if soup.find('div', class_='title-block'):  # Check if there are info on this page
                    break  # Exit the loop if info are found
                else:
                    print(f"No info found on URL: {series_url}. Retrying in 5 seconds...")
                    time.sleep(5)  # Wait for 5 seconds before retrying
            except requests.RequestException as e:
                print(f"Error accessing URL: {series_url}. Retrying in 5 seconds...")
                time.sleep(5)  # Wait for 5 seconds before retrying

    title_block_div = soup.find('div', class_='title-block')

    # Check if 'title-block' div is found
    if title_block_div:
        original_title_elem = title_block_div.find('h3')
        
        if original_title_elem:
            original_title_text = original_title_elem.text.strip()
            
            parts = original_title_text.split(':')

            if len(parts) > 1:
                original_title = ':'.join(parts[1:]).strip() 
            else:
                original_title = title
        else:
            original_title = title
    else:
        original_title = title

    # Extract year
    year_elem = soup.find('span', class_='text-muted')
    year = year_elem.text.strip() if year_elem else None

    # Extract genres
    genres_div = None
    previous_h3 = soup.find('h3', class_='detail-infos__subheading', string='Géneros')
    if previous_h3:
        genres_div = previous_h3.find_next_sibling('div', class_='detail-infos__value')
        genres = [genre.strip() for genre in genres_div.text.split(',')] if genres_div else None 

    # Extract production country
    production_country_div = None
    previous_h3 = soup.find('h3', class_='detail-infos__subheading', string=' País de producción ')
    if previous_h3:
        production_country_div = previous_h3.find_next_sibling('div', class_='detail-infos__value')
        production_country = production_country_div.text.strip() if production_country_div else None

    # Pattern to search for "Sinopsis" with or without additional spaces
    sinopsis_pattern = re.compile(r'Sinopsis', re.IGNORECASE)

    # Find all <h2> elements containing "Sinopsis" anywhere in the text
    sinopsis_headers = soup.find_all('h2', class_='detail-infos__subheading--label', string=sinopsis_pattern)

    # Initialize sinopsis_text to 'N/A' as a default value
    sinopsis_text = 'N/A'

    # Iterate over each found element
    for header in sinopsis_headers:
        # Check if the <h2> header is inside an <article> or a <div>
        parent_article = header.find_parent('article', class_='article-block')
        parent_div = header.find_parent('div', class_='detail-infos__subheading')
        
        if parent_article:
            # If inside an <article>, search for paragraphs within the sibling <div> of the <h2> header
            sinopsis_div = header.find_next_sibling('div')
            if sinopsis_div:
                sinopsis_elements = sinopsis_div.find_all('p')
        elif parent_div:
            # If inside a <div>, search for paragraphs as siblings of the <div> containing the <h2> header
            sinopsis_elements = parent_div.find_next_sibling('p', class_='text-wrap-pre-line mt-0')
            if not sinopsis_elements:
                sinopsis_elements = parent_div.find_next_siblings('p', class_='text-wrap-pre-line mt-0')
        else:
            # If no suitable container is found, continue to the next iteration
            continue
        
        # If sinopsis_elements is found, extract the text from each <p> element and combine them into a single text
        if sinopsis_elements:
            sinopsis_text = '\n'.join(element.get_text(strip=True) for element in sinopsis_elements)
            # Exit the loop if sinopsis is found
            break

    return original_title, year, genres, production_country, sinopsis_text

# Function to extract series titles from multiple URLs and insert series information into the database
# Function to insert or update series info into the database
def insert_or_update_series(series_doc):
    title = series_doc['title']
    existing_series = series_exists(title)
    if existing_series:
        # Series already exists, update it
        mongo_connection.update_document(collection, {'_id': existing_series['_id']}, series_doc)
    else:
        # Series is new, insert it
        mongo_connection.insert_series(collection, series_doc)

    # Update the insertion time for each platform
    for platform in series_doc['platforms']:
        mongo_connection.update_document(collection, {'title': title}, {'$set': {f'tiempo_insercion_{platform}': datetime.now()}})

# Function to extract series titles from multiple URLs and insert series information into the database
def extract_and_insert_series_info(urls):
    for url in urls:
        print(urls)
        print(url)
        while True:
            try:
                response = requests.get(url)
                soup = BeautifulSoup(response.content, 'html.parser')
                if soup.find('a', class_='title-list-grid__item--link'):  # Check if there are any series on this page
                    break  # Exit the loop if series are found
                else:
                    print(f"No series found on URL: {url}. Retrying in 5 seconds...")
                    time.sleep(5)  # Wait for 5 seconds before retrying
            except requests.RequestException as e:
                print(f"Error accessing URL: {url}. Retrying in 5 seconds...")
                time.sleep(5)  # Wait for 5 seconds before retrying

        for link in soup.find_all('a', class_='title-list-grid__item--link'):
            series_url = "https://www.justwatch.com" + link.get('href') 
            print(series_url)
            
            # Extract title from img alt attribute
            img_tag = link.find('img', class_='picture-comp__img')
            title = img_tag.get('alt') if img_tag else None
            print(title)
            
            # Check if series already exists in the database
            existing_series = series_exists(title)
            if existing_series:
                print(f"Series '{title}' already exists in the database. ")
                # Add platform to the existing series document
                platform = url.split("/")[-2]
                platforms = existing_series.get('platforms', [])
                if platform not in platforms:
                    platforms.append(platform)
                # Update the existing series document with the new platforms data
                mongo_connection.update_document(collection, {'_id': existing_series['_id']}, {'$set': {'platforms': platforms}})
                mongo_connection.update_document(collection, {'title': title}, {'$set': {f'tiempo_insercion_{platform}': datetime.now()}})
                continue

            # Get Spanish information for the series
            original_title, year, genres, production_country, sinopsis_text = scrape_spanish_info(title, series_url)

            # Get series information from OMDB API
            poster_url, rated = get_movie_info(original_title, "a1af39b")

            platform = url.split("/")[-2]
            platforms = [platform]

            # Prepare series document
            series_doc = {
                'title': title,
                'original_title': original_title,
                'year': year,
                'genres': genres,
                'plot': sinopsis_text,
                'production_country':production_country,
                'rated': rated,
                'poster_url': poster_url,
                'platforms': platforms
            }

            # Insert or update series info into the database
            insert_or_update_series(series_doc)

            time.sleep(random.uniform(1, 2))


# Function to remove outdated platforms and series from the database
def remove_outdated_platforms():
    for series in collection.find():
        platforms = series.get('platforms', [])
        for platform in platforms:
            insertion_time_key = f'tiempo_insercion_{platform}'
            if insertion_time_key in series:
                insertion_time = series[insertion_time_key]
                if datetime.now() - insertion_time > timedelta(days=4):
                    platforms.remove(platform)
                    # If the series has no more platforms, remove it from the database
                    if not platforms:
                        collection.delete_one({'_id': series['_id']})
                    else:
                        # Update the series document with the updated platforms list
                        mongo_connection.update_document(collection, {'_id': series['_id']}, {'$set': {'platforms': platforms}})
                    break

# Execute the extraction and insertion process
extract_and_insert_series_info(urls)

# Remove outdated platforms and series from the database
remove_outdated_platforms()
