var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

// From http://stackoverflow.com/a/21903119
var getUrlParameter = function(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var formatLength = function(seconds) {
    var time = Math.floor(Number(seconds));
    var minutesTotal = Math.floor(time / 60);
    var seconds = time - minutesTotal * 60;
    var minutes = minutesTotal % 60
    var hours = Math.floor(time / 3600);

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (hours == 0) {
        return minutes + ":" + seconds;
    } else {
        return hours + ":" + minutes + ":" + seconds;
    }
}

var formatDate = function(dateString) {
    var date = new Date(dateString);

    return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}
