<template>
  <div class="key" :class="{ sharp, vanilla: vanillaFriendly, selected }" @click="select">
    <div class="text">{{ text }}</div>
  </div>
</template>

<script>
import { SongEditor } from "@/components/editor/editor";
import { state } from '@/state';

export default {
  props: {
    note: Number,
    sharp: Boolean,
  },
  computed: {
    text() {
      return SongEditor.formatKey(this.note);
    },
    vanillaFriendly() {
      return this.note >= 33 && this.note <= 59;
    },
    editor() {
      return this.$parent.editor;
    },
    selected() {
      return this.editor.currentKey === this.note;
    },
  },
  methods: {
    select() {
      this.editor.currentKey = this.note;
      state.playNote(this.note, this.editor.currentInstrument);
    },
  },
}
</script>

<style scoped>
.key {
  position: relative;
  width: 40px;
  height: 100%;
  border-radius: 3px;
  box-sizing: border-box;
  cursor: pointer;
}
.key.sharp {
  height: 50%;
  width: 30px;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 100%;
  transform: translateX(-50%);
  color: white;
}
.text {
  position: absolute;
  width: 100%;
  text-align: center;
  bottom: 10px;
  font-size: 12px;
  font-weight: bold;
}

.key {
  /* white & not vanilla friendly */
  background: linear-gradient(#fdd, #fcc);
  border: 1px solid #555;
}
.key.vanilla {
  /* white & vanilla friendly */
  background: linear-gradient(#fcfcfc, #e0e0e0);
  border: 1px solid #555;
}
.key.selected {
  /* white & selected */
  background: #ccc;
}

.key.sharp {
  /* black & not vanilla friendly*/
  background: linear-gradient(#833, #733);
  border: 1px solid #111;
}
.key.sharp.vanilla {
  /* black & vanilla friendly */
  background: linear-gradient(#2c2c2c, #222);
  border: 1px solid #111;
}
.key.sharp.selected {
  /* black & selected */
  background: #505;
}

</style>