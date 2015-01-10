"use strict";
// This idiom in JavaScript is known as IIFE (Immediately-invoked Function Expression)
// It prevents pollution of global namespace by placing everything in an anonymous function and evaluates it immediately
(function () {
    var itemsPerPage = 12;
    var totalPages = 0;
    var currentPage = 1;
    var activePageId = 1;
    var paginationArray = [1, 2, 3];
    var currentOpenedBox = -1;
    var jsonCart = [];
    var jsonCartQty = [];
    var jsonCache = [];
    var totalPrice = 0;
    var hasCheckedOut = false;
    var modalFooter = null;
    var minFilterChain = [];
    var catFilterChain = [];
    var dataCount = 0;
    var minPriceFilter = 0;
    var maxPriceFilter = 0;

    function resetFilters() {
        minFilterChain = [];
        catFilterChain = [];
        minPriceFilter = 0;
        maxPriceFilter = 0;

        $(".filter-div").hide();
        $(".cat-filter-div").children("span").fadeOut();
    }

    // Pretty print regex for numbers which adds commas after every third digit
    function numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function capitaliseFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
            return obj.power + " W";
    }

    function addToFilters(filterChain, filter)
    {
        filterChain.push(filter);
    }

    function removeFromFilters(filterChain, filter)
    {
        var index = filterChain.indexOf(filter);

        if (index !== -1)
            filterChain.splice(index, 1);
    }

    function flattenFilter(filterChain)
    {
        var i, result = "";
        for (i = 0; i < filterChain.length; i++)
            result = result + filterChain[i] + '|';

        return result.slice(0, -1);
    }

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
            closeActiveDetailsView();
            
            $("#details-content-" + num).slideDown("fast");
            currentOpenedBox = num;
        }
    }

    function closeActiveDetailsView() {
        if (currentOpenedBox !== -1)
        {
            $("#details-content-" + currentOpenedBox).slideUp("fast");
            currentOpenedBox = -1;
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

        if (index < jsonCart.length)
        {
            totalPrice -= jsonCart[index].price * jsonCartQty[index];
            jsonCart.splice(index, 1);
            jsonCartQty.splice(index, 1);
        }
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

    // Builds the view for a single item, with a given JSO, index and itemsPerRow
    function buildItemView(item, index, itemsPerRow) {
        var itemDiv = document.createElement("div");
        $(itemDiv).attr("value", (index + 1));
        $(itemDiv).attr("id", "item-" + (index + 1));
        $(itemDiv).attr("class", "col-xs-" + (12 / itemsPerRow) + " item-div");

        // This is the rectangle behind title, the red one at the moment
        var itemTitleDiv = document.createElement("div");
        $(itemTitleDiv).attr("class", "item-title-div drops-shadow var-bd-div");
        $(itemTitleDiv).append(item.name);

        // This is the image of the item, fixed to 150x150
        var itemImage = document.createElement("img");
        $(itemImage).attr("src", "res/images/" + item.imageUrl);
        $(itemImage).addClass("use-backup");

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

    // Builds the view for a single item, with a given JSO and index
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
        $(detailsImage).attr("src", "res/images/" + item.imageUrl);
        $(detailsImage).attr("class", "img-responsive col-xs-4");
        $(detailsImage).addClass("use-backup");

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
        $(brandImg).attr("src", "res/logos/" + item.brandLogoUrl);
        $(brandImg).attr("class", "col-xs-offset-1 col-xs-4");
        $(brandImg).addClass("use-backup");

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
            error: function (result) {                // Callback if ajax fails
                alert("Error loading products" + result.status + " " + result.statusText);
            }
        });
    }

    // Callback if the service call succeeds
    function onProductListSuccess(result) {
        var itemList = document.getElementById("item-content-div");
        var rowDiv;
        var itemsPerRow = 4;
        currentOpenedBox = -1;

        $(itemList).empty();
        jsonCache = [];

        for (var i = 0; i < result.length; i++) {
            // Attempt JSON parse, equivalent to eval
            try {
                var item = JSON.parse(result[i]);;
                jsonCache.push(item);
            }
            catch (exception)
            {
                alert("JSON Parsing exception!");
                continue;
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
        
        $(".item-div").click(function (event) {
            onItemClick($(this), event);
        });

        $(".btn-add-to-cart").click(function (event) {
            onAddToCartClick($(this), event);
        });

        $(".use-backup").error(function () {
            $(this).attr('src', "res/unknown.png");
        });
    }
    
    // Handler for the filter checkbox clicks
    function onFilterClicked(target) {
        var filter = target.attr("value");
        
        if (target.is(":checked"))
            addToFilters(minFilterChain, filter);
        else if (target.is(":not(:checked)"))
            removeFromFilters(minFilterChain, filter);

        ajaxDataCount();
    }

    function onCatFilterClicked(target) {
        var targetId = target.attr("id");
        var divToChangeId = targetId.toString().slice(0, -4);
        var divToChange = $("#" + divToChangeId);
        divToChange.toggle("slow", function () {
            var filterFromTarget = target.attr("value");
            if (divToChange.is(":visible"))
            {
                addToFilters(catFilterChain, filterFromTarget);
            }
            else
            {
                removeFromFilters(catFilterChain, filterFromTarget);
            }

            ajaxDataCount();
        });

        var span = target.children("span");
        $(span).fadeToggle("slow");
    }

    function onPriceFilterClicked(target) {
        var targetId = target.attr("id");
        var divToChangeId = targetId.toString().slice(0, -4);
        var divToChange = $("#" + divToChangeId);
        divToChange.slideToggle("slow", function () {
            var filterFromTarget = target.attr("value");
            if (divToChange.is(":not(:visible)"))
            {
                minPriceFilter = 0;
                maxPriceFilter = 0;
                $("#min-price").val("");
                $("#max-price").val("");
            }

            ajaxDataCount();
        });

        var span = target.children("span");
        $(span).fadeToggle("slow");
    }

    function ajaxDataCount() {
        var data = {
            categories: flattenFilter(catFilterChain),
            filters: flattenFilter(minFilterChain),
            minPrice: minPriceFilter,
            maxPrice: maxPriceFilter
        };

        ajaxService("GET", data, "GetDataCount", onDataCountSuccess);
    }

    function onDataCountSuccess(msg) {
        dataCount = msg;

        totalPages = Math.ceil(dataCount / itemsPerPage);
        currentPage = 1;
        activePageId = 1;

        resetPagination();
        adjustPaginationHeader();
        
        ajaxFilterSearch();
    }

    function ajaxFilterSearch() {
        var data = {
            page: currentPage,
            categories: flattenFilter(catFilterChain),
            filters: flattenFilter(minFilterChain),
            minPrice: minPriceFilter,
            maxPrice: maxPriceFilter
        };
        ajaxService("GET", data, "GetFilteredItems", onProductListSuccess);
    }

    function onPageClicked(target) {
        var parent = target.parent();
        if (parent.hasClass("disabled")) return;

        var targetId = target.attr("id");
        var targetPos = targetId[targetId.length - 1];
        var targetPage = target.text();

        currentPage = targetPage;
        ajaxFilterSearch();

        if (targetPos == 1)
        {
            var pagesToLeft = targetPage - 1;
            if (pagesToLeft > 0) {
                decrementPaginationView();
            }
        }
        else if (targetPos == 3)
        {
            var pagesToRight = totalPages - targetPage;
            if (pagesToRight > 0) {
                incrementPaginationView();
            }
        }

        for (var i = 0; i < 3; i++)
        {
            var currPage = $("#page-" + (i + 1));
            var newTargetPage = currPage.text();
            currPage.attr("style", "");
            if (newTargetPage == currentPage)
            {
                activePageId = i + 1;
                currPage.attr("style", "color: white; background: #990000;");
            }
        }

        adjustPaginationHeader();
    }

    function incrementPaginationView() {
        for (var i = 0; i < 3; i++) {
            paginationArray[i]++;
            $("#page-" + (i + 1)).empty().append(paginationArray[i]);
        }
    }

    function decrementPaginationView() {
        for (var i = 0; i < 3; i++) {
            paginationArray[i]--;
            $("#page-" + (i + 1)).empty().append(paginationArray[i]);
        }
    }

    function onPriceSearchClicked() {
        minPriceFilter = parseFloat($("#min-price").val());
        maxPriceFilter = parseFloat($("#max-price").val());

        ajaxDataCount();
    }

    function resetPagination() {
        for (var i = 0; i < 3; i++) {
            paginationArray[i] = i + 1;
            var pageEntry = $("#page-" + (i + 1));
            pageEntry.empty().append(paginationArray[i]);
            pageEntry.attr("style", "");
            var parentLi = pageEntry.parent();
            $(parentLi).removeClass("disabled");
            if ((i + 1) > totalPages)
            {
                $(parentLi).addClass("disabled");
            } 
        }

        $("#page-1").attr("style", "color: white; background: #990000;");
    }

    function adjustPaginationHeader() {
        $("#page-counter").empty().append("Current page: " + currentPage + " of " + totalPages);
        $("#data-counter").empty().append("Displaying results: " + ((currentPage - 1) * itemsPerPage + 1) +
            "-" + Math.min(currentPage * itemsPerPage, dataCount) + " of " + dataCount);
    }

    function ajaxDistinctValues(prop, cat) {
        var data = { property: prop, category: cat };
        ajaxService("GET", data, "GetDistinctValues", onDistinctValuesSuccess);
    }

    function onDistinctValuesSuccess(msg) {
        var targetDiv = $("#" + msg[0] + "-" + msg[1] + "-filter");
        targetDiv.empty().append('<label class="filter-label">' + capitaliseFirstLetter(msg[1]) + '</label>');
        var header = msg[0] + '-' + msg[1];
        for (var i = 2; i < msg.length; i++)
        {
            var checkboxDiv = document.createElement("div");
            var checkboxLabel = document.createElement("label");
            var checkboxInput = document.createElement("input");

            $(checkboxInput).attr("type", "checkbox");
            $(checkboxInput).attr("value", header + '-' + msg[i]);

            $(checkboxLabel).append(checkboxInput);
            $(checkboxLabel).append(msg[i]);

            $(checkboxDiv).attr("class", "checkbox");
            $(checkboxDiv).append(checkboxLabel);

            targetDiv.append(checkboxDiv);

            $(checkboxInput).click(function () {
                onFilterClicked($(this));
            });
        }
    }

    function ajaxPropertyRange(prop) {
        var data = { property: prop };
        ajaxService("GET", data, "GetPropertyRange", onPropertyRangeSuccess);
    }

    function onPropertyRangeSuccess(msg) {
        $("#min-price-label").empty().append("Min Price ($ " + numberWithCommas(msg[0].toFixed(2)) + ")");
        $("#max-price-label").empty().append("Max Price ($ " + numberWithCommas(msg[1].toFixed(2)) + ")");
    }

    function sideBarSetup() {
        resetFilters();
        ajaxDistinctValues("type", "guitar");
        ajaxDistinctValues("brand", "guitar");
        ajaxDistinctValues("type", "amp");
        ajaxDistinctValues("brand", "amp");
        ajaxDistinctValues("type", "pedal");
        ajaxDistinctValues("brand", "pedal");
        ajaxPropertyRange("price");
    }

    var documentInit = function () {
        // First of all, get the total data count
        // Another ajax inside will grab the actual data
        sideBarSetup();
        ajaxDataCount();

        $("#price-search-button").click(function () {
            onPriceSearchClicked($(this));
        });

        for (var i = 1; i < 4; i++) {
            $('#page-' + i).click(function () {
                onPageClicked($(this));
            });
        }

        $(".cat-filter").click(function () {
            onCatFilterClicked($(this));
        });

        $("#price-filter-div").click(function () {
            onPriceFilterClicked($(this));
        })

        $(".filter-div").hide();

        // Checkout event handling setup
        $("#total-price").append("$ " + totalPrice.toFixed(2));

        $("#checkout-button").prop('disabled', true);
        $("#checkout-button").click(function () {
            onCheckOutClick($(this));
        });

        $("#site-logo").click(function () {
            $('.cat-filter-div').animate({ backgroundColor: '#000099' });
            $('#header-div').animate({ backgroundColor: '#000099' });
            $('.admin-tool').toggle("slow");
            $('.var-bd-div').animate({ backgroundColor: '#000099'});
        });

        // Handle left arrow in pagination
        $("#prev-page").click(function () {
            if (currentPage <= 1)
                return;

            $("#page-" + activePageId).attr("style", "");

            currentPage--;
            if (activePageId > 1) {
                activePageId--;
                $("#page-" + activePageId).attr("style", "color: white; background: #990000;");
            }
            else
            {
                decrementPaginationView();
                $("#page-1").attr("style", "color: white; background: #990000;");
            }

            ajaxFilterSearch();
            adjustPaginationHeader();
        })

        // Handle right arrow in pagination
        $("#next-page").click(function () {
            if (currentPage >= totalPages)
                return;

            $("#page-" + activePageId).attr("style", "");

            currentPage++;
            if (activePageId < 3) {
                activePageId++;
                $("#page-" + activePageId).attr("style", "color: white; background: #990000;");
            }
            else
            {
                incrementPaginationView();
                $("#page-3").attr("style", "color: white; background: #990000;");
            }

            ajaxFilterSearch();
            adjustPaginationHeader();
        })

        setupAddModal();
        $("#remove-modal-button").click(function () {
            setupRemoveModal();
        });
        

        $("#btnSearch").click(function () {
            alert($('.btn-select').text() + ", " + $('.btn-select2').text());
        });
    }

    function setupAddModal() {
        $(".dropdown-menu li a").click(function () {
            var selText = $(this).text();
            var comboBox = $(this).parents('.dropdown').find('.dropdown-toggle');
            comboBox.empty().append(selText + ' <span class="caret"></span>');
            comboBox.attr("value", $(this).attr("value"));

            if (selText === "Guitar")
            {
                $("#extra-form-group").show("fast");
                $("#extra-attrib-label").empty().append("Strings");
            }
            else if (selText === "Amplifier")
            {
                $("#extra-form-group").show("fast");
                $("#extra-attrib-label").empty().append("Power");
            }
            else
            {
                $("#extra-form-group").hide("fast");
            }
        });

        $("#add-button").click(function () {
            var item = {};
            item.category = $("#drop-down-cat").attr("value");
            item.name = $("#name-input").val();
            item.type = $("#type-input").val();
            item.brand = $("#brand-input").val();
            item.year = parseFloat($("#year-input").val());
            item.price = parseFloat($("#price-input").val());

            if (!(item.category === "pedal"))
                item.extra = parseFloat($("#extra-input").val());

            item.tags = $("#tags-input").val();
            item.imageUrl = $("#image-url-input").val();
            item.brandLogoUrl = $("#brand-url-input").val();

            ajaxService("GET", item, "AddItem", onAdditionSuccess);
        });
    }

    function onAdditionSuccess(msg) {
        // Refresh the page with newly added item
        sideBarSetup();
        ajaxDataCount();
    }

    function setupRemoveModal() {
        ajaxService("GET", { page: 0 }, "GetProductList", onRemoveModalSuccess);
    }

    function onRemoveModalSuccess(items) {
        $("#modal-remove-body").empty();
        var fragment = document.createDocumentFragment();
        for (var i = 0; i < items.length; i++) {
            // Attempt JSON parse, equivalent to eval
            try {
                var item = JSON.parse(items[i]);;
            }
            catch (exception) {
                alert("JSON Parsing exception!");
                continue;
            }

            var itemRow = document.createElement("div");
            var idColumn = document.createElement("div");
            var nameColumn = document.createElement("div");
            var removeBtnColumn = document.createElement("div");

            $(itemRow).attr("class", "row");
            $(idColumn).attr("class", "col-xs-4");
            $(nameColumn).attr("class", "col-xs-6");
            $(removeBtnColumn).attr("class", "col-xs-2");

            $(idColumn).append(item._id);
            $(nameColumn).append(item.name);

            var removeBtn = document.createElement("button");
            $(removeBtn).attr("value", item._id);
            $(removeBtn).attr("class", "btn btn-block btn-skin remove-item-btn");
            $(removeBtn).append("Delete");
            $(removeBtnColumn).append(removeBtn);

            $(itemRow).append(idColumn);
            $(itemRow).append(nameColumn);
            $(itemRow).append(removeBtnColumn);

            fragment.appendChild(itemRow);
        }

        var modalRemove = document.getElementById("modal-remove-body");
        modalRemove.appendChild(fragment);

        $(".remove-item-btn").click(function () {
            var theButton = $(this);
            var itemId = theButton.attr("value");
            var rowParent = theButton.parents(".row");

            ajaxService("GET", { id: itemId }, "RemoveItem", onRemoveItemSuccess);
            rowParent.remove();
        });
    }

    function onRemoveItemSuccess(itemId) {
        removeFromCart(itemId);
        $("#cart-row-" + itemId).remove();
        $("#total-price").empty().append("$ " + numberWithCommas(totalPrice.toFixed(2)));

        sideBarSetup();
        ajaxDataCount();
    }

    // Since the document is not instantly ready for manipulation, jQuery can detect that
    // and react accordingly with a user-provided callback in $(document).ready(--callback--)
    $(document).ready(documentInit);
})();
