using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.Text;
using MongoDB.Driver;
using MongoDB.Bson;

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
        //var server = MongoServer.Create(connectionString);
        var client = new MongoClient(connectionString);
        var server = client.GetServer();

        // Fetch the database named guitar_shop
        var db = server.GetDatabase("guitar_shop");

        var collection = db.GetCollection<BsonDocument>("items");
        var bsons = collection.FindAll().Skip(12 * (page - 1)).Take(12);

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
}
