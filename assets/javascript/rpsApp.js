// Javascript app for rock paper scissors game
// John Webster


// wait until document is loaded
$(document).ready(function () {

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCs3K5zwuOuS0odq89IpPLC7HnXTOcDqgI",
    authDomain: "recent-user-with-all-use-e8e76.firebaseapp.com",
    databaseURL: "https://recent-user-with-all-use-e8e76.firebaseio.com",
    projectId: "recent-user-with-all-use-e8e76",
    storageBucket: ""
};

firebase.initializeApp(config);
var dataRef = firebase.database();


// Globals

var state = "waitingForUser";
var rpsSelect = ""; // rock,paper,scissors


// Functions

// Body starts here

// initialise database if it hasn't already been set up

// listener on form submit


}); // end document ready
    