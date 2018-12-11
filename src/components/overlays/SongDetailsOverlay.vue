<template>
  <div class="overlay" v-show="computedVisible">
    <h2>{{ title }}</h2>
    <div v-show="song.author">Created by <b>{{ song.author }}</b></div>
    <div v-show="song.originalAuthor">Originally created by <b>{{ song.originalAuthor }}</b></div>

    <div><textarea readonly v-show="song.description" v-model="song.description"></textarea></div>

    <div><button @click="hide">Dismiss</button></div>
  </div>
</template>

<script>
import overlayMixin from "./overlay.js";

export default {
  mixins: [overlayMixin],
  props: ["song"],
  computed: {
    title() {
      return this.song.name || "Unnamed Song";
    },
  }
}
</script>

<style scoped>
.overlay {
  text-align: center;
}
</style>
