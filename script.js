const PRE = "DELTA";
const SUF = "MEET";
var room_id;
var peer = null;
var currentPeer = null;
var screenSharing = false;

function createRoom() {
  console.log("Creating Room");
  let room = document.getElementById("room-input").value.trim();
  if (!room) {
    alert("Please enter a room number");
    return;
  }
  room_id = PRE + room + SUF;
  peer = new Peer(room_id);

  peer.on("open", (id) => {
    console.log("Peer Connected with ID: ", id);
    hideModal();
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        setLocalStream(stream);
        notify("Waiting for peers to join.");
        // Share the local video stream with others in the room
        peer.on("call", (call) => {
          call.answer(stream);
        });
      },
      (err) => {
        console.log(err);
      }
    );
  });
}

function joinRoom() {
  console.log("Joining Room");
  let room = document.getElementById("room-input").value.trim();
  if (!room) {
    alert("Please enter a room number");
    return;
  }
  room_id = PRE + room + SUF;
  hideModal();
  peer = new Peer();

  peer.on("open", (id) => {
    console.log("Connected with Id: " + id);
    getUserMedia(
      { video: true, audio: true },
      (stream) => {
        setLocalStream(stream);
        notify("Joining the room");
        // Call the user in the room and request their video stream
        let call = peer.call(room_id, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream); // Display the remote video stream
        });
      },
      (err) => {
        console.log(err);
      }
    );
  });
}

function startScreenShare() {
  if (screenSharing) {
    stopScreenSharing();
    return;
  }
  navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
    screenSharing = true;
    let videoTrack = stream.getVideoTracks()[0];
    videoTrack.onended = () => {
      stopScreenSharing();
    };

    if (peer) {
      let sender = currentPeer.peerConnection.getSenders().find((s) => {
        return s.track.kind === videoTrack.kind;
      });
      sender.replaceTrack(videoTrack);
    }
  });
}

function stopScreenSharing() {
  if (!screenSharing) return;
  let videoTrack = local_stream.getVideoTracks()[0];
  if (peer) {
    let sender = currentPeer.peerConnection.getSenders().find((s) => {
      return s.track.kind === videoTrack.kind;
    });
    sender.replaceTrack(videoTrack);
  }
  screenSharing = false;
}

function setLocalStream(stream) {
  let video = document.getElementById("local-video");
  video.srcObject = stream;
  video.muted = true;
  video.play();
}

function setRemoteStream(stream) {
  let video = document.getElementById("remote-video");
  video.srcObject = stream;
  video.play();
}

function hideModal() {
  document.getElementById("entry-modal").hidden = true;
}

function notify(msg) {
  let notification = document.getElementById("notification");
  notification.innerHTML = msg;
  notification.hidden = false;
  setTimeout(() => {
    notification.hidden = true;
  }, 3000);
}
