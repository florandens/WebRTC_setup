If you want to make this project work, you have to work with two peers where at 1 peer you run the transmitter and at the other you run the receive. in each folder you have to call 
```
npm install
```
this is going to make sure proper dependencies are downloaded. 

Then to run the application you need 
```
npm run dev
```

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

put the config file that you can find in the CoTurn folder on `/etc/`, you need to change external-ip to yours. 
(you can change other settings for more information: https://gabrieltanner.org/blog/turn-server/ or https://github.com/coturn/coturn)

