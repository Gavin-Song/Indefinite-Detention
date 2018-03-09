# Indefinite Detention

Indefinite Detention is a multiplayer HTML5 clone of Brandon Li's game ["Indefinite: Interrogation Game"](https://play.google.com/store/apps/details?id=air.me.brandlibel.indefinite&hl=en). No central server is required as the game is peer to peer, relying on `peer.js` for connections.

![Game title screen](https://i.imgur.com/2yUDYLS.jpg)

## Getting Started

### Prerequisites
All the game requires to run is a modern javascript enabled browser (Supports ES6), and an internet connection (To load some fonts and scripts)

### Installing and running locally
To download the game locally, simply
`git clone https://github.com/Gavin-Song/Indefinite-Detention`

Then open up index.html with a web browser. (Note: you will need to setup a web server to serve the file if you want to save your highscore, as some browsers ignore cookies for file:// paths)

### Online version
There's already a version of this hosted online at [\[TODO URL HERE\]](URL%20HREF)

### Serve the game yourself
If you want to host the game yourself, simply serve the game folder. You will need to register for a peerjs API key at [http://peerjs.com/](http://peerjs.com/) Once you get that, modify the following lines in `js/multiplayer.js`

```javascript
const API_KEY = 'YOUR API KEY HERE' // Peer.js API key

// Website root url (before the game file), don't end with a /
// ROOT_URL + "/index.html" should direct to the game on your website
const ROOT_URL = "https://example.com/game"   
```
## License
See the LICENSE file for more information

## Acknowledgments
Special thanks to

 - Brandon Li for making the game (Which this is a clone of)
 - My friends for testing this with me
