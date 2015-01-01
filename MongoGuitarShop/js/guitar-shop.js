(function () {
    // this is for 2nd row's li offset from top. It means how much offset you want to give them with animation
    var single_li_offset;
    var current_opened_box;
    var Arrays;

    function OnProductClick(target, e) {

        var thisID = target.attr('id');
        //var $this = $(this);

        var id = $('#wrap li').index(target);

        if (current_opened_box == id) // if user click a opened box li again you close the box and return back
        {
            $("#wrap .detail-view").slideUp("slow");
            current_opened_box = -1;
            return false;
        }
        $("#cart_wrapper").slideUp("slow");
        $("#wrap .detail-view").slideUp("slow");

        // save this id. so if user click a opened box li again you close the box.
        current_opened_box = id;

        var targetOffset = 0;

        // below conditions assumes that there are four li in one row and total rows are 4. How ever if you want to increase the rows you have to increase else-if conditions and if you want to increase li in one row, then you have to increment all value below. (if(id<=3)), if(id<=7) etc

        if (id <= 3)
            targetOffset = 0;
        else if (id <= 7)
            targetOffset = single_li_offset;
        else if (id <= 11)
            targetOffset = single_li_offset * 2;
        else if (id <= 15)
            targetOffset = single_li_offset * 3;
        else if ((id <= 19))
            targetOffset = single_li_offset * 4;

        $("html:not(:animated),body:not(:animated)").animate({ scrollTop: targetOffset }, 800, function () {

            $('#wrap #detail-' + thisID).slideDown(500);
            return false;
        });
    }

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



    //Funkcija koja pozivu GetProductList metodu WCF servisa
    function getProductList(page) {
        $.ajax({
                    type: "GET", //GET or POST or PUT or DELETE verb
                    url: "Service.svc/GetProductList", // Location of the service
                    data: '{"page":' + page + '}', //Data sent to server
                    contentType: "application/json; charset=utf-8", // content type sent to server
                    dataType: "json", //Expected data format from server
                    processdata: true, //True or False
                    success: function (msg) //On Successfull service call
                    {
                        getProductListSucceeded(msg);
                    },
                    error: function () // When Service call fails
                    {
                        alert("Error loading products" + result.status + " " + result.statusText);
                    }
               });
    }


    // Callback if the service call succeeds
    function getProductListSucceeded(result) {
        var productList = document.createElement("ul");
        var prevProductItem;
        var prevDetailView;

        for (var i = 0; i < result.length; i++) {
            try {
                var product = eval('(' + result[i] + ')');
            }
            catch (exception) {
                return;
            }

            var productItem = document.createElement("li");

            $(productItem).attr("id", i + 1);
            //$(productItem).html(product.name);

            var productImage = document.createElement("img");
            $(productImage).attr("src", "product_img/" + product.imageURL);
            $(productImage).attr("class", "items");
            $(productImage).attr("height", 100);
            $(productImage).attr("alt", "");


            var productBr = document.createElement("br");
            $(productBr).attr("clear", "all");

            var productDiv = document.createElement("div");
            $(productDiv).html(product.name);
            $(productDiv).attr("id", product._id);

            $(productItem).append(productImage);
            $(productItem).append(productBr);
            $(productItem).append(productDiv);

            var detailView = document.createElement("div");
            $(detailView).attr("class", "detail-view");
            $(detailView).attr("id", "detail-" + (i + 1).toString());


            var closeX = document.createElement("div");
            $(closeX).attr("class", "close");
            $(closeX).attr("align", "right");

            var closeXA = document.createElement("a");
            $(closeXA).html("x");
            $(closeXA).attr("href", "javascript:void(0)");
            $(closeX).append(closeXA);

            var productImage = document.createElement("img");
            $(productImage).attr("src", "product_img/" + product.imageURL);
            $(productImage).attr("class", "detail_images");
            $(productImage).attr("width", 340);
            $(productImage).attr("height", 310);
            $(productImage).attr("alt", "");

            var detailInfo = document.createElement("div");
            $(detailInfo).attr("class", "detail_info");

            var itemName = document.createElement("label");
            $(itemName).attr("class", "item_name");
            $(itemName).html(product.name);

            var productBr = document.createElement("br");
            $(productBr).attr("clear", "all");

            var desc = "";
            for (var j = 0; j < product.tags.length - 1; j++) {
                desc = desc + product.tags[j] + ", ";
            }
            desc = desc + product.tags[product.tags.length - 1];


            var productDesc = document.createElement("p");
            $(productDesc).html(desc);

            var productBr1 = document.createElement("br");
            $(productBr1).attr("clear", "all");

            var productBr2 = document.createElement("br");
            $(productBr2).attr("clear", "all");

            var productSpan = document.createElement("span");
            $(productSpan).attr("class", "price");
            $(productSpan).html(product.price);

            $(productDesc).append(productBr1);
            $(productDesc).append(productBr2);
            $(productDesc).append(productSpan);

            var productBr3 = document.createElement("br");
            $(productBr3).attr("clear", "all");

            var productButton = document.createElement("button");
            $(productButton).attr("class", "add-to-cart-button");
            $(productButton).html("Add to Cart");

            $(detailInfo).append(itemName);
            $(detailInfo).append(productBr);
            $(detailInfo).append(productDesc);
            $(detailInfo).append(productBr3);
            $(detailInfo).append(productButton);

            $(detailView).append(closeX);
            $(detailView).append(productImage);
            $(detailView).append(detailInfo);

            //$(detailView).insertAfter(target);


            //adding products to list
            if ((i % 4) == 0) {
                $(productList).append(productItem);
                $(productList).append(detailView);
            }
            else {
                $(productItem).insertAfter(prevProductItem);
                $(detailView).insertAfter(prevDetailView);
            }
            prevProductItem = $(productItem);
            prevDetailView = $(detailView);

        }

        jQuery("#wrapul").append(productList);


        $("#wrap li").click(function (e) {
            OnProductClick($(this), e);
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

        // this is for 2nd row's li offset from top. It means how much offset you want to give them with animation
        // ???????????
        single_li_offset = 200;//1000; //200;

        // Okay, no items are being viewed initially
        current_opened_box = -1;

        // Array to hold something ???
        Arrays = new Array();

        // Initiate ajax request to get the data from the server
        getProductList(0);

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

        $('.closeCart').click(function () {

            $('#cart_wrapper').slideUp();

        });

        $('#show_cart').click(function () {

            $('#cart_wrapper').slideToggle('slow');

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
})();

