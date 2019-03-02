<template>
  <a class="button" @click="activate" :value="active" :title="title">
    <div class="instrument-body">{{ text }}</div>
  </a>
</template>

<script>
import { Instrument } from "@/NBS";
import { SongEditor } from "@/components/editor/editor";
import { state } from '@/state';

export default {
  props: {
    instrument: Instrument,
    editor: SongEditor,
  },

  computed: {
    text() {
      const words = this.instrument.name.split(" ");
      if (words.length === 1) {
        return this.instrument.name.substr(0, 2);
      } else {
        return words.slice(0, 2).map((i) => i[0]).join("");
      }
    },
    active() {
      return this.editor.currentInstrument === this.instrument;
    },
    title() {
      return "Set Instrument to " + this.instrument.name;
    },
  },

  methods: {
    activate() {
      this.editor.currentInstrument = this.instrument;
      state.playNote(this.editor.currentKey, this.instrument);
    }
  }
}
</script>

<style scoped>
.button {
  position: relative;
}
.instrument-body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
