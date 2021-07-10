import * as constants from "./constants.js";
import * as elements from "./elements.js";


//Updating Our Code in Personal Code Paragraph
export const updatePersonalCode = (personalCode) => {
  const personalCodeParagraph = document.getElementById(
    "personal_code_paragraph"
  );
  personalCodeParagraph.innerHTML = personalCode;
};

//updating local Video
export const updateLocalVideo = (stream) => {
  const localVideo = document.getElementById("local_video");
  localVideo.srcObject = stream;

  localVideo.addEventListener("loadedmetadata", () => {
    localVideo.play();
  });
};

//Video Call Button
export const showVideoCallButtons = () => {
  const personalCodeVideoButton = document.getElementById('personal_code_video_button');
  showElement(personalCodeVideoButton);
}
     
//Updating Remote Video
export const updateRemoteVideo = (stream) => {
  const remoteVideo = document.getElementById("remote_video");
  remoteVideo.srcObject = stream;
};

//Incoming Dialog Box to Reciever End
export const showIncomingCallDialog = (
  callType,
  acceptCallHandler,
  rejectCallHandler
) => {
  const callTypeInfo =
    callType === constants.callType.CHAT_PERSONAL_CODE ? "Chat" : "Video";

  const incomingCallDialog = elements.getIncomingCallDialog(
    callTypeInfo,
    acceptCallHandler,
    rejectCallHandler
  );

  // removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

  dialog.appendChild(incomingCallDialog);
};

//Calling Dialog To Caller
export const showCallingDialog = (rejectCallHandler) => {
  const callingDialog = elements.getCallingDialog(rejectCallHandler);

  // removing all dialogs inside HTML dialog element
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());

  dialog.appendChild(callingDialog);
};

//Show Dialog T Caller based on Response of Reciever
export const showInfoDialog = (preOfferAnswer) => {
  let infoDialog = null;

  //If call is rejected
  if (preOfferAnswer === constants.preOfferAnswer.CALL_REJECTED) {
    infoDialog = elements.getInfoDialog(
      "Call rejected",
      "Callee rejected your call"
    );
  }
  // If code is wrong
  if (preOfferAnswer === constants.preOfferAnswer.CALLEE_NOT_FOUND) {
    infoDialog = elements.getInfoDialog(
      "Callee not found",
      "Please check personal code"
    );
  }

 //If Reciever is already in call with some one
  if (preOfferAnswer === constants.preOfferAnswer.CALL_UNAVAILABLE) {
    infoDialog = elements.getInfoDialog(
      "Call is not possible now",
      "Probably callee is busy. Please try again later"
    );
  }

  //Dialog Box after getting Response from reciever 
  if (infoDialog) {
    const dialog = document.getElementById("dialog");
    dialog.appendChild(infoDialog);

    setTimeout(() => {
      removeAllDialogs();
    }, [4000]);
  }
};

//Removing Dialog
export const removeAllDialogs = () => {
  const dialog = document.getElementById("dialog");
  dialog.querySelectorAll("*").forEach((dialog) => dialog.remove());
};

//Show Call Items Related To Call
export const showCallElements = (callType) => {
  //For Chat Calls
  if (callType === constants.callType.CHAT_PERSONAL_CODE) {
   updateMessangerDuringChat();
   showChatCallElements();
  }
  //For Video Call
  if (callType === constants.callType.VIDEO_PERSONAL_CODE) {
    showVideoCallElements();
    updateMessangerDuringVideoCall();
  }
};

//Showing Items For Chat Call
const showChatCallElements = () => {
  const finishConnectionChatButtonContainer = document.getElementById(
    "finish_chat_button_container"
  );
  showElement(finishConnectionChatButtonContainer);
  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);
  //block panel
 disableDashboard();
};
//Showing Items For Video Call
const showVideoCallElements = () => {
  const callButtons = document.getElementById("call_buttons");
  showElement(callButtons);

  //Hiding Video PlaceHolder
  const placeholder = document.getElementById("video_placeholder");
  hideElement(placeholder);

  //Showing Remote Video
  const remoteVideo = document.getElementById("remote_video");
  showElement(remoteVideo);

  //Showing Messages
  const newMessageInput = document.getElementById("new_message");
  showElement(newMessageInput);
  //block panel
  disableDashboard();
};

// ui call buttons

const micOnImgSrc = "./utils/images/mic.jpg";
const micOffImgSrc = "./utils/images/micOff.jpg";

//Updating mic buttons 
export const updateMicButton = (micActive) => {
  const micButtonImage = document.getElementById("mic_button_image");
  micButtonImage.src = micActive ? micOffImgSrc : micOnImgSrc;
};

const cameraOnImgSrc = "./utils/images/camera.png";
const cameraOffImgSrc = "./utils/images/cameraOff.png";

//Updating Camera Button
export const updateCameraButton = (cameraActive) => {
  const cameraButtonImage = document.getElementById("camera_button_image");
  cameraButtonImage.src = cameraActive ? cameraOffImgSrc : cameraOnImgSrc;
}

// ui messages

//Updating UI during Chat Only
const updateMessangerDuringChat = () =>{
  document.getElementById('messenger_container').style.width='250%';
  hideElement( document.getElementById('local_video_container'));
  document.getElementById('new_message_input').style.height='40px';
  document.getElementById('new_message_input').style.fontSize = '16px';
  document.getElementById('send_message_button').style.height='25px';
  document.getElementById('send_message_button').style.width='40px';
  document.getElementById('send_message_button').style.top='7px';
  showElement(document.getElementById('clear_messages_button_chat'));
  showElement(document.getElementById('chat_imp_buttons'));
  hideElement(document.getElementById('clear_messages_button'));
};

//Updating  UI During Video Call
const updateMessangerDuringVideoCall = () =>{
  showElement( document.getElementById('local_video_container'));
  document.getElementById('new_message_input').style.height='30px';
  document.getElementById('new_message_input').style.fontSize = '8px';
  document.getElementById('send_message_button').style.height='20px';
  document.getElementById('send_message_button').style.width='20px';
  document.getElementById('send_message_button').style.top='5px';
  document.getElementById('local_video_container').style.left='-215px';
  document.getElementById('local_video_container').style.top='180px';
  document.getElementById('local_video_container').style.width='150px';
  document.getElementById('local_video_container').style.height='150px';
  hideElement(document.getElementById('clear_messages_button_chat'));
  hideElement(document.getElementById('chat_imp_buttons'));
};

//Appending Messages in Message Container
export const appendMessage = (message, right = false) => {
  const messagesContainer = document.getElementById("messages_container");
  const messageElement = right
    ? elements.getRightMessage(message)
    : elements.getLeftMessage(message);
  messagesContainer.appendChild(messageElement);
};

//Clearing Messages
export const clearMessenger = () => {
  const messagesContainer = document.getElementById("messages_container");
  messagesContainer.querySelectorAll("*").forEach((n) => n.remove());
};

//ui for hangup
export const updateUIAfterHangUp =(callType) => {
  enableDashboard();
  //Updating UI after Video Call
   if(callType === constants.callType.VIDEO_PERSONAL_CODE) {
    const callButtons = document.getElementById('call_buttons');
    showElement( document.getElementById('dashboard_container'));
    document.getElementById('local_video_container').style.left='15px';
    document.getElementById('local_video_container').style.top='15px';
    document.getElementById('clear_messages_button').style.right='100px';
    document.getElementById('clear_messages_button').style.top='8px';
    document.getElementById('clear_messages_button').style.width='40px';
    hideElement(callButtons);
    hideElement(document.getElementById('chat_imp_buttons'));
  } //After Chat Call
  else {
    const chatCallButtons = document.getElementById('finish_chat_button_container');
    document.getElementById('messenger_container').style.width='15%';
    showElement(document.getElementById('local_video_container'));
    showElement( document.getElementById('dashboard_container'));
    document.getElementById('clear_messages_button').style.right='100px';
    document.getElementById('clear_messages_button').style.top='8px';
    document.getElementById('clear_messages_button').style.width='40px';
    hideElement(chatCallButtons);
    hideElement(document.getElementById('chat_imp_buttons'));
  }

  //Hiding Messanger After Hang Up
  const newMessageInput = document.getElementById('new_message');
  hideElement(newMessageInput);
  updateMicButton(false);
  updateCameraButton(false);

  //Hiding remote video
  const remoteVideo = document.getElementById('remote_video');
  hideElement(remoteVideo);
  const placeholder = document.getElementById('video_placeholder');
  showElement(placeholder);
  removeAllDialogs();
};

// ui helper functions

//Showing Recording Panel
export const showRecordingPanel =() =>{
  const recordingButtons = document.getElementById('video_recording_buttons');
  showElement(recordingButtons);
  const startRecordingButton = document.getElementById('start_recording_button');
  hideElement(startRecordingButton);
};

//Reset Recording Button
export const resetRecordingButtons = () =>{
  const startRecordingButton = document.getElementById('start_recording_button');
  const recordingButtons = document.getElementById('video_recording_buttons');
  hideElement(recordingButtons);
  showElement(startRecordingButton);  
};

//Switching Between pause and resume Button
export const switchRecordingButtons = (switchForResumeButton = false) => {
  const resumeButton = document.getElementById('resume_recording_button');
  const pauseButton = document.getElementById('pause_recording_button');

  if(switchForResumeButton ){
    hideElement(pauseButton);
    showElement(resumeButton);
  } else{
    hideElement(resumeButton);
    showElement(pauseButton);
  }
}

//Disabing Blur Of DashBoard
const enableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (!dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.add("display_none");
  }
};

//Enabling Blur of dashboard
const disableDashboard = () => {
  const dashboardBlocker = document.getElementById("dashboard_blur");
  if (dashboardBlocker.classList.contains("display_none")) {
    dashboardBlocker.classList.remove("display_none");
  }
};

//Hiding Element
const hideElement = (element) => {
  if (!element.classList.contains("display_none")) {
    element.classList.add("display_none");
  }
};

//Showing Element
const showElement = (element) => {
  if (element.classList.contains("display_none")) {
    element.classList.remove("display_none");
  }
};


