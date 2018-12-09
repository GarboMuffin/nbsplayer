export const audioContext = new AudioContext();
export const audioDestination = audioContext.createGain();

audioDestination.connect(audioContext.destination);
