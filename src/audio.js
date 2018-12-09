if (!window.AudioContext) {
  alert("Browser not supported. (does not support AudioContext)");
}

/**
 * The audio context used by the app to create nodes, etc.
 */
export const audioContext = new AudioContext();

/**
 * The destination for all audio nodes in the app.
 * Do not use audioContext.destination.
 */
export const audioDestination = audioContext.createGain();

audioDestination.connect(audioContext.destination);
