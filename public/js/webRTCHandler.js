import * as wss from "./wss.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

export let connectedUserDetails;
let peerConection;
let dataChannel;

const defaultConstraints = {
  audio: true,
  video: true,
};

//Configuring STUN Servers
const configuration = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

//Getting Local video And Making Availabilty For Call
export const getLocalPreview = () => {
  navigator.mediaDevices
    .getUserMedia(defaultConstraints)
    .then((stream) => {
      ui.updateLocalVideo(stream);
      ui.showVideoCallButtons();
      store.setCallState(constants.callState.CALL_AVAILABLE);
      store.setLocalStream(stream);
    })
    .catch((err) => {
      console.log("error occured when trying to get an access to camera");
      console.log(err);
    });
};

//Creating Peer Connection
const createPeerConnection = () => {
  peerConection = new RTCPeerConnection(configuration);

  //Creating Data Channel
  dataChannel = peerConection.createDataChannel("chat");
  peerConection.ondatachannel = (event) => {
    const dataChannel = event.channel;

    //Enabling Data channel To recieve Data
    dataChannel.onopen = () => {
      console.log("peer connection is ready to receive data channel messages");
    };

    dataChannel.onmessage = (event) => {
      console.log("message came from data channel");
      const message = JSON.parse(event.data);
      ui.appendMessage(message);
    };
  };

  //getting Our ICE Candidate From STUN SERVER
  peerConection.onicecandidate = (event) => {
    console.log("getting ice candidates from stun server");
    if (event.candidate) {
      // send our ice candidates to other peer
      wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constants.webRTCSignaling.ICE_CANDIDATE,
        candidate: event.candidate,
      });
    }
  };

  //Connected With Other Peer
  peerConection.onconnectionstatechange = (event) => {
    if (peerConection.connectionState === "connected") {
      console.log("succesfully connected with other peer");
    }
  };

  // receiving tracks
  const remoteStream = new MediaStream();
  store.setRemoteStream(remoteStream);
  ui.updateRemoteVideo(remoteStream);

  peerConection.ontrack = (event) => {
    remoteStream.addTrack(event.track);
  };

  // add our stream to peer connection

  if (
    connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const localStream = store.getState().localStream;

    for (const track of localStream.getTracks()) {
      peerConection.addTrack(track, localStream);
    }
  }
};

//sending our message Using data Channel
export const sendMessageUsingDataChannel = (message) => {
  const stringifiedMessage = JSON.stringify(message);
  dataChannel.send(stringifiedMessage);
};

//Sending preOffer to connected user
export const sendPreOffer = (callType, calleePersonalCode) => {
  connectedUserDetails = {
    callType,
    socketId: calleePersonalCode,
  };

  //Showing Relevent dialog to caller
  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    const data = {
      callType,
      calleePersonalCode,
    };
    ui.showCallingDialog(callingDialogRejectCallHandler);
    store.setCallState(constants.callState.CALL_UNAVAILABLE);
    wss.sendPreOffer(data);
  }
};

//Handling Recieved preOffer
export const  handlePreOffer = (data) => {
  const { callType, callerSocketId } = data;

 //checking call possibility
  if(!checkCallPossibility()) {
    return sendPreOfferAnswer(constants.preOfferAnswer.CALL_UNAVAILABLE,callerSocketId);
  }
  connectedUserDetails = {
    socketId: callerSocketId,
    callType,
  };

  store.setCallState(constants.callState.CALL_UNAVAILABLE);

  if (
    callType === constants.callType.CHAT_PERSONAL_CODE ||
    callType === constants.callType.VIDEO_PERSONAL_CODE
  ) {
    console.log("showing call dialog");
    ui.showIncomingCallDialog(callType, acceptCallHandler, rejectCallHandler);
  }
};
//Handling when Call is accepted
const acceptCallHandler = () => {
  console.log("call accepted");
  createPeerConnection();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_ACCEPTED);
  ui.showCallElements(connectedUserDetails.callType);
};

//When Call is rejected
const rejectCallHandler = () => {
  console.log("call rejected");
  sendPreOfferAnswer();
  setIncomingCallsAvailable();
  sendPreOfferAnswer(constants.preOfferAnswer.CALL_REJECTED);
};

//closing connection when Call is Rejected
const callingDialogRejectCallHandler = () => {
  const data = {
    connectedUserSocketId:connectedUserDetails.socketId
  }
  closePeerConnectionAndResetState();
  wss.sendUserHangedUp(data);
};

//Sendinf answer to PreOffer Recieved
const sendPreOfferAnswer = (preOfferAnswer,callerSocketId =null) => {
  const SocketId=callerSocketId ? callerSocketId:connectedUserDetails.socketId
  const data = {
    callerSocketId: SocketId,
    preOfferAnswer,
  };
  ui.removeAllDialogs();
  wss.sendPreOfferAnswer(data);
};

//handling Answer To Sent PreOffer
export const handlePreOfferAnswer = (data) => {
  const { preOfferAnswer } = data;
  ui.removeAllDialogs();

   // show dialog that callee has not been found
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    ui.showInfoDialog(preOfferAnswer);
    setIncomingCallsAvailable();
  }

  // show dialog that callee is not able to connect
  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    setIncomingCallsAvailable();
    ui.showInfoDialog(preOfferAnswer);
    }

    // show dialog that call is rejected by the callee
  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    setIncomingCallsAvailable();
    ui.showInfoDialog(preOfferAnswer);
  }

  //Handling Ui after Call accepted
  if (preOfferAnswer === constants.preOfferAnswer.CALL_ACCEPTED) {
    ui.showCallElements(connectedUserDetails.callType);
    createPeerConnection();
    sendWebRTCOffer();
  }
};

//sending webRTC offer
const sendWebRTCOffer = async () => {
  const offer = await peerConection.createOffer();
  await peerConection.setLocalDescription(offer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.OFFER,
    offer: offer,
  });
};

//Handling Recieved webRTC Offer
export const handleWebRTCOffer = async (data) => {
  await peerConection.setRemoteDescription(data.offer);
  const answer = await peerConection.createAnswer();
  await peerConection.setLocalDescription(answer);
  wss.sendDataUsingWebRTCSignaling({
    connectedUserSocketId: connectedUserDetails.socketId,
    type: constants.webRTCSignaling.ANSWER,
    answer: answer,
  });
};

//Handling webRTC answer recieved after sending pre Offer
export const handleWebRTCAnswer = async (data) => {
  console.log("handling webRTC Answer");
  await peerConection.setRemoteDescription(data.answer);
};

//Hamdling Recieved webRTC ICE Candidate
export const handleWebRTCCandidate = async (data) => {
  console.log("handling incoming webRTC candidates");
  try {
    await peerConection.addIceCandidate(data.candidate);
  } catch (err) {
    console.error(
      "error occured when trying to add received ice candidate",
      err
    );
  }
};

let screenSharingStream;

//Switching Between Screen Sharing
export const switchBetweenCameraAndScreenSharing = async (
  screenSharingActive
) => {
  if (screenSharingActive) {
    const localStream = store.getState().localStream;
    const senders = peerConection.getSenders();

    const sender = senders.find((sender) => {
      return sender.track.kind === localStream.getVideoTracks()[0].kind;
    });

    if (sender) {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    }

    // stop screen sharing stream

    store
      .getState()
      .screenSharingStream.getTracks()
      .forEach((track) => track.stop());

    store.setScreenSharingActive(!screenSharingActive);

    ui.updateLocalVideo(localStream);
  } else {
    console.log("switching for screen sharing");
    try {
      screenSharingStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      store.setScreenSharingStream(screenSharingStream);

      // replace track which sender is sending
      const senders = peerConection.getSenders();

      const sender = senders.find((sender) => {
        return (
          sender.track.kind === screenSharingStream.getVideoTracks()[0].kind
        );
      });

      if (sender) {
        sender.replaceTrack(screenSharingStream.getVideoTracks()[0]);
      }

      store.setScreenSharingActive(!screenSharingActive);
      ui.updateLocalVideo(screenSharingStream);
    } catch (err) {
      console.error(
        "error occured when trying to get screen sharing stream",
        err
      );
    }
  }
};

//hang up

//Clearing Message
export const clearMessages = () => {
  const data ={
    connectedUserSocketId: connectedUserDetails.socketId
  }
  wss.clearMessages(data);
}

//Clearing Client Message
export const clearClientMessages = () =>{
  ui.clearMessenger();
}

//Handling HangUp
export const handleHangUp = () => {
  const data ={
    connectedUserSocketId: connectedUserDetails.socketId
  }
  wss.sendUserHangedUp(data);
  closePeerConnectionAndResetState();
};

//Handling Handup at Client's Side
export const handleConnectedUserHangedUp = () =>{
  closePeerConnectionAndResetState();
};

//Closing Connection and Reseting state
const closePeerConnectionAndResetState = () => {
  if(peerConection){
    peerConection.close();
    peerConection=null;
  }
 //active 
  if(connectedUserDetails.callType === constants.callType.VIDEO_PERSONAL_CODE){
    store.getState().localStream.getVideoTracks()[0].enabled = true;
    store.getState().localStream.getAudioTracks()[0].enabled = true;
  }
  ui.updateUIAfterHangUp(connectedUserDetails.callType);
  setIncomingCallsAvailable();
  connectedUserDetails = null;
};

//Checking call Possibility
const checkCallPossibility = (callType) => {
  const callState = store.getState().callState;

  if(callState === constants.callState.CALL_AVAILABLE){
    return true;
  }
  if(callType === constants.callType.VIDEO_PERSONAL_CODE && callState ===constants.callState.CALL_AVAILABLE_ONLY_CHAT)
  {
    return false;
  }
  return false;
};

//setting Incoming call Available
const setIncomingCallsAvailable = () => {
  const localStream = store.getState().localStream;
  if(localStream){
    store.setCallState(constants.callState.CALL_AVAILABLE);
  }else{
    store.setCallState(constants.callState.CALL_AVAILABLE_ONLY_CHAT);
  }
}