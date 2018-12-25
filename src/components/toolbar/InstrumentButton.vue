<template>
  <a class="button" @click="setInstrument" :value="active" :title="title">
    <div class="instrument-body">{{ text }}</div>
  </a>
</template>

<script>
import { Instrument } from "@/NBS";
import { SongEditor } from "@/components/editor/editor";

export default {
  props: {
    instrument: Instrument,
    editor: SongEditor,
  },

  computed: {
    text() {
      return this.instrument.name.split(" ").map((i) => i[0]).join("");
    },
    active() {
      return this.editor.currentInstrument === this.instrument;
    },
    title() {
      return "Set Instrument to " + this.instrument.name;
    },
  },

  methods: {
    setInstrument() {
      this.editor.currentInstrument = this.instrument;
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
