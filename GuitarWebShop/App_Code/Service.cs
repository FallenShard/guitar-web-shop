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

// NOTE: You can use the "Rename" command on the "Refactor" menu 
// to change the class name "Service" in code, svc and config file together.
[AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
public class Service : IService
{
    private IMongoQuery m_cachedQuery = null;

    public string[] GetProductList(int page)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        //var server = MongoServer.Create(connectionString);
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");
        var bsons = collection.FindAll().SetSortOrder(SortBy.Ascending("name")).Skip(12 * (page - 1)).Take(12);

        List<string> products = new List<string>();

        foreach (BsonDocument doc in bsons)
        {
            products.Add(doc.ToJson());
        }

        return products.ToArray();
    }


    public string GetProductDetails(string id)
    {
        return string.Empty;
    }

    public long GetDataCount(string categories, string filters)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        //var server = MongoServer.Create(connectionString);
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");

        if (!categories.Equals("", StringComparison.Ordinal))
            m_cachedQuery = buildQuery(categories, filters);

        if (m_cachedQuery != null)
            return collection.Find(m_cachedQuery).Count();
        else
            return collection.FindAll().Count();
    }

    public string[] GetFilteredItems(int page, string categories, string filters)
    {
        if (categories == "")
            return GetProductList(page);

        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        //var server = MongoServer.Create(connectionString);
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

       
        var collection = db.GetCollection<BsonDocument>("items");

        IEnumerable<BsonDocument> bsons = null;

        if (!categories.Equals("", StringComparison.Ordinal))
            m_cachedQuery = buildQuery(categories, filters);

        if (m_cachedQuery != null)
        {
            bsons = paginate(collection.Find(m_cachedQuery).SetSortOrder(SortBy.Ascending("name")), page);
        }
        else
            bsons = paginate(collection.FindAll().SetSortOrder(SortBy.Ascending("name")), page);

        List<string> products = new List<string>();

        foreach (BsonDocument doc in bsons)
        {
            products.Add(doc.ToJson());
        }
        return products.ToArray();
    }

    // This function takes a list of categories and filters and builds a query based on that
    private IMongoQuery buildQuery(string categories, string filters)
    {
        // This list will hold all our queries
        IList<IMongoQuery> queries = new List<IMongoQuery>();

        // First, deserialze categories and build a query from them
        string[] categs = categories.Split('|');
        BsonValue[] bsonCategs = new BsonString[categs.Length];
        for (int i = 0; i < categs.Length; i++) bsonCategs[i] = categs[i];

        queries.Add(Query.In("category", bsonCategs));

        // Early exit for performance
        if (filters.Equals("", StringComparison.Ordinal))
            return Query.And(queries);
        
        // Now, if we have additional filters, process them
        Dictionary<string, IList<BsonValue>> queryObject = new Dictionary<string, IList<BsonValue>>();
        string[] filts = filters.Split('|');
        for (int i = 0; i < filts.Length; i++)
        {
            string[] parts = filts[i].Split('-');
            
            // If first part belongs in a given category set, it's a valid filter
            if (Array.IndexOf(categs, parts[0]) != -1)
            {
                // If second part is not in the dictionary, create an entry
                if (!queryObject.ContainsKey(parts[1]))
                    queryObject.Add(parts[1], new List<BsonValue>());

                // Finally add the third part as part of the value
                IList<BsonValue> value = queryObject[parts[1]];
                value.Add(new BsonString(parts[2]));
            }
        }

        foreach (var element in queryObject)
            queries.Add(Query.In(element.Key, element.Value));

        return Query.And(queries);
    }

    public string[] GetItemsWithCachedQuery(int page)
    {
        if (m_cachedQuery == null)
            return GetProductList(page);
        else
        {
            // Specify connection string for mongo database
            var connectionString = "mongodb://localhost:27017/?safe=true";

            // Open the connection towards the server
            //var server = MongoServer.Create(connectionString);
            var client = new MongoClient(connectionString);
            var server = client.GetServer();

            // Fetch the database named guitar_shop
            var db = server.GetDatabase("guitar_shop");


            var collection = db.GetCollection<BsonDocument>("items");

            var bsons = paginate(collection.Find(m_cachedQuery).SetSortOrder(SortBy.Ascending("name")), page);

            List<string> products = new List<string>();

            foreach (BsonDocument doc in bsons)
            {
                products.Add(doc.ToJson());
            }

            return products.ToArray();
        }
    }

    private IEnumerable<BsonDocument> paginate(MongoCursor<BsonDocument> collection, int page)
    {
        return collection.Skip(12 * (page - 1)).Take(12);
    }

    public string[] GetDistinctValues(string property, string category)
    {
        // Specify connection string for mongo database
        var connectionString = "mongodb://localhost:27017/?safe=true";

        // Open the connection towards the server
        //var server = MongoServer.Create(connectionString);
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
}
