
import * as store from './store.js';

let mediaRecorder;

const vp9Codec = "video/webm; codecs=vp=9";
const vp9Options = { mimeType: vp9Codec };
const recordedChunks = [];

//Starting recording
export const startRecording = () => {
  const remoteStream = store.getState().remoteStream;
  const screenSharingStream= store.getState().screenSharingStream;

  if (MediaRecorder.isTypeSupported(vp9Codec)) {
    if(remoteStream===null)
    mediaRecorder = new MediaRecorder(screenSharingStream, vp9Options);
    else{
      mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
    }
  } else {
    if(remoteStream===null)
    {
     mediaRecorder= new MediaRecorder(screenSharingStream);
    }
    else 
    mediaRecorder = new MediaRecorder(remoteStream);
  }

  mediaRecorder.ondataavailable = handleDataAvailable;
  mediaRecorder.start();
};

//on pausing recording
export const pauseRecording = () => {
  mediaRecorder.pause();
};

//resuming recording
export const resumeRecording = () => {
  mediaRecorder.resume();
};

//stoping recording
export const stopRecording = () => {
  mediaRecorder.stop();
};

//Creating blob for downloading
const downloadRecordedVideo = () => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });

  //preparing for downloading
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none;";
  a.href = url;
  a.download = "recording.webm";
  a.click();
  window.URL.revokeObjectURL(url);
};

//downloading recording
const handleDataAvailable = (event) => {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    downloadRecordedVideo();
  }
};
