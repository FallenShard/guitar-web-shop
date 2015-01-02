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
               ResponseFormat = WebMessageFormat.Json)]
    string[] GetProductList(int page);

    [OperationContract]
    [WebInvoke(Method         = "GET",
               ResponseFormat = WebMessageFormat.Json)]
    string GetProductDetails(string id);
}
