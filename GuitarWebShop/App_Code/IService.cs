using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using MongoDB.Driver;
using MongoDB.Bson;

// NOTE: You can use the "Rename" command on the "Refactor" menu 
// to change the interface name "IService" in both code and config file together.
[ServiceContract]
public interface IService
{
    [OperationContract]
    [WebInvoke(Method         = "GET",
               ResponseFormat = WebMessageFormat.Json,
               RequestFormat = WebMessageFormat.Json)]
    string[] GetProductList(int page);

    [OperationContract]
    [WebInvoke(Method         = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    string GetProductDetails(string id);

    [OperationContract]
    [WebInvoke(Method = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    string[] GetFilteredItems(int page, string categories, string filters);

    [OperationContract]
    [WebInvoke(Method = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    string[] GetItemsWithCachedQuery(int page);

    [OperationContract]
    [WebInvoke(Method = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    long GetDataCount(string categories, string filters);

    [OperationContract]
    [WebInvoke(Method = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    string[] GetDistinctValues(string property, string category);

    //[OperationContract]
    //[WebInvoke(Method         = "GET",
    //           ResponseFormat = WebMessageFormat.Json)]
    //string SearchDatabase(string filterChain);

    //[OperationContract]
    //[WebInvoke(Method         = "POST",
    //           ResponseFormat = WebMessageFormat.Json)]
    //string AddItem(string category, string name, string type, string brand, double year, string price, double extra, string[] tags);

    //[OperationContract]
    //[WebInvoke(Method         = "POST",
    //           ResponseFormat = WebMessageFormat.Json)]
    //string RemoveItem(string id);
}
