
$(function() {

    function filter(searchVal) {
        if (searchVal) {
            $("#filter-warning").removeClass("d-none");
        } else {
            $("#filter-warning").addClass("d-none");
        }
        $("li.filterable").each(function() {
            if ($(this).text().toLowerCase().includes(searchVal)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    if (window.location.hash) {
        var hash = decodeURIComponent(window.location.hash.substr(1));
        $("#searchForm").val(hash);
        filter(hash);
    }

    $(window).bind('hashchange', function(e) {
        var hash = decodeURIComponent(window.location.hash.substr(1));
        $("#searchForm").val(hash);
        filter(hash);
    });
         
    $("#searchForm").bind("keyup change", function() {
        var searchVal = $(this).val().toLowerCase();
        window.location.hash = encodeURIComponent(searchVal);
        filter(searchVal);
    });

});