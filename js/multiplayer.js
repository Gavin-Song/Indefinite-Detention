"use strict"

const API_KEY = "" // Peer.js API key

// Website root url (before the game file), don't end with a /
// ROOT_URL + "/index.html" should direct to the game on your website
const ROOT_URL = ""

var peer
var current_peers = {}
var is_host = false
var current_name_list = []
var username = ""
var host_connection = null   // Only for non-host players


/* For the username screen */
function setupUsername(){
    let username = document.getElementById("username").value
    if(username.trim().length === 0)
        return

    current_peers = {}
    current_name_list = []
    document.getElementById('start_interrogate').style.display = "inline"

    promptScreen('multiplayer_setup_screen_2')
    createPeer(true)
}

/* Creates a new peer object */
function createPeer(h){
    peer = new Peer({key: API_KEY})
    is_host = h
    username = document.getElementById("username").value
        .replace(/ /g, "-")
        .replace(/[\u00A0-\u9999<>\&]/gim, function(i) { return '&#' + i.charCodeAt(0) + ';' })
    username += "-" + Math.round(Math.random() * 900 + 100)

    /* This displays the host itself in the game */
    if(is_host) addNewUser(username)
    document.getElementById("subject_name").innerHTML = username.toUpperCase()

    peer.on('open', function(id) {
        if(is_host){
            // <a> is intended not to have a href so host doesn't click on it and leave game
            document.getElementById("url").innerHTML =
            "<span style='color: white'>Share this link with your accomplices</span><br>"
            + ROOT_URL + "/index.html?id=" + encodeURIComponent(id)
        }
    });

    peer.on("connection", connect)
}

/* Host only command: sends data to all peers */
function sendToAll(data){
    if(!is_host) return
    for(let key of Object.keys(current_peers)){
        current_peers[key].send(data)
    }
}

/* Adds a user to the pre-game user list */
function addNewUser(id){
    document.getElementById("users_joined").innerHTML +=
        (username === id ? "<li style='color: yellow'>" : "<li>")
        + "<b>[SUBJECT]</b> "
        + id.toUpperCase() + "</li>"
}

/* Sends the "start_game" command to every
 * player connected to the host. Then, initate
 * a 3 second countdown */
function startGame(){
    /* Host triggers game start */
    if(is_host) sendToAll({ command: "start_game" })

    /* Initate a 3 second countdown */
    promptScreen("countdown_screen")
    document.getElementById("counter").innerHTML = 3
    setTimeout(function(){ document.getElementById("counter").innerHTML = 2 }, 1000)
    setTimeout(function(){ document.getElementById("counter").innerHTML = 1 }, 2000)

    /* Start the game */
    setTimeout(function(){ game.startGame(true) }, 3000)
}


function connect(c){
    /* A new user joining the game must announce
     * their name */
    if(!is_host){
        host_connection = c
        c.send({ command: "add_user", name: username })
    }

    c.on("data", function(d){
        switch(d.command){
            /* Add a new user to the list */
            case "add_user":{
                /* Add a user id to the list to display */
                addNewUser(d.name)
                if(is_host) current_name_list.push(d.name)
                if(is_host && !current_name_list.includes(username))
                    current_name_list.push(username)

                /* If a user greets you, save their connection
                 * object for future use */
                current_peers[c.peer] = c
                current_peers[c.peer].name = d.name

                /* The host is responsible for sending the
                 * list of current players to everyone */
                if(!is_host) return
                /* Send everyone's name to everyone else */
                sendToAll({
                    command: "add_user_list",
                    names: current_name_list
                })
                break
            }
            /* Update a list of all users */
            case "add_user_list": {
                document.getElementById("users_joined").innerHTML = ""
                for(let name of d.names)
                    addNewUser(name)
                break
            }
            /* Start the game! */
            case "start_game": {
                startGame()
                break
            }
            /* Update all player scores.
             * The host gets to redestribute all scores
             * to everyone. If the game is over, display all current
             * player scores to everyone */
            case "update_score": {
                game.updatePlayerScores(d)
                if(is_host) sendToAll(d)

                if(game.game_is_over)
                    game.drawPlayerScores()
            }
        }
    })

    c.on("close", function(){
        if(is_host){
            current_name_list = current_name_list.filter(x => x != c.name)
            delete current_peers[c.peer]
            sendToAll({
                command: "add_user_list",
                names: current_name_list
            })

            document.getElementById("users_joined").innerHTML = ""
            for(let name of current_name_list)
                addNewUser(name)
        } else{
            alert("The host has disconnected from the game. The page will now refresh")
            window.location.reload()
        }
    })
}

/* Try to connect to the host */
function connectToHost(){
    let id = window.location.href.split("?id=")[1]
    createPeer()
    if(!current_peers[id]){
        var c = peer.connect(id, {
            label: "Player " + (Object.keys(current_peers).length + 1)
        })
        c.on("open", function(){ connect(c) })
        c.on("error", function(){ alert("Connection to the host failed. Make sure you copied the url correctly!") })
        current_peers[id] = c
    }

    /* Non-host players get this message */
    document.getElementById("url").innerHTML = "Please wait for the interrogation to start.<br>(The host will start the game)"
}

/* If the url gives an id, try to connect to the host */
function attemptToJoinGame(){
    let url = window.location.href.split("?id=")
    if(url.length > 1){
        promptScreen("multiplayer_setup_screen")
        document.getElementById("submit_username").onclick = function(){
            promptScreen('multiplayer_setup_screen_2'); connectToHost(); }
        // Hide the start game button if you're not a host
        document.getElementById('start_interrogate').style.display = "none"
    }
}

/* Destroy any connections on window close */
window.onunload = window.onbeforeunload = function(e){
    if(!!peer && !peer.destroyed)
        peer.destroy()
}

/* Attempt to join a game, given game id */
window.onload = attemptToJoinGame
