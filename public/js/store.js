import * as constants from './constants.js';

//initial state
let state = {
  socketId: null,
  localStream: null,
  remoteStream: null,
  screenSharingActive: false,
  screenSharingStream: null,
  callState: constants.callState.CALL_AVAILABLE_ONLY_CHAT,
};

//setting socket id
export const setSocketId = (socketId) => {
  state = {
    ...state,
    socketId,
  };
  console.log(state);
};

//setting local stream in store
export const setLocalStream = (stream) => {
  state = {
    ...state,
    localStream: stream,
  };
};

//setting screen sharing
export const setScreenSharingActive = (screenSharingActive) => {
  state = {
    ...state,
    screenSharingActive,
  };
};


//setting screen sharing stream in store
export const setScreenSharingStream = (stream) => {
  state = {
    ...state,
    screenSharingStream: stream,
  };
};

//setting remote tream
export const setRemoteStream = (stream) => {
  state = {
    ...state,
    remoteStream: stream,
  };
};

//setting call state
export const setCallState = (callState) => {
  state = {
    ...state,
    callState,
  }
}

//this function let us get the state z
export const getState = () => {
  return state;
};
