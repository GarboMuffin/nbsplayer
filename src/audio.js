// TODO: use AudioContext or <audio> elements as fallback
// TODO: object oriented
// TODO: handle audio loading here

/**
 * The audio context used by the app to create nodes, etc.
 */
export const audioContext = new AudioContext();

/**
 * The destination for all audio nodes in the app.
 * Use instead of audioContext.destination.
 */
export const audioDestination = audioContext.createGain();

audioDestination.connect(audioContext.destination);
