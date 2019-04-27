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
var chatRef = database.ref("/chat");
var logoutRef = database.ref("/logout");



// Globals

var state = "waitingForUser"; // initial state
var rpsSelect = ""; // rock,paper,scissors
var opponentRpsSelect = "";
var userName = "";
var opponentName = "";
var gamesWon = 0;
var opponentGamesWon = 0;
var gamesLost = 0;
var gamesPlayed = 0;
var opponentGamesLost = 0;
var userNumber = 0;
var result = "";
var opponentResult = "";
var timeAllowed = 15; // in seconds
var progressBarTimer = 0;
var localInterval;
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
    chatRef.set({
        text: ""
    });
    logoutRef.set({
        text:""
    });
    console.log( "Database initialized");
}
// initializeDatabase();
function cleanDatabase() {
    chatRef.update({
        text: ""
    });
    connectingRef.update({
        user1: "",
        user2: "",
        start: ""
    });
    dataRef.update({
        rpsSelectUser1: "",
        rpsSelectUser2: ""
    });
    logoutRef.update({
        text: ""
    });
    $("#opponentNameSpan").text("The enemy");
    $("#nameSpan").text("You");
}

// change state as a function for ease of debug
function changeState ( newState) {
    console.log("Old state " + state + " new state " + newState);
    state = newState;
}

// turning chat on and off
function chatOn() {
    $("#chatBox").show();
    $("#chatForm").show();
    $("#loginDiv").hide();

}
function chatOff() {
    $("#chatBox").hide();
    $("#chatForm").hide();
    $("#loginDiv").show();
}
// make sure chat is off at beginning
chatOff();

// update the progress bar timing the game
function updateProgressBar() {
    progressBarTimer += 5; // percentage
    var progressString = String(progressBarTimer) + "%";
    // console.log("Progress " + progressString);
    $("#progressBar").css("width", progressString);
    if (progressBarTimer === 100) {
        //stop timer
        clearInterval(localInterval);
        $("#progressBar").css("width", "0%");
    }
}

// update the info such as wins and losses
function updateInfo() {
    if (result === "") {
        // initial setup of screen
        $("#lastResult").text("");
        $("#opponentLastResult").text("");
    }
    else {
        $("#lastResult").text(result);
        $("#opponentLastResult").text(opponentResult);
    }
    if (result === "win") {
        $("#statusSpan").text("you won");
        gamesWon++;
        gamesPlayed++;
    }
    else if (result === "loss") {
        $("#statusSpan").text("you lost");
        gamesLost++;
        gamesPlayed++;
    }
    else if (result === "draw") {
        $("#statusSpan").text("it was a draw");
        gamesPlayed++;
    }
    // display
    $("#winsSpan").text(gamesWon);
    $("#opponentWinsSpan").text(gamesLost);
    $("#lossesSpan").text(gamesLost);
    $("#opponentLossesSpan").text(gamesWon);
    $("#gamesPlayedSpan").text(gamesPlayed);
    $("#opponentGamesPlayedSpan").text(gamesPlayed);
    

}
// run at start to populate everything
updateInfo();

// connection listener abstracted as a function
function connectionListener(snapshot) {
    // console.log("Connection: State=" + state);
    
    if (!snapshot.child("user1").exists()) {
        console.log("check " + snapshot.child("user1").exists());
        // database not set up yet
        initializeDatabase();
        return;
    }

    // console.log("Connection: State=" + state + " 1=" + snapshot.val().user1 + " 2=" + snapshot.val().user2);
    if (state === "waitingForUser") {
        
        if (snapshot.val().user1 === "") {
            // first to log on
            changeState("waitingForPlayer2");
            connectingRef.update({user1:userName});
            userNumber = 1;
        } 
        else {
            // second to log on
            changeState("waitingForStart");
            $("#statusSpan").text("Waiting for start");
            connectingRef.update({ user2: userName });
            $("#startButton").removeAttr("disabled");
            userNumber = 2;
            // update enemy information
            opponentName = snapshot.val().user1;
            $("#opponentNameSpan").text(opponentName);
            // switch lower part of screen to chat
            chatOn();

        }
        
    }
    else if ( state==="waitingForPlayer2") {
        
        if (  snapshot.val().user2 !== "") {
            
            changeState("waitingForStart");
            $("#statusSpan").text("Waiting for start");
            $("#startButton").removeAttr("disabled");
            opponentName = snapshot.val().user2;
            // update on screen
            $("#opponentNameSpan").text(opponentName);
            userNumber = 1;
            chatOn();
        }
    }
    else if ( state==="waitingForStart") {
        // if other user logs out then this user is logged out as well
        if( snapshot.val().start === "true") {

            changeState("playing");
            gamePlay();
        }
        
    }
    // if any other state, do nothing
    // console.log("Connection: State=" + state + " 1=" + snapshot.val().user1 + " 2=" + snapshot.val().user2 );
}

// function to deal with timeout of main part of game
function gamePlay() {
    
    // set up images etc.
    $("#userImage").attr("src", "assets/images/question_mark.png");
    $("#opponentImage").attr("src", "assets/images/question_mark.png");
    $("#statusSpan").text("Playing game");
    // console.log("setting timeout");
    // clear connection information to make it easier to play another game
    connectingRef.set({
        user1: "",
        user2: "",
        start: ""
    });
    // set up progress bar
    progressBarTimer = 0;
    $("#progressBar").css("width", "0%");
    localInterval = setInterval(updateProgressBar, (timeAllowed/20)*1000);
    localTimeout = setTimeout(function () {
        // set state back to waitingForStart so another game can be played
        changeState("waitingForStart");
        // work out who won
        // no input is a loss
        console.log("Timeout you " + rpsSelect + " opponent " + opponentRpsSelect);
        if (( rpsSelect === "") & (opponentRpsSelect === "")) {
            // no winner
            result = "draw";
            opponentResult = "draw";
        }
        else if (rpsSelect === ""){ 
            result = "loss";
            opponentResult = "win";
        }
        else if (opponentRpsSelect === "") {
            result = "win";
            opponentResult = "loss";
        }
        // main decision logic
        else if ( rpsSelect === "rock") {
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
        updateInfo();
        if (opponentRpsSelect === "rock") {
            $("#opponentImage").attr("src", "assets/images/rock.png");
        }
        else if (opponentRpsSelect === "paper") {
            $("#opponentImage").attr("src", "assets/images/paper.png");
        }
        else if (opponentRpsSelect === "scissors") {
            $("#opponentImage").attr("src", "assets/images/scissors.png");
        }
        
        
        // reset values
        rpsSelect="";
        opponentRpsSelect = "";
        result = "";
        opponentResult = "";
        // reset values in database
        // this seems to be what was causing the asynchronous bug
        // dataRef.update({
        //     rpsSelectUser1: "",
        //     rpsSelectUser2: ""
        // });
        connectingRef.update({start: ""});
        // set state back to waitingForStart so another game can be played
        changeState("waitingForStart");
    }, timeAllowed * 1000);

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
        $("#statusSpan").text("Waiting for second user");
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
        changeState("playing");
        $("#statusSpan").text("Playing game click on an image");
        // let the other player know it started
        connectingRef.update({ start: "true" });
        gamePlay();
    }
});



// listener on rps buttons, put it in a variable, will use value when timeout
$(".rpsButton").on("click", function() {
    // only works if playing game
    if ( state ==="playing") {
        rpsSelect = $(this).attr("data-value");
        // send to database so other user can pick it up
        if ( userNumber === 1) {
            dataRef.update({rpsSelectUser1: rpsSelect});
        }
        else {
            dataRef.update({ rpsSelectUser2: rpsSelect });
        }
        // update user image
        if (rpsSelect === "rock"){
            $("#userImage").attr("src", "assets/images/rock.png");
        }
        else if (rpsSelect === "paper") {
            $("#userImage").attr("src", "assets/images/paper.png");
        }
        else if (rpsSelect === "scissors") {
            $("#userImage").attr("src", "assets/images/scissors.png");
        }
    }
});
    
// listener on database to find opponents selected value
dataRef.on("value", function (snapshot) {
    // only works if playing game
    if (state==="playing") {
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
            opponentRpsSelect = snapshot.val().rpsSelectUser1;
        }
    }
}, function (errorObject) {
    console.log("Reading opponent data failed: " + errorObject.code);
});


// listener on database to find incoming chat
// bug will print your chat as well
chatRef.on("value", function (snapshot) {
    // doesn't work if not logged on
    var newText;
    if ( state !== "waitingForUser") {
        // put on screen in red
        newText = $("<p>").text(snapshot.val().text);
        // newText.css("color", "red");
        newText.css("margin-bottom", "0");
        $("#chatBox").append(newText);
        // keep latest message at the bottom of the text box
        document.getElementById('chatBox').scrollTop = 9999999;
    }
}, function (errorObject) {
    console.log("Reading chat data failed: " + errorObject.code);
});

// listener on chat button
$("#chatSubmitButton").on("click", function (event) {
    event.preventDefault(); // form submit so don't post
    console.log("submit chat");
    // doesn't work if not logged on
    if (state !== "waitingForUser") {
        // send to database
        var msg = userName + ": " + $("#chatTextBox").val().trim();
        chatRef.update({ text:  msg});
        
        // clear chat input box
        $("#chatTextBox").val("");
    }
});

// listener on logout button -reset state and database so can start another session
$("#logoutButton").on("click", function () {
    // send logout to other user
    logoutRef.update({text:"true"});
    changeState("waitingForUser");
    // wait 2 seconds for data to propagate, otherwise race condition between clearing logout and opponent
    // seeing logout
    localTimeout = setTimeout( function() {
        // clean database
        cleanDatabase();
        chatOff();
        $("#statusSpan").text("log out - wait to log in again");
    }, 2000);
    


});

// listener on database logout
logoutRef.on("value", function(snapshot){
    if (snapshot.val().text === "true") {
        changeState("waitingForUser");
        // set back to empty so doesn't cause another logout
        logoutRef.update({ text: "" });
        cleanDatabase();
        chatOff();
        $("#statusSpan").text("log out - wait to log in again");

    }
});

}); // end document ready
    