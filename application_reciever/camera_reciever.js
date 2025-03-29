import './style.css';
import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBTCpP-4W9wx5-yCsl05oSStYUnAYUJLZA",
  authDomain: "webrtc-coturn-df83a.firebaseapp.com",
  projectId: "webrtc-coturn-df83a",
  storageBucket: "webrtc-coturn-df83a.appspot.com",
  messagingSenderId: "355458356837",
  appId: "1:355458356837:web:8b90a44c35a9b97535988c",
  measurementId: "G-P8T391DPJR"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const firestore = firebase.firestore();

const servers = {
  iceServers: [
    {
      urls: 'turn:192.168.1.80:3478',
      username: 'test',
      credential: 'test123',
    },
  ],
  iceTransportPolicy: 'relay',
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

// Create offer
async function createOffer() {
  setupDataChannel();
  const callDoc = firestore.collection('calls').doc();
  callInput.value = callDoc.id;
  
  
  // change the deafauld that will send a video 
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
  const dataChannel = pc.createDataChannel('messages');
  dataChannel.onopen = () => {
    console.log("send lost thing");
    dataChannel.send('connection lost');
    pc.close();
    pc = null;
  };
  // Close the peer connection
  //

  // Clear call input
  callInput.value = '';

  // Stop remote video safely
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
  }

  // Disable buttons
  /*callButton.disabled = true;
  answerButton.disabled = true;
  hangupButton.disabled = true;
  startButton.disabled = false;*/
  
  console.log('Call ended, video stopped, and input cleared');
}
hangupButton.onclick = hangupCall;

function changeInputVideo(){
    console.log("testen van knop");
    // Maak een datachannel om berichten te versturen
    const dataChannel = pc.createDataChannel('messages');

    dataChannel.onopen = () => {
      dataChannel.send('change video');
    };

    dataChannel.onclose = () => console.log('Datachannel is gesloten');
};
changeInput.onclick = changeInputVideo;

