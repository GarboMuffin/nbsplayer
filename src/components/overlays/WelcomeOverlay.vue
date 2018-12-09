<template>
  <div class="overlay" v-show="computedVisible">
    <h1>nbsplayer</h1>
    <p>Play <code>.nbs</code> files inside your browser.</p>
    <p>Non vanilla octaves and tempos are supported. Custom instruments are not.</p>
    <input type="file" @input="loadFile" accept=".nbs">
    <br>
    <button @click="hide">Create a new song</button>
  </div>
</template>

<script>
import overlayMixin from "./mixin.js";
import * as NBS from "../../NBS.js";

export default {
  mixins: [overlayMixin],
  methods: {
    loadFile(event) {
      const file = event.target.files[0];
      this.$parent.loadFile(file)
        .then(() => this.hide());
    }
  }
};
</script>

<style scoped>
p {
  font-size: smaller;
}
</style>
