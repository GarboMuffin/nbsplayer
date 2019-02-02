<template>
  <div class="octave">
    <!-- A vanilla minecraft octave -->
    <!-- They start at a slightly different spot. -->
    <div class="keyboard-key">
      <key :note="start + 1" :sharp="false"></key>
      <key :note="start + 2" :sharp="true"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 3" :sharp="false"></key>
      <key :note="start + 4" :sharp="true"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 5" :sharp="false"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 6" :sharp="false"></key>
      <key :note="start + 7" :sharp="true"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 8" :sharp="false"></key>
      <key :note="start + 9" :sharp="true"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 10" :sharp="false"></key>
    </div>
    <div class="keyboard-key">
      <key :note="start + 11" :sharp="false"></key>
      <key :note="start + 12" :sharp="true"></key>
    </div>
  </div>
</template>

<script>
import Key from "./Key.vue";
import { SongEditor } from "@/components/editor/editor";

export default {
  props: {
    start: Number,
    editor: SongEditor,
  },
  components: {
    Key,
  },
}
</script>

<style scoped>
.octave {
  display: flex;
  flex-direction: row;
}
.keyboard-key {
  position: relative;
}
</style>