using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.Text;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Driver.Builders;
using MongoDB.Bson.IO;

// NOTE: You can use the "Rename" command on the "Refactor" menu 
// to change the class name "Service" in code, svc and config file together.
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class Service : IService
{
    public string[] GetProductList(int page)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");
        var bsonData = collection.FindAll().SetSortOrder(SortBy.Ascending("category"));

        List<string> products = new List<string>();

        var jsonWriterSettings = new JsonWriterSettings { OutputMode = JsonOutputMode.Strict };
        foreach (BsonDocument doc in bsonData)
        {
            doc["_id"] = doc["_id"].ToString();
            products.Add(doc.ToJson(jsonWriterSettings));
        }

        return products.ToArray();
    }


    public string GetProductDetails(string id)
    {
        return string.Empty;
    }

    public long GetDataCount(string categories, string filters, double minPrice, double maxPrice)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");

        IList<IMongoQuery> queries = null;
        if (!categories.Equals("", StringComparison.Ordinal))
            queries = buildQueries(categories, filters);

        var priceQuery = buildPriceQuery(minPrice, maxPrice);
        var filterQuery = queries == null ? null : Query.Or(queries);

        var finalQuery = mergeQueries(priceQuery, filterQuery);

        if (finalQuery != null)
        {
            return collection.Find(finalQuery).Count();
        }
        else
            return collection.FindAll().Count();
    }

    public string[] GetFilteredItems(int page, string categories, string filters, double minPrice, double maxPrice)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

       
        var collection = db.GetCollection<BsonDocument>("items");

        IList<IMongoQuery> queries = null;
        if (!categories.Equals("", StringComparison.Ordinal))
            queries = buildQueries(categories, filters);

        var priceQuery = buildPriceQuery(minPrice, maxPrice);
        var filterQuery = queries == null ? null : Query.Or(queries);

        var finalQuery = mergeQueries(priceQuery, filterQuery);

        IEnumerable<BsonDocument> bsonData;

        if (finalQuery != null)
        {
            bsonData = paginate(collection.Find(finalQuery).SetSortOrder(SortBy.Ascending("name")), page);
        }
        else
            bsonData = paginate(collection.FindAll().SetSortOrder(SortBy.Ascending("name")), page);

        List<string> products = new List<string>();

        var jsonWriterSettings = new JsonWriterSettings { OutputMode = JsonOutputMode.Strict };
        foreach (BsonDocument doc in bsonData)
        {
            doc["_id"] = doc["_id"].ToString();
            products.Add(doc.ToJson(jsonWriterSettings));
        }

        return products.ToArray();
    }

    
    

    public string[] GetDistinctValues(string property, string category)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");

        var bsons = collection.Distinct(property, Query.EQ("category", category));

        List<string> products = new List<string>();
        products.Add(category);
        products.Add(property);

        foreach (BsonValue val in bsons)
        {
            products.Add(val.AsString);
        }

        return products.ToArray();
    }

    public double[] GetPropertyRange(string property)
    {
        double[] minMax = new double[2];

        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");

        var minDocument = collection.Find(Query.Exists("price")).SetSortOrder(SortBy.Ascending("price")).SetLimit(1).First();
        var maxDocument = collection.Find(Query.Exists("price")).SetSortOrder(SortBy.Descending("price")).SetLimit(1).First();

        minMax[0] = minDocument["price"].AsDouble;
        minMax[1] = maxDocument["price"].AsDouble;

        return minMax;
    }

    // This function takes a list of categories and filters and builds a query based on that
    private IList<IMongoQuery> buildQueries(string categories, string filters)
    {
        // This list will hold all our queries
        IList<IMongoQuery> queries = new List<IMongoQuery>();

        // First, deserialize categories and build a query from them
        string[] categs = categories.Split('|');
        for (int i = 0; i < categs.Length; i++)
        {
            queries.Add(Query.EQ("category", categs[i]));
        }

        // Early exit for performance
        if (filters.Equals("", StringComparison.Ordinal))
            return queries;

        // Now, if we have additional filters, process them (THIS PART IS NOT FOR THE FAINT OF HEART)
        Dictionary<string, Dictionary<string, IList<BsonValue>>> queryDict = new Dictionary<string, Dictionary<string, IList<BsonValue>>>();
        
        // First add categories that user selected
        for (int i = 0; i < categs.Length; i++)
            queryDict.Add(categs[i], new Dictionary<string, IList<BsonValue>>());

        // Now process the actual filters
        string[] filts = filters.Split('|');
        for (int i = 0; i < filts.Length; i++)
        {
            string[] parts = filts[i].Split('-');

            // If first part belongs in a given category set, it's a valid filter
            if (queryDict.ContainsKey(parts[0]))
            {
                // If second part is not in the dictionary, create an entry
                if (!queryDict[parts[0]].ContainsKey(parts[1]))
                    queryDict[parts[0]].Add(parts[1], new List<BsonValue>());

                // Finally add the third part as part of the value
                IList<BsonValue> value = queryDict[parts[0]][parts[1]];
                value.Add(new BsonString(parts[2]));
            }
        }
        
        // Reset queries at this point, we're building a new list
        queries = new List<IMongoQuery>(); 
        foreach (var element in queryDict)
        {
            IList<IMongoQuery> tempQueryList = new List<IMongoQuery>();
            tempQueryList.Add(Query.EQ("category", element.Key));

            foreach (var inner in queryDict[element.Key])
            {
                tempQueryList.Add(Query.In(inner.Key, inner.Value));
            }

            queries.Add(Query.And(tempQueryList));
        }

        return queries;
    }

    private IMongoQuery buildPriceQuery(double minPrice, double maxPrice)
    {
        IMongoQuery minQuery = null;
        IMongoQuery maxQuery = null;
        if (minPrice != 0.0 && !double.IsNaN(minPrice))
            minQuery = Query.GTE("price", minPrice);
        if (maxPrice != 0.0 && !double.IsNaN(maxPrice))
            maxQuery = Query.LTE("price", maxPrice);

        if (minQuery == null)
            return maxQuery;
        if (maxQuery == null)
            return minQuery;

        return Query.And(minQuery, maxQuery);
    }

    private IMongoQuery mergeQueries(IMongoQuery priceQuery, IMongoQuery filterQuery)
    {
        if (priceQuery == null)
            return filterQuery;
        if (filterQuery == null)
            return priceQuery;

        return Query.And(priceQuery, filterQuery);
    }
    private IEnumerable<BsonDocument> paginate(MongoCursor<BsonDocument> collection, int page)
    {
        return collection.Skip(12 * (page - 1)).Take(12);
    }

    public string AddItem(string category, string name, string type, string brand, double year, double price, double extra, string tags, string imageUrl, string brandLogoUrl)
    {
        var connectionString = "mongodb://localhost:27017/?safe=true";
        var client = new MongoClient(connectionString);
        var server = client.GetServer();
        var db = server.GetDatabase("guitar_shop");
        var collection = db.GetCollection<BsonDocument>("items");

        var query = Query.EQ("name", name);

        if (collection.Find(query).Count() > 0)
            return "A item with that name already exists in your shop.";

        var splitTags = tags.Split(',');

        switch (category)
        {
            case "guitar":
                Guitar newGuitar = new Guitar
                {
                    category = category,
                    name = name,
                    type = type,
                    brand = brand,
                    year = (int)year,
                    price = price,
                    strings = (int)extra,
                    tags = new List<String>(splitTags),
                    imageUrl = imageUrl,
                    brandLogoUrl = brandLogoUrl
                };

                collection.Insert(newGuitar);

                break;

            case "amp":
                Amplifier newAmplifier = new Amplifier
                {
                    category = category,
                    name = name,
                    type = type,
                    brand = brand,
                    year = (int)year,
                    price = price,
                    power = (int)extra,
                    tags = new List<String>(splitTags),
                    imageUrl = imageUrl,
                    brandLogoUrl = brandLogoUrl
                };

                collection.Insert(newAmplifier);

                break;

            case "pedal":
                Pedal newPedal = new Pedal
                {
                    category = category,
                    name = name,
                    type = type,
                    brand = brand,
                    year = (int)year,
                    price = price,
                    tags = new List<String>(splitTags),
                    imageUrl = imageUrl,
                    brandLogoUrl = brandLogoUrl
                };

                collection.Insert(newPedal);

                break;
        }

        return "A new " + category + " inserted successfully";
        //Example - A new pedal inserted successfully
    }

    //Removes item with given ID from database if it is in database
    public string RemoveItem(string id)
    {
        var connectionString = "mongodb://localhost:27017/?safe=true";
        var client = new MongoClient(connectionString);
        var server = client.GetServer();
        var db = server.GetDatabase("guitar_shop");
        var collection = db.GetCollection<BsonDocument>("items");

        var query = Query.EQ("_id", new ObjectId(id));

        WriteConcernResult res = collection.Remove(query);

        return id;
    }
}
