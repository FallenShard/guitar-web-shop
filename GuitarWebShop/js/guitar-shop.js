// This idiom in JavaScript is known as IIFE (Immediately-invoked Function Expression)
// It prevents pollution of global namespace by placing everything in an anonymous function and evaluates it immediately
(function () {
    var itemsPerPage = 12;
    var currentOpenedBox = -1;
    var jsonCart = [];
    var jsonCartQty = [];
    var jsonCache = [];
    var totalPrice = 0;
    var hasCheckedOut = false;
    var modalFooter = null;

    // This is the callback on item click
    function onItemClick(target, e) {
        // Extract number from id of the target
        // Target's id is item-xx where xx is a number
        var ind = target.attr("id").split('-').slice(-1);
        var num = parseInt(ind);

        // If user clicked an opened item, slide it back
        if (currentOpenedBox === num)
        {
            $("#details-content-" + currentOpenedBox).slideUp("fast");
            currentOpenedBox = -1;
        }
        else
        {
            // Otherwise close the active item, and open a new one
            if (currentOpenedBox !== -1)
                $("#details-content-" + currentOpenedBox).slideUp("fast");
            
            $("#details-content-" + num).slideDown("fast");
            currentOpenedBox = num;
        }
    }

    function checkIfAdded(obj, array) {
        for (var i = 0; i < array.length; i++)
            if (obj._id === array[i]._id)
                return i;
        return -1;
    }

    function onAddToCartClick(target, e) {
        var value = target.attr("value");
        var index = parseInt(value);

        if (hasCheckedOut === true)
        {
            $("#modal-cart-body").empty();
            modalFooter.appendTo("#modal-body-footer");
            hasCheckedOut = false;
        }

        var cartIndex = checkIfAdded(jsonCache[index], jsonCart);
        if (cartIndex == -1)
        {
            jsonCart.push(jsonCache[index]);
            jsonCartQty.push(1);
            cartIndex = jsonCart.length - 1;

            var rowDiv = buildCartRowView(cartIndex);

            $("#modal-cart-body").append(rowDiv);

            totalPrice += jsonCart[cartIndex].price;
        }
        else
        {
            jsonCartQty[cartIndex]++;
            var jsonId = jsonCart[cartIndex]._id;
            $("#qty-" + jsonId).empty().append(jsonCartQty[cartIndex]);

            totalPrice += jsonCart[cartIndex].price;
        }

        $("#checkout-button").prop('disabled', false);
        $("#total-price").empty().append("$ " + numberWithCommas(totalPrice.toFixed(2)));
    }

    // Handler invoked on check out
    function onCheckOutClick(target) {
        var rowDiv = document.createElement("div");
        $(rowDiv).attr("class", "row-fluid text-center");
        
        var colDiv = document.createElement("div");
        $(colDiv).attr("class", "col-xs-12");

        $(colDiv).append("<h2>Your total receipt is $ " + numberWithCommas(totalPrice.toFixed(2)) + "!</h3>");
        $(colDiv).append("<h3>Thank you for shopping at Guitar Lounge, come again!</h3>");

        $(rowDiv).append(colDiv);

        $("#modal-cart-body").empty().append(rowDiv);

        if (hasCheckedOut === false)
        {
            hasCheckedOut = true;
            modalFooter = $("#modal-cart-total-price").detach();
            jsonCart = [];
            jsonCartQty = [];
            $(target).prop('disabled', true);
            totalPrice = 0;
        }
    }

    // Handler invoked on remove button click
    function onRemoveCartItemClick(target) {
        var itemId = $(target).attr("id").split('-').slice(-1);
        removeFromCart(itemId);
        $("#cart-row-" + itemId).remove();
        $("#total-price").empty().append("$ " + numberWithCommas(totalPrice.toFixed(2)));
    }

    // Removes an object from the cart with a given id and adjusts total price
    function removeFromCart(itemId) {
        var index = 0;
        while (index < jsonCart.length && jsonCart[index]._id != itemId)
        {
            index++;
        }

        totalPrice -= jsonCart[index].price * jsonCartQty[index];
        jsonCart.splice(index, 1);
        jsonCartQty.splice(index, 1);
    }

    function buildCartRowView(cartIndex) {
        var rowDiv = document.createElement("div");
        $(rowDiv).attr("id", "cart-row-" + jsonCart[cartIndex]._id);
        $(rowDiv).attr("value", cartIndex);
        $(rowDiv).attr("class", "row-fluid padded-vert");

        var nameDiv = document.createElement("div");
        $(nameDiv).attr("class", "col-xs-7");
        $(nameDiv).append(jsonCart[cartIndex].name);

        var quantityDiv = document.createElement("div");
        $(quantityDiv).attr("id", "qty-" + jsonCart[cartIndex]._id);
        $(quantityDiv).attr("class", "col-xs-1");
        $(quantityDiv).append(jsonCartQty[cartIndex]);

        var priceDiv = document.createElement("div");
        $(priceDiv).attr("class", "col-xs-2 text-right");
        $(priceDiv).append("$ " + numberWithCommas(jsonCart[cartIndex].price.toFixed(2)));

        var removeDiv = document.createElement("div");
        $(removeDiv).attr("class", "col-xs-2");

        var removeButton = document.createElement("button");
        $(removeButton).attr("id", "rem-btn-" + jsonCart[cartIndex]._id);
        $(removeButton).attr("class", "btn-xs btn-skin margin-vert remove-button");
        $(removeButton).append("Remove");
        $(removeButton).click(function () {
            onRemoveCartItemClick($(this));
        });
        $(removeDiv).append(removeButton);

        $(rowDiv).append(nameDiv);
        $(rowDiv).append(quantityDiv);
        $(rowDiv).append(priceDiv);
        $(rowDiv).append(removeDiv);

        return rowDiv;
    }

    // Builds the view for a single item, with a given JSON, index and itemsPerRow
    function buildItemView(item, index, itemsPerRow) {
        var itemDiv = document.createElement("div");
        $(itemDiv).attr("value", (index + 1));
        $(itemDiv).attr("id", "item-" + (index + 1));
        $(itemDiv).attr("class", "col-xs-" + (12 / itemsPerRow) + " item-div");

        // This is the rectangle behind title, the red one at the moment
        var itemTitleDiv = document.createElement("div");
        $(itemTitleDiv).attr("class", "item-title-div");
        $(itemTitleDiv).append(item.name);

        // This is the image of the item, fixed to 150x150
        var itemImage = document.createElement("img");
        $(itemImage).attr("src", "res/images/" + item.imageUrl);
        $(itemImage).attr("alt", "http://placehold.it/150x150");

        // This is the image wrapper and "price" span wrapper
        var itemImageDiv = document.createElement("div");
        $(itemImageDiv).attr("class", "item-price-tag");
        $(itemImageDiv).append(itemImage);

        // This is the "Price: " label
        var priceTagSpan = document.createElement("span");
        $(priceTagSpan).append("Price: ");
        $(itemImageDiv).append(priceTagSpan);

        // This is the footer div with the price
        var footerDiv = document.createElement("div");
        $(footerDiv).attr("class", "item-footer-div");
        $(footerDiv).append("$ " + numberWithCommas(item.price.toFixed(2)));

        // Item composition
        $(itemDiv).append(itemTitleDiv);
        $(itemDiv).append(itemImageDiv);
        $(itemDiv).append(footerDiv);

        return itemDiv;
    }

    // Builds the view for a single item, with a given JSON
    function buildDetailsView(item, index)
    {
        // This is the details row div, theres a total of n = itemsPerPage of them, all hidden
        var detailsDiv = document.createElement("div");
        $(detailsDiv).attr("class", "row-fluid");

        // This is the content of details div, a single box atm, with a shadow inset
        var detailsContent = document.createElement("div");
        $(detailsContent).attr("id", "details-content-" + (index + 1));
        $(detailsContent).attr("class", "col-xs-12 details-div");

        // This is the image of the div
        var detailsImage = document.createElement("img");
        $(detailsImage).attr("class", "img-responsive col-xs-4");
        $(detailsImage).attr("src", "res/images/" + item.imageUrl);

        // This is div that will hold the right side
        var detailsDataDiv = document.createElement("div");
        $(detailsDataDiv).attr("class", "col-xs-8");

        // This is 1/3 of the right div
        var detailsTitle = document.createElement("div");
        $(detailsTitle).attr("class", "row details-div-title");
        $(detailsTitle).append(item.name);

        // This is 2/3 of the right div
        var detailsMiddleRow = document.createElement("div");
        $(detailsMiddleRow).attr("class", "row");

        // This is 3/3 of the right div
        var detailsFooterRow = document.createElement("div");
        $(detailsFooterRow).attr("class", "row");

        // This belongs to the middle row div, the left side with attribute names
        var attributesDiv = document.createElement("div");
        $(attributesDiv).attr("class", "col-xs-3 details-attr-div");
        $(attributesDiv).append("<h3>type:</h3>");
        $(attributesDiv).append("<h3>brand:</h3>");
        $(attributesDiv).append("<h3>year:</h3>");
        $(attributesDiv).append("<h3>" + getExtraAttrib(item) + "</h3>");

        // This is the middle in the middle, values of the attributes
        var valuesDiv = document.createElement("div");
        $(valuesDiv).attr("class", "col-xs-3 details-vals-div");
        $(valuesDiv).html("<h3>" + item.type + "</h3>");
        $(valuesDiv).append("<h3>" + item.brand + "</h3>");
        $(valuesDiv).append("<h3>" + item.year + "</h3>");
        $(valuesDiv).append("<h3>" + getExtraValue(item) + "</h3>");

        // This is the right part of the middle, brand logo
        var brandImg = document.createElement("img");
        $(brandImg).attr("class", "col-xs-offset-1 col-xs-4");
        $(brandImg).attr("src", "res/logos/" + item.brandLogoUrl);

        // This is the price that appears in the 3rd div
        var detailsFooterCol = document.createElement("div");
        $(detailsFooterCol).attr("class", "col-xs-8 details-footer");
        $(detailsFooterCol).append("$ " + numberWithCommas(item.price.toFixed(2)));

        // Button column wrapper
        var buttonCol = document.createElement("div");
        $(buttonCol).attr("class", "col-xs-4");

        // Button that performs adding to cart
        var addToCartButton = document.createElement("button");
        $(addToCartButton).attr("class", "btn btn-skin btn-block btn-add-to-cart");
        $(addToCartButton).attr("value", index);
        $(addToCartButton).append("Add to Cart");
        $(buttonCol).append(addToCartButton);

        // Form the footer
        $(detailsFooterRow).append(detailsFooterCol);
        $(detailsFooterRow).append(buttonCol);

        // Now form the middle row
        $(detailsMiddleRow).append(attributesDiv);
        $(detailsMiddleRow).append(valuesDiv);
        $(detailsMiddleRow).append(brandImg);

        // Form the whole data div on the right
        $(detailsDataDiv).append(detailsTitle);
        $(detailsDataDiv).append(detailsMiddleRow);
        $(detailsDataDiv).append(detailsFooterRow);

        // Form the whole column to put in the row
        $(detailsContent).append(detailsImage);
        $(detailsContent).append(detailsDataDiv);

        // That's it, now return the row
        $(detailsDiv).append(detailsContent);

        return detailsDiv;
    }

    // This is ajax call (more like ajaj, but whatever) towards WCF
    function ajaxService(type, data, service, callback) {
        $.ajax({
            type: type,                         // GET or POST or PUT or DELETE verb
            url: "Service.svc/" + service,      // Remote function call for the service
            data: data,                         // Data sent to server
            contentType: "application/json; charset=utf-8", // Content type is JSON
            dataType: "json",                   // Expected data format from server
            processdata: true,                  // True or False
            success: function (msg) {           // Callback for successful ajax call
                callback(msg);
            },
            error: function () {                // Callback if ajax fails
                alert("Error loading products" + result.status + " " + result.statusText);
            }
        });
    }


    // Callback if the service call succeeds
    function onProductListSuccess(result) {
        currentOpenedBox = -1;
        var itemList = document.getElementById("item-content-div");
        var sidebar = document.getElementById("side-bar-div");
        var rowDiv;
        var itemsPerRow = 4;

        $(itemList).empty();
        $(sidebar).empty();
        jsonCache = [];

        for (var i = 0; i < result.length; i++) {

            // Attempt JSON parse, equivalent to eval
            try {
                var item = JSON.parse(result[i]);;
                jsonCache.push(item);
            }
            catch (exception) {
                return;
            }

            // On every Nth (4th here) item, create a row-fluid div and add to itemList
            if (i % itemsPerRow === 0) {
                rowDiv = document.createElement("div");
                $(rowDiv).attr("class", "row-fluid");
                $(itemList).append(rowDiv);
            }

            var itemDiv = buildItemView(item, i, itemsPerRow);
            var detailsDiv = buildDetailsView(item, i);

            // In the end, just append what we have as itemDiv to the current rowDiv
            $(rowDiv).append(itemDiv);

            // Detail div gets appended to the item list, so it appears below
            $(itemList).append(detailsDiv);
        }

        // This is for future use, all tags and search criteria checkboxes,
        // will add more stuff in the future, and probably out of this loop
        var tagDiv = document.createElement("div");
        $(tagDiv).attr("class", "row");
        var tagCb = document.createElement("input");
        var tagCbLabel = document.createElement("label");
        $(tagCbLabel).append("Checkbox");
        $(tagCb).attr("type", "checkbox");
        $(tagCb).append(tagCbLabel);
        $(tagDiv).append(tagCb);
        $(sidebar).append(tagDiv);

        $(".item-div").click(function (event) {
            onItemClick($(this), event);
        });

        $(".btn-add-to-cart").click(function (event) {
            onAddToCartClick($(this), event);
        });
    }

    
    // Initialization callback
    var documentInit = function () {

        // Array to hold cart item values
        Arrays = new Array();

        // Initiate ajax request to get the data from the server
        ajaxService("GET", { page: 1 }, "GetProductList", onProductListSuccess);

        for (var i = 1; i < 5; i++)
        {
            $('#page-' + i).click(pageClick(i));
        }

        $("#total-price").append("$ " + totalPrice.toFixed(2));

        $("#checkout-button").prop('disabled', true);
        $("#checkout-button").click(function () {
            onCheckOutClick($(this));
        });
    }

    function getExtraAttrib(obj) {
        if (obj.category === "guitar")
            return "strings:";
        else if (obj.category === "pedal")
            return " ";
        else if (obj.category === "amp")
            return "power:";
    }

    function getExtraValue(obj) {
        if (obj.category === "guitar")
            return obj.strings;
        else if (obj.category === "pedal")
            return " ";
        else if (obj.category === "amp")
            return obj.power;
    }

    // Since the document is not instantly ready for manipulation, jQuery can detect that
    // and react accordingly with a user-provided callback in $(document).ready(--callback--)
    $(document).ready(documentInit);

    // Pretty print regex for numbers which adds commas after every third digit
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Closure for pagination
    var pageClick = function (i) {
        return function () {
            ajaxService("GET", { page: i }, "GetProductList", onProductListSuccess);;
        };
    };
})();

