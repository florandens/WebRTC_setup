import './style.css';
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  //firebaseconfig (information of your realtime database, more information readme)
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      //urls: 'turn:{IP-Corturn-server}',
      //username: '{username of CoTurn}',
      //credential: '{password of CoTurn}',
    },
  ],
  iceTransportPolicy: 'relay', //expleciet to use turn server
};

let pc = new RTCPeerConnection(servers);
let localStream;
let remoteStream;
let dataChannel;

const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
const callButton = document.getElementById('callButton');
const answerButton = document.getElementById('answerButton');
const hangupButton = document.getElementById('hangupButton');
const callInput = document.getElementById('callInput');
const changeInput = document.getElementById('change_video');


pc.ontrack = (event) => {
  if (!remoteStream) {
    remoteStream = new MediaStream();
    remoteVideo.srcObject = remoteStream;
  }
  event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
};

pc.onicecandidate = (event) => {
  if (event.candidate) {
    const callId = callInput.value;
    if (callId) {
      firestore.collection('calls').doc(callId).collection('candidates').add(event.candidate.toJSON());
    }
  }
};

//setup a data channel
function setupDataChannel() {
  dataChannel = pc.createDataChannel('messages');

  dataChannel.onopen = () => {
    console.log('Datachannel is open');
    dataChannel.send('connection done');
  };

  dataChannel.onclose = () =>{
    console.log('Datachannel is gesloten');
    }
}

//setup to send data in a channel
function sendDataFunction(message){
    if(dataChannel && dataChannel.readyState == "open"){
        dataChannel.send(message);
    }
    else{
        console.log("datachannel is not open, can not send " +  message)
    }
}


// Create offer
async function createOffer() {
  setupDataChannel();
  const callDoc = firestore.collection('calls').doc();
  callInput.value = callDoc.id;
  
  
  // change default offer, that only receive video (and not send)
  const offerOptions = {
    offerToReceiveVideo: true,
    offerToReceiveAudio: false,
  };

  const offer = await pc.createOffer(offerOptions);
  await pc.setLocalDescription(offer);

  await callDoc.set({ offer: { sdp: offer.sdp, type: offer.type } });

  callDoc.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (data?.answer && !pc.currentRemoteDescription) {
      pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    }
  });

  callDoc.collection('candidates').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}
callButton.onclick = createOffer;

function hangupCall() {
  console.log("send lost thing");
  sendDataFunction("connection lost");
  
  //close the peer to peer connection
  pc.close();
  pc = null;

  // Clear call input
  callInput.value = '';

  // Stop remote video safely
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
  }
  
  console.log('Call ended, video stopped, and input cleared');
}
hangupButton.onclick = hangupCall;

function changeInputVideo(){
    console.log("change video");
    sendDataFunction("change video");
}

changeInput.onclick = changeInputVideo;
