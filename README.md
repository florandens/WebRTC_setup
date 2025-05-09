# Overview
This application consists of 4 parts:
#### <ins> *Server Side* </ins>
- A signalisation server | Using Firebase
- A STUN/TURN server | Using CoTURN
#### <ins> *Client Side (WebRTC Application)* </ins>
- A transmitter
- A receiver

# Configuration
## Client
Each peer (connection) most consist of 2 computers/users.  
One must act as the transmitter while the other acts as the receiver.  
The transmitter will need to configure its Firebase-configuration and the server-IP based on the configuration of the TURN server.

## Server
### TURN Server
This project will be run in a virtual environment. The environment we'll be using is CoTURN.  
Inside the folder *CoTurn Server* you'll find an example of the configuration I used

To install a CoTurn Server on your (linux) device use the following commands:
```sh
sudo apt update -y
sudo apt install coturn
sudo nano /etc/default/coturn
```
- In this file uncomment the `TURNSERVER_ENABLED=1` line, save and exit
- For the server configuration, first copy/move the standard config file with:
```sh
mv /etc/turnserver.conf /etc/turnserver.conf.backup
```
- Put my config-file in its place and edit the following lines:  
Replace the IP, Username & Password
```ini
external-ip={public_IP_address/private_IP}
```
```ini
user={Username}:{Password}
```

You can also change other settings if you want.
For more information about these settings: [Gabriel Tanner](https://gabrieltanner.org/blog/turn-server/) or [CoTURN Github](https://github.com/coturn/coturn)

### Signalisation Server
Inside each folder (transmitter and receiver) you'll find a `camera_*.js` file. Inside these files you'll need to add your own Firebase Configuration.  
To do so, follow these steps:
- Go to your [Firebase Console](https://console.firebase.google.com/)
- Create a new project (you can leave the default options)
- In the menu on the left go to *Build* and select *Realtime Database*
- Create a new database and select its location
- Next you'll need to set some basic rules:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
These are normally set by default, but if not please add them.

- Once the database is created go back to the homepage of your Firebase project
- Click on *Add firabase to your web app* or on the `</>` icon
- Name your app
- After creating you'll receive a code-box containing some code with your credentials. Something like this:
```js
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "<SOME_API_KEY>",
  authDomain: "<YOUR_PROJECTNAME>.firebaseapp.com",
  databaseURL: "<SOME_DATABASE_URL>",
  projectId: "<YOUR_PROJECTNAME>",
  storageBucket: "<YOUR_PROJECTNAME>.firebasestorage.app",
  messagingSenderId: "<SOME_MESSAGE_ID>",
  appId: "<SOME_APP_ID>"
};
```
- In the previously mentioned `camera_*.js` files replace the following piece of code with your own credentials
```js
const firebaseConfig = {
  //firebaseconfig (information of your realtime database, more information readme)
};
```
- Also edit the following lines with the configured details in [TURN Server](#turn-server). (Replace the IP, Username & Password)
```js
const servers = {
  iceServers: [
    {
      urls: 'turn:{CoTURN_IP}',
      username: '{CoTURN_Username}',
      credential: '{CoTURN_Password}',
    },
  ],
  iceTransportPolicy: 'relay', //expleciet to use turn server
};
```

More information: [Website Beaver](https://websitebeaver.com/insanely-simple-webrtc-video-chat-using-firebase-with-codepen-demo)

# Run Clients
In order to launch both transmitter and receiver, run the following commands in their respective folders.
These will download the proper dependencies and launch the programs.
```
npm install
npm run dev
```