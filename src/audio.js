// Yell at the user if the browser does not support audiocontext
if (!window.AudioContext) {
  alert("Browser not supported. (does not support AudioContext)");
}

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
