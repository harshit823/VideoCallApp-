import * as store from "./store.js";
import * as ui from "./ui.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";

let socketIO = null;

//updating our socket id in store
export const registerSocketEvents = (socket) => {
  socketIO = socket;

  //Updating socket Id on connecting Server 
  socket.on("connect", () => {
    console.log("succesfully connected to socket.io server");
    store.setSocketId(socket.id); 
    ui.updatePersonalCode(socket.id);
  });

  //Setting Call back function on pre offer on server side
  socket.on("pre-offer", (data) => {
    webRTCHandler.handlePreOffer(data);
  });

  //Calling back handle pre offer answer function
  socket.on("pre-offer-answer", (data) => {
    webRTCHandler.handlePreOfferAnswer(data);
  });
  //Calling Back function To handle Connected User
  socket.on('user-hanged-up',() => {
    webRTCHandler.handleConnectedUserHangedUp();
  })
  socket.on('clear-messages',()=>{
    webRTCHandler.clearClientMessages();
  })

  //calling Relevent function for Socket server
  socket.on("webRTC-signaling", (data) => {
    switch (data.type) {
      case constants.webRTCSignaling.OFFER:
        webRTCHandler.handleWebRTCOffer(data);
        break;
      case constants.webRTCSignaling.ANSWER:
        webRTCHandler.handleWebRTCAnswer(data);
        break;
      case constants.webRTCSignaling.ICE_CANDIDATE:
        webRTCHandler.handleWebRTCCandidate(data);
        break;
      default:
        return;
    }
  });
};

//emitting pre offer to server
export const sendPreOffer = (data) => {
  console.log("emmiting to server pre offer event");
  socketIO.emit("pre-offer", data);
};

//emitting pre offer answer to server
export const sendPreOfferAnswer = (data) => {
  socketIO.emit("pre-offer-answer", data);
};

//emtting webRTC signaling to server 
export const sendDataUsingWebRTCSignaling = (data) => {
  socketIO.emit("webRTC-signaling", data);
};

//emitting event that user hanged up to server
export const sendUserHangedUp = (data) => {
  socketIO.emit('user-hanged-up',data);
};

//emitting To clear server
export const clearMessages = (data) =>{
  socketIO.emit('clear-messages',data);
};
