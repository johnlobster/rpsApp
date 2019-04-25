// Javascript app for rock paper scissors game
// John Webster


// wait until document is loaded
$(document).ready(function () {

// Initialize Firebase
// var config = {
//     apiKey: "AIzaSyCs3K5zwuOuS0odq89IpPLC7HnXTOcDqgI",
//     authDomain: "recent-user-with-all-use-e8e76.firebaseapp.com",
//     databaseURL: "https://recent-user-with-all-use-e8e76.firebaseio.com",
//     projectId: "recent-user-with-all-use-e8e76",
//     storageBucket: ""
// };
var config = {
    apiKey: "AIzaSyASaUqEw6TM_1v7LkG0iVZyDUI-WnTIUXg",
    authDomain: "scratchdatabase.firebaseapp.com",
    databaseURL: "https://scratchdatabase.firebaseio.com",
    projectId: "scratchdatabase",
    storageBucket: "scratchdatabase.appspot.com",
    messagingSenderId: "652319313164"
};
firebase.initializeApp(config);
var database = firebase.database();
var connectingRef = database.ref("/connecting");
var dataRef = database.ref("/data");
var userNumber = 0;
var result = "";
var opponentResult = "";


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
    console.log("Snapshot : " + snapshot.val().user1)
    if (!snapshot.child("user1").exists()) {
        console.log("check " + snapshot.child("user1").exists());
        // database not set up yet
        initializeDatabase();
        return;
    }

    // console.log("Connection: State=" + state + " 1=" + snapshot.val().user1 + " 2=" + snapshot.val().user2);
    if (state === "waitingForUser") {
        // if (!snapshot.child("user1")) {
        //     // database not set up yet
        //     initializeDatabase();
        // }
        if (snapshot.val().user1 === "") {
            // first to log on
            state = "waitingForPlayer2";
            connectingRef.update({user1:userName});
            userNumber = 1;
        } 
        else {
            // second to log on
            state= "waitingForStart";
            connectingRef.update({ user2: userName });
            userNumber = 2;
        }
        
    }
    else if ( state==="waitingForPlayer2") {
        if ( ! snapshot.val().user2 === "") {
            state = "waitingForStart";
            opponentName = snapshot.val().user2;
            // update on screen
            $("#OpponentNameSpan").text(opponentName);
            userNumber = 2;
        }
    }
    else if ( state==="waitingForStart") {
        if( snapshot.val().start === "true") {
            state = "playing";
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
        // no input is a loss
        if (( rpsSelect === "") && (opponentRpsSelect === "")) {
            // no winner
            result = "draw";
            opponentResult = "draw";
        }
        else if (rpsSelect === ""){ 
            result = "loss";
            opponentResult = "win";
        }
        else if (OpponentRpsSelect === "") {
            result = "win";
            opponentResult = "loss";
        }
        // main decision logic
        if ( rpsSelect === "rock") {
            if ( opponentRpsSelect === "paper") {
                result = "loss";
                opponentResult = "win";
            }
            else if ( opponentRpsSelect === "scissors" ) {
                result = "win";
                opponentResult = "loss";
            }
            else {
                result = "draw";
                opponentResult = "draw";
            }
        } 
        else if (rpsSelect === "paper") {
            if (opponentRpsSelect === "scissors") {
                result = "loss";
                opponentResult = "win";
            }
            else if (opponentRpsSelect === "rock") {
                result = "win";
                opponentResult = "loss";
            }
            else {
                result = "draw";
                opponentResult = "draw";
            }
        }
        else if (rpsSelect === "scissors") {
            if (opponentRpsSelect === "rock") {
                result = "loss";
                opponentResult = "win";
            }
            else if (opponentRpsSelect === "paper") {
                result = "win";
                opponentResult = "loss";
            }
            else {
                result = "draw";
                opponentResult = "draw";
            }
        }
        // show results
        // reset values
        rpsSelect="";
        opponentRpsSelect = "";
        result = "";
        opponentResult = "";
        // reset values in database
        dataRef.set({
            rpsSelectUser1: "",
            rpsSelectUser2: ""
        });
        // set state back to waitingForStart so another game can be played
        state="waitingForStart";
    }, 20000);

}
// Body starts here


// listener on form submit - user types in name
$("#loginButton").on("click", function (event) {
    event.preventDefault(); // form submit so don't post
    userName = $("#loginBox").val().trim();
    if ( userName === "") {
        // invalid input
        $("#statusSpan").text("no user name inputted");

    }
    else {
    
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
    }
});

// listener on start button
$("#startButton").on("click", function() {
    if ( state === "waitingForStart") {
        state="playing";
        // let the other player know it started
        connectingRef.set({ start: "true" });
        gamePlay();
    }
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
    // console.log(rpsSelect);
});
    
// listener on database to find opponents selected value
dataRef.on("value", function (snapshot) {
    if (!snapshot.child("rpsSelectUser1").exists()) {
        // database not set up yet
        console.log("data : init database");
        initializeDatabase();
        return;
    }
    if ( userNumber === 1) {
        opponentRpsSelect = snapshot.val().rpsSelectUser2;
    }
    else {
        opponentRpsSelect = snapshot.val().rpsSelectUser2;
    }
    
}, function (errorObject) {
    console.log("Reading opponent data failed: " + errorObject.code);
});

}); // end document ready
    