
// This file is now empty as the call system has been removed
export const useWebRTC = () => {
  return {
    callState: null,
    localVideoRef: null,
    remoteVideoRef: null,
    startCall: () => {},
    endCall: () => {},
    toggleAudio: () => {},
    toggleVideo: () => {},
    startScreenShare: () => {},
    stopScreenShare: () => {},
    acceptCall: () => {},
    rejectCall: () => {},
  };
};
