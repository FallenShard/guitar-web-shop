using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

using MongoDB.Bson;
using MongoDB.Driver;

public class Pedal
{
    public ObjectId Id { get; set; }
    public String category { get; set; }
    public String name { get; set; }
    public String type { get; set; }
    public String brand { get; set; }
    public int year { get; set; }
    public double price { get; set; }
    public List<String> tags { get; set; }
    public String imageUrl { get; set; }
    public String brandLogoUrl { get; set; }

    public Pedal()
    {
        //
        // TODO: Add constructor logic here
        //
    }
}