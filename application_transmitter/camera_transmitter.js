// OpenAI (2025). ChatGPT [large language model]. https://chatopenai.com (error fixing)
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
      urls: 'turn:{IP-Corturn-server}',
      username: '{username of CoTurn}',
      credential: '{password of CoTurn}',
    },
  ],
  iceTransportPolicy: 'relay', //expleciet to use turn server
};

let pc = new RTCPeerConnection(servers);
let localStream;
let remoteStream;

let current_video = 0;
const video_info = new Map();
video_info.set(0, "video.mp4");
video_info.set(1, "video2.mp4");

const localVideo = document.getElementById('webcamVideo');
const remoteVideo = document.getElementById('remoteVideo');
const answerButton = document.getElementById('answerButton');
const hangupButton = document.getElementById('hangupButton');
const callInput = document.getElementById('callInput');
const indicationLed = document.querySelector('.square');

//start the video
async function startVideoStream() {
console.log("start video");
  try {
    localVideo.src = video_info.get(current_video);
    localVideo.loop = true;
    localVideo.muted = true;
    await localVideo.play();
    localStream = localVideo.captureStream();

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    answerButton.disabled = false;
    hangupButton.disabled = false;
  } catch (error) {
    console.error('Error accessing media devices:', error);
  }
}

//automatic start
startVideoStream();

pc.onicecandidate = (event) => {
  if (event.candidate) {
    const callId = callInput.value;
    if (callId) {
      firestore.collection('calls').doc(callId).collection('candidates').add(event.candidate.toJSON());
    }
  }
};

pc.ondatachannel = (event) => {
    event.channel.onmessage = (e) => {
        console.log(e.data);
        if(e.data == "change video"){
            changeVideo();
        }
        if(e.data == "connection done"){
            changeLed("red");
        }
        if(e.data == "connection lost"){
            changeLed("orange");
            pc.close()
            pc = new RTCPeerConnection(servers);
        }
    };
    
};


async function answerCall() {
  const callId = callInput.value;
  const callDoc = firestore.collection('calls').doc(callId);

  const callData = (await callDoc.get()).data();
  if (!callData?.offer) {
    alert('Invalid call ID or no offer available');
    return;
  }

  await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await callDoc.update({ answer: { type: answer.type, sdp: answer.sdp } });

  callDoc.collection('candidates').onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        pc.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}
answerButton.onclick = answerCall;

function hangupCall() {
  // Close the peer connection
  pc.close();

  // Clear call input
  callInput.value = '';

  // Stop local video
  if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      localStream = null;
      localVideo.srcObject = null;
      localVideo.pause();
      localVideo.removeAttribute('src'); 
      localVideo.load();
  }

  // Stop remote video safely
  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => track.stop());
    remoteVideo.srcObject = null;
  }

  // Disable buttons
  answerButton.disabled = true;
  hangupButton.disabled = true;
  console.log('Call ended, video stopped, and input cleared');
}
hangupButton.onclick = hangupCall;

async function changeVideo(){
    localStream.getTracks().forEach((track) => track.stop());
    current_video = (current_video+1)%video_info.size;
    localVideo.src = video_info.get(current_video);
    await localVideo.play();
    
    // Capture the new video stream
    const newStream = localVideo.captureStream();

    // Replace the tracks in the peer connection
    const senders = pc.getSenders()
    newStream.getTracks().forEach((newTrack) => {
        const sender = senders.find((s) => s.track.kind === newTrack.kind);
        if (sender) {
            sender.replaceTrack(newTrack); // Replace the existing track
        } else {
            pc.addTrack(newTrack, newStream); // If missing, add new track
        }
    });
}

async function changeLed(color){
    indicationLed.style.backgroundColor = color;
}
