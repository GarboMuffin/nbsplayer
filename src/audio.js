
// TODO: <audio> elements as fallback
// TODO: handle audio loading here

const audioContext = new AudioContext();
const audioDestination = audioContext.createGain();
audioDestination.connect(audioContext.destination);

export class WebAudioNotePlayer {
  static setVolume(volume) {
    audioDestination.gain.value = volume;
  }

  static playNote(key, instrument, volume) {
    const playbackRate = 2 ** (key / 12);

    let source = audioContext.createBufferSource();
    source.playbackRate.value = playbackRate;
    source.buffer = instrument.audioBuffer;
    source.start(0);

    if (volume !== 100) {
      const gainNode = audioContext.createGain();
      gainNode.gain.value = volume;
      source.connect(gainNode);
      source = gainNode;
    }

    source.connect(audioDestination);
  }

  static decodeAudioData(buffer) {
    return audioContext.decodeAudioData(buffer);
  }
}
