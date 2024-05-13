import pymongo

class MongoDBConnection:
    def __init__(self, connection_string):
        self.client = pymongo.MongoClient(connection_string)

    def create_database(self, database_name):
        return self.client[database_name]

    def create_collection(self, database, collection_name):
        return database[collection_name]

    def insert_series(self, collection, series):
        if not collection.find_one({'title': series['title']}):
            collection.insert_one(series)

    def find_document(self, collection, query):
        return collection.find_one(query)
    
    def find_all_documents(self, collection):
        return collection.find({})


    def delete_document(self, collection, query):
        collection.delete_one(query)

    def update_document(self, collection, filter_query, update_query):
        collection.update_one(filter_query, update_query)
