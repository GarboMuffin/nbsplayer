<template>
  <div class="details">
    <h2 class="title">{{ title }}</h2>
    <div v-show="song.author">Created by <b class="author">{{ song.author }}</b></div>
    <div v-show="song.originalAuthor">Originally created by <b class="original-author">{{ song.originalAuthor }}</b></div>

    <div><textarea readonly class="description" v-show="song.description" v-model="song.description"></textarea></div>

    <div><button @click="hide">Dismiss</button></div>
  </div>
</template>

<script>
import * as NBS from "@/NBS.js";

export default {
  inject: ["hide"],
  props: {
    song: NBS.Song,
  },
  computed: {
    title() {
      return this.song.name || "Unnamed Song";
    },
  }
}
</script>

<style scoped>
.details {
  text-align: center;
}
.title, .author, .original-author {
  color: rgb(153, 0, 153);
  text-shadow: 2px 2px rgb(255, 203, 255);
  font-weight: bold;
}
.description {
  width: 100%;
}
</style>
