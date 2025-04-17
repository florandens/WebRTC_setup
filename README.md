# Overview
this application consists of 4 parts: signaling server, STUN/TURN server, transmitter and receiver. signaling server uses firebase, for TURN we use a CoTURN and for the peers it is the webRTC application. For the peers, one computer must have a transmitter and the other the receiver. In the code of transmitter need to fill in the firebase config and IP address from the TURN server.

# Signalisatie server

add in the `camera_reciever.js` and `camera_transmitter` your firebase config part. how to do this follow this steps:
- go to https://firebase.google.com/
- click on consol and log in with your google account
- create a new project (use deafult options)
- go to the build and select realtime database
- set rules:
```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
- create a now a app (give it a name)
- after you create it you have credentials, what you need to add in the code

# create TURN server

For to get working in a virtuele environment you can use a CoTurn, in the folder CoTurn can you find to config file that i used. For installation of coturn follow next steps (for linux)

```
sudo apt-get update -y
sudo apt-get install coturn
sudo nano /etc/default/coturn
```

in the file write: `TURNSERVER_ENABLED=1`
for to configuration first need to remove or save the origin file with a other name for to do that

```
mv /etc/turnserver.conf /etc/turnserver.conf.backup
```

put the config file that you can find in the CoTurn folder on `/etc/`, you need to put your external-ip (public) and internal-ip address (privete if insite your nat network). 
(you can change other settings for more information: https://gabrieltanner.org/blog/turn-server/ or https://github.com/coturn/coturn)

Last setup update in the `camera_reciever.js` and `camera_transmitter`, change yourIP adres to the ip address of the TURN server.


# Run code

If you want to make this project work, you have to work with two peers where at 1 peer you run the transmitter and at the other you run the receive. in each folder you have to call 
```
npm install
```
this is going to make sure proper dependencies are downloaded. 

Then to run the application you need 
```
npm run dev
```

