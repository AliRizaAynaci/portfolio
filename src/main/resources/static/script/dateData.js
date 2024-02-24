// Sample date data
var dateData = "2024-02-23T03:47:05.488752";

// Convert to JavaScript Date object
var date = new Date(dateData);

// Convert date to the desired format (e.g., 23 February 2024 03:47:05)
var readableDate = date.getDate() + ' ' +
    monthName(date.getMonth()) + ' ' +
    date.getFullYear() + ' ' +
    padWithZero(date.getHours()) + ':' +
    padWithZero(date.getMinutes()) + ':' +
    padWithZero(date.getSeconds());

// Function to convert month index to month name
function monthName(monthIndex) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

// Function to pad single digits with zero
function padWithZero(num) {
    return (num < 10 ? '0' : '') + num;
}

// Add the result to HTML
document.getElementById('showDate').innerHTML = readableDate;
