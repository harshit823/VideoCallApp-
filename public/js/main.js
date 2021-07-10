import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";
import * as ui from "./ui.js";
import * as recordingUtils from "./recordingUtils.js";

// Initializing socketIO connection
const socket = io("/");
wss.registerSocketEvents(socket);

webRTCHandler.getLocalPreview();

//personal code copy button's event listener 
const personalCodeCopyButton = document.getElementById(
  "personal_code_copy_button"
);
personalCodeCopyButton.addEventListener("click", () => {
  const personalCode = store.getState().socketId;
  navigator.clipboard && navigator.clipboard.writeText(personalCode); //saving text in clipboard
});

//  connection buttons's event listeners

const personalCodeChatButton = document.getElementById(
  "personal_code_chat_button"
);

const personalCodeVideoButton = document.getElementById(
  "personal_code_video_button"
);

//chat button's event listner
personalCodeChatButton.addEventListener("click", () => {
  console.log("chat button clicked");

  const calleePersonalCode = document.getElementById(
    "personal_code_input"
  ).value;
  //setting call type to chat only
  const callType = constants.callType.CHAT_PERSONAL_CODE;
   //sending preoffer
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
  webRTCHandler.clearMessages();
  ui.clearMessenger();
});

//video button's event listner
personalCodeVideoButton.addEventListener("click", () => {
  console.log("video button clicked");

  const calleePersonalCode = document.getElementById(
    "personal_code_input"
  ).value;
  //setting call type to video chat
  const callType = constants.callType.VIDEO_PERSONAL_CODE;
  //sending pre offer
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
  webRTCHandler.clearMessages();
  ui.clearMessenger();
});

// event listeners for video call buttons

//for Mic Button
const micButton = document.getElementById("mic_button");
micButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const micEnabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  ui.updateMicButton(micEnabled);
});

//for camera Button
const cameraButton = document.getElementById("camera_button");
cameraButton.addEventListener("click", () => {
  const localStream = store.getState().localStream;
  const cameraEnabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !cameraEnabled;
  ui.updateCameraButton(cameraEnabled);
});

// for screen sharing button
const switchForScreenSharingButton = document.getElementById(
  "screen_sharing_button"
);
switchForScreenSharingButton.addEventListener("click", () => {
  const screenSharingActive = store.getState().screenSharingActive;
  webRTCHandler.switchBetweenCameraAndScreenSharing(screenSharingActive);
});

// messenger

const newMessageInput = document.getElementById("new_message_input");
newMessageInput.addEventListener("keydown", (event) => {
  console.log("change occured");
  const key = event.key;

  if (key === "Enter") {
    if(newMessageInput.value !==""){
    webRTCHandler.sendMessageUsingDataChannel(event.target.value);
    ui.appendMessage(event.target.value, true);
    newMessageInput.value = "";
  }else{
    alert("Message Box is empty");   //If message box is empty
  }
}
});

//send message button
const sendMessageButton = document.getElementById("send_message_button");
sendMessageButton.addEventListener("click", () => {
  const message = newMessageInput.value;
  if(message !== ""){
  webRTCHandler.sendMessageUsingDataChannel(message);
  ui.appendMessage(message, true);
  newMessageInput.value = "";
  }
  else{
      alert("Message Box is empty");  // if message box is empty and user press send
  }
});


//recording

//starting of recording
const startRecordingButton = document.getElementById('start_recording_button');
startRecordingButton.addEventListener('click',()=>{
  recordingUtils.startRecording();
  ui.showRecordingPanel();
});

//stopping recording
const stopRecordingButton = document.getElementById('stop_recording_button');
stopRecordingButton.addEventListener('click',()=>{
  recordingUtils.stopRecording();
  ui.resetRecordingButtons();
});

//pausing recording
const pauseRecordingButton = document.getElementById('pause_recording_button');
pauseRecordingButton.addEventListener('click',() =>{
  recordingUtils.pauseRecording();
  ui.switchRecordingButtons(true);
});

//resuming recording
const resumeRecordingButton = document.getElementById('resume_recording_button');
resumeRecordingButton.addEventListener('click',()=>{
  recordingUtils.resumeRecording();
  ui.switchRecordingButtons();
});


//hangup 
const hangUpButton = document.getElementById('hang_up_button');
hangUpButton.addEventListener('click',() => {
  webRTCHandler.clearMessages();
  webRTCHandler.handleHangUp();
  ui.clearMessenger();
});

//finishing Chat
const hangUpChatButton = document.getElementById('finish_chat_call_button');
hangUpChatButton.addEventListener('click', () => {
  webRTCHandler.clearMessages();
  webRTCHandler.handleHangUp();
  ui.clearMessenger();
});

//clear message container
const clearMessages =document.getElementById('clear_messages_button');
clearMessages.addEventListener('click',()=>{
  ui.clearMessenger();
});

//switch from chat to video 
const switchVideoCallButton= document.getElementById('switch_video_call');
switchVideoCallButton.addEventListener('click',() =>{
  const calleePersonalCode=webRTCHandler.connectedUserDetails.socketId;
  //setting call type to video chat
  const callType = constants.callType.VIDEO_PERSONAL_CODE;
  //sending pre offer
  webRTCHandler.handleHangUp();
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});

//Switch to chat from video 
const switchChatButton = document.getElementById('switch_chat');
switchChatButton.addEventListener('click',()=>{
  const calleePersonalCode=webRTCHandler.connectedUserDetails.socketId;
  const callType = constants.callType.CHAT_PERSONAL_CODE;
  webRTCHandler.handleHangUp();
  webRTCHandler.sendPreOffer(callType, calleePersonalCode);

});

