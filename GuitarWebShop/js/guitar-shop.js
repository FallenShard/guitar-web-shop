
// This idiom in JavaScript is known as IIFE (Immediately-invoked Function Expression)
// It prevents pollution of global namespace by placing everything in an anonymous function and evaluates it immediately
(function () {
    var currentOpenedBox = -1;
    var Arrays;

    // This is the callback on item click
    function onItemClick(target, e) {
        var ind = target.attr("value");
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

    // This function is still unprocessed, I'll check it out later
    function OnAddToCart(target) {

        var thisID = target.parent().parent().attr('id').replace('detail-', '');

        var itemname = target.parent().find('.item_name').html();
        var itemprice = target.parent().find('.price').html();

        if (include(Arrays, thisID)) {
            var price = $('#each-' + thisID).children(".shopp-price").find('em').html();
            var quantity = $('#each-' + thisID).children(".shopp-quantity").html();
            quantity = parseInt(quantity) + parseInt(1);

            var total = parseInt(itemprice) * parseInt(quantity);

            $('#each-' + thisID).children(".shopp-price").find('em').html(total);
            $('#each-' + thisID).children(".shopp-quantity").html(quantity);

            var prev_charges = $('.cart-total span').html();
            prev_charges = parseInt(prev_charges) - parseInt(price);

            prev_charges = parseInt(prev_charges) + parseInt(total);
            $('.cart-total span').html(prev_charges);

            $('#total-hidden-charges').val(prev_charges);
        }
        else {
            Arrays.push(thisID);

            var prev_charges = $('.cart-total span').html();
            prev_charges = parseInt(prev_charges) + parseInt(itemprice);

            $('.cart-total span').html(prev_charges);
            $('#total-hidden-charges').val(prev_charges);

            var Height = $('#cart_wrapper').height();
            $('#cart_wrapper').css({ height: Height + parseInt(45) });

            $('#cart_wrapper .cart-info').append('<div class="shopp" id="each-' + thisID + '"><div class="label">' + itemname + '</div><div class="shopp-price"> $<em>' + itemprice + '</em></div><span class="shopp-quantity">1</span><img src="remove.png" class="remove" /><br class="all" /></div>');

        }
    }

    function buildItemView(item, index, itemsPerRow) {
        var itemDiv = document.createElement("div");
        $(itemDiv).attr("value", (index + 1));
        $(itemDiv).attr("id", "item-" + (index + 1));
        $(itemDiv).attr("class", "col-lg-" + (12 / itemsPerRow) + " item-div");

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



    // This is ajax call (more like ajaj, but whatever) towards WCF
    function getProductList(page) {
        $.ajax({
            type: "GET",                        // GET or POST or PUT or DELETE verb
            url: "Service.svc/GetProductList",  // Remote function call for the service
            data: '{"page":' + page + '}',      // Data sent to server
            contentType: "application/json; charset=utf-8", // Content type is JSON
            dataType: "json",                   // Expected data format from server
            processdata: true,                  // True or False
            success: function (msg) {           // Callback for successful ajax call
                onProductListSuccess(msg);
            },
            error: function () {                // Callback if ajax fails
                alert("Error loading products" + result.status + " " + result.statusText);
            }
        });
    }


    // Callback if the service call succeeds
    function onProductListSuccess(result) {
        var itemList = document.getElementById("item-div");
        var sidebar = document.getElementById("side-bar-div");
        var rowDiv;
        var itemsPerRow = 4;

        for (var i = 0; i < Math.min(result.length, 12); i++) {

            // Attempt JSON parse, equivalent to eval
            try {
                var item = JSON.parse(result[i]);;
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

            // In the end, just append what we have as itemDiv to the current rowDiv
            $(rowDiv).append(itemDiv);

            // This is the details row div, theres a total of n = itemsPerPage of them, all hidden
            var detailsDiv = document.createElement("div");
            $(detailsDiv).attr("class", "row-fluid");

            // This is the content of details div, a single box atm, with a shadow inset
            var detailsContent = document.createElement("div");
            $(detailsContent).attr("id", "details-content-" + (i + 1));
            $(detailsContent).attr("class", "col-lg-12 details-div");

            // This is the image of the div
            var detailsImage = document.createElement("img");
            $(detailsImage).attr("class", "details-div-image center-vert");
            $(detailsImage).attr("src", "res/images/" + item.imageUrl);

            // This is green div that will hold the data
            var detailsDataDiv = document.createElement("div");
            $(detailsDataDiv).attr("class", "details-data-div");
            
            var detailsTitle = document.createElement("div");
            $(detailsTitle).attr("class", "details-div-title");
            $(detailsTitle).append(item.name);
            
            var attributesDiv = document.createElement("div");
            $(attributesDiv).attr("class", "details-attr-div");
            
            var valuesDiv = document.createElement("div");
            $(valuesDiv).attr("class", "details-vals-div");


            $(detailsDataDiv).append(detailsTitle);

            $(detailsContent).append(detailsImage);
            $(detailsContent).append(detailsDataDiv);
            //$(detailsContent).append(detailsTitle);

            $(detailsDiv).append(detailsContent);
            $(itemList).append(detailsDiv);

            



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

            

            //$()

            //$(productList).append(productItem);
            //var productItem = document.createElement("li");

            //$(productItem).attr("id", i + 1);
            ////$(productItem).html(product.name);

            //var productImage = document.createElement("img");
            //$(productImage).attr("src", "product_img/" + product.imageURL);
            //$(productImage).attr("class", "items");
            //$(productImage).attr("height", 100);
            //$(productImage).attr("alt", "");


            //var productBr = document.createElement("br");
            //$(productBr).attr("clear", "all");

            //var productDiv = document.createElement("div");
            //$(productDiv).html(product.name);
            //$(productDiv).attr("id", product._id);

            //$(productItem).append(productImage);
            //$(productItem).append(productBr);
            //$(productItem).append(productDiv);

            //var detailView = document.createElement("div");
            //$(detailView).attr("class", "detail-view");
            //$(detailView).attr("id", "detail-" + (i + 1).toString());


            //var closeX = document.createElement("div");
            //$(closeX).attr("class", "close");
            //$(closeX).attr("align", "right");

            //var closeXA = document.createElement("a");
            //$(closeXA).html("x");
            //$(closeXA).attr("href", "javascript:void(0)");
            //$(closeX).append(closeXA);

            //var productImage = document.createElement("img");
            //$(productImage).attr("src", "product_img/" + product.imageURL);
            //$(productImage).attr("class", "detail_images");
            //$(productImage).attr("width", 340);
            //$(productImage).attr("height", 310);
            //$(productImage).attr("alt", "");

            //var detailInfo = document.createElement("div");
            //$(detailInfo).attr("class", "detail_info");

            //var itemName = document.createElement("label");
            //$(itemName).attr("class", "item_name");
            //$(itemName).html(product.name);

            //var productBr = document.createElement("br");
            //$(productBr).attr("clear", "all");

            //var desc = "";
            //for (var j = 0; j < product.tags.length - 1; j++) {
            //    desc = desc + product.tags[j] + ", ";
            //}
            //desc = desc + product.tags[product.tags.length - 1];


            //var productDesc = document.createElement("p");
            //$(productDesc).html(desc);

            //var productBr1 = document.createElement("br");
            //$(productBr1).attr("clear", "all");

            //var productBr2 = document.createElement("br");
            //$(productBr2).attr("clear", "all");

            //var productSpan = document.createElement("span");
            //$(productSpan).attr("class", "price");
            //$(productSpan).html(product.price);

            //$(productDesc).append(productBr1);
            //$(productDesc).append(productBr2);
            //$(productDesc).append(productSpan);

            //var productBr3 = document.createElement("br");
            //$(productBr3).attr("clear", "all");

            //var productButton = document.createElement("button");
            //$(productButton).attr("class", "add-to-cart-button");
            //$(productButton).html("Add to Cart");

            //$(detailInfo).append(itemName);
            //$(detailInfo).append(productBr);
            //$(detailInfo).append(productDesc);
            //$(detailInfo).append(productBr3);
            //$(detailInfo).append(productButton);

            //$(detailView).append(closeX);
            //$(detailView).append(productImage);
            //$(detailView).append(detailInfo);

            ////$(detailView).insertAfter(target);


            ////adding products to list
            //if ((i % 4) == 0) {
            //    $(productList).append(productItem);
            //    $(productList).append(detailView);
            //}
            //else {
            //    $(productItem).insertAfter(prevProductItem);
            //    $(detailView).insertAfter(prevDetailView);
            //}
            //prevProductItem = $(productItem);
            //prevDetailView = $(detailView);

        }

        $(".item-div").click(function (event) {
            onItemClick($(this), event);
        });

        $(".add-to-cart-button").click(function () {
            OnAddToCart($(this));
        });

        $(".close a").click(function () {
            $('#wrap .detail-view').slideUp('slow');
        });
    }

    
    // Initialization callback
    var documentInit = function () {

        // Array to hold cart item values
        Arrays = new Array();

        // Initiate ajax request to get the data from the server
        getProductList(0);

        // I'm not sure what this crap does, will check out later
        $('.remove').livequery('click', function () {
            var deduct = $(this).parent().children(".shopp-price").find('em').html();
            var prev_charges = $('.cart-total span').html();

            var thisID = $(this).parent().attr('id').replace('each-', '');

            var pos = getPos(Arrays, thisID);
            Arrays.splice(pos, 1, "0")

            prev_charges = parseInt(prev_charges) - parseInt(deduct);
            $('.cart-total span').html(prev_charges);
            $('#total-hidden-charges').val(prev_charges);
            $(this).parent().remove();

        });

        $('#Submit').livequery('click', function () {

            var totalCharge = $('#total-hidden-charges').val();

            $('#cart_wrapper').html('Total Charges: $' + totalCharge);

            return false;

            

        });

        //// event handler on closeCart button
        //$('.closeCart').click(function () {
        //    $('#cart_wrapper').slideup();
        //});

        // Event handler on "Show Cart" button
        $('#view-cart-button').click(function () {
            //$('#cart_wrapper').fadeToggle();
            $('#cart_wrapper').slideToggle({ duration: 300, easing: 'swing' });
            //$('#content-div').slideToggle({ duration: 700, easing: 'swing' });
        });
    }

    // Since the document is not instantly ready for manipulation, jQuery can detect that
    // and react accordingly with a user-provided callback in $(document).ready(--callback--)
    $(document).ready(documentInit);

    // Utility function that checks whether the object is in the array
    function include(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == obj) return true;
        }
    }

    // Utility function that returns the index of the object in the array
    function getPos(arr, obj) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] == obj) return i;
        }
    }

    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
})();

