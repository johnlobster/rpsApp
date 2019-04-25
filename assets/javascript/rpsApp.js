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
var database = firebase.database();
var connectingRef = database.ref("/connecting");
var dataRef = database.ref("/data");
var userNumber = 0;


// Globals

var state = "waitingForUser";
var rpsSelect = ""; // rock,paper,scissors
var opponentRpsSelect = "";
var userName = "";
var opponentName = "";
var gamesWon = 0;
var gamesLost = 0;
var localTimeout;

// Functions

// initialise database if it hasn't already been set up

function initializeDatabase () {
    connectingRef.set( {
        user1: "",
        user2: "",
        start: ""
    });
    dataRef.set({
        rpsSelectUser1: "",
        rpsSelectUser2: ""
    });
    console.log( "Database initialized");
}

// connection listener abstracted as a function
function connectionListener(snapshot) {
    console.log("Connection: State=" + state);
    if (!snapshot.child("user1")) {
        // database not set up yet
        initializeDatabase();
        return;
    }

    // console.log("Connection: State=" + state + " 1=" + snapshot.val().user1 + " 2=" + snapshot.val().user2);
    if (state === "waitingForUser") {
        if (!snapshot.child("user1")) {
            // database not set up yet
            initializeDatabase();
        }
        if (snapshot.child("user1") === "") {
            // first to log on
            state = "waitingForPlayer2";
            connectingRef.set({user1:userName});
            userNumber = 1;
        } 
        else {
            // second to log on
            state= "waitingForStart";
            connectingRef.set({ user2: userName });
            userNumber = 2;
        }
        
    }
    else if ( state==="waitingForPlayer2") {
        if ( ! snapshot.child("user2") === "") {
            state = "waitingForStart";
            opponentName = snapshot.val().user2;
            // update on screen
            $("#OpponentNameSpan").text(userName);
            connectedRef.set({ user2: userName });
            userNumber = 2;
        }
    }
    else if ( state==="waitingForStart") {
        state = "playing";
        if( snapshot.val().start === "true") {
            gamePlay();
        }
        
    }
    // if any other state, do nothing
    // console.log("Connection: State=" + state + " 1=" + snapshot.val().user1 + " 2=" + snapshot.val().user2 );
}

// function to deal with timeout of main part of game
function gamePlay() {
    localTimeout = setTimeout(function () {
        // work out who won
        if ( rpsSelectUser1 === "rock") {

        }
        // show results
        // reset values
        rpsSelect="";
        opponentRpsSelect = "";
    }, 20000);

}
// Body starts here


// listener on form submit - user types in name
$("#loginButton").on("click", function (event) {
    event.preventDefault(); // form submit so don't post
    userName = $("#loginBox").val().trim();
    
    // clear input box
    $("#loginBox").val("");
    // update name on screen
    $("#nameSpan").text( userName);
    // set up listener on connect database
    connectingRef.on("value", function (snapshot) {
        connectionListener(snapshot);
        
    }, function (errorObject) {
        console.log("Connecting read failed: " + errorObject.code);
    });
});

// listener on start button
$("#startButton").on("click", function() {
    state="playing";
    // let the other player know it started
    connectingRef.set({ start: "true" });
    gamePlay();
});



// listener on rps buttons, put it in a variable, will use value when timeout
$(".rpsButton").on("click", function() {
    rpsSelect = $(this).attr("data-value");
    // send to database so other user can pick it up
    if ( userNumber === 1) {
        dataRef.set({rpsSelectUser1: rpsSelect});
    }
    else {
        dataRef.set({ rpsSelectUser2: rpsSelect });
    }
    console.log(rpsSelect);
});
    



}); // end document ready
    