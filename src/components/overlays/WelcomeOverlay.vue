<template>
  <div class="flex flex-row">
    <div class="about section">
      <h1>nbsplayer</h1>
      <p>It's like Note Block Studio.</p>
      <p>Note sounds and textures are owned by Mojang. Not approved by or associated with Mojang.</p>
    </div>

    <div class="actions section">
      <div class="load-song button flex flex-row flex-center">
        <font-awesome-icon icon="folder-open" fixed-width size="2x"></font-awesome-icon>
        <div class="button-body">Load a song</div>
        <input class="file-input" type="file" accept=".nbs" @change="inputFile">
      </div>
      <div class="new-song button flex flex-row flex-center" @click="newSong">
        <font-awesome-icon icon="file" fixed-width size="2x"></font-awesome-icon>
        <div class="button-body">Create a new song</div>
      </div>
      <div class="new-song button flex flex-row flex-center" @click="hide">
        <font-awesome-icon icon="times-circle" fixed-width size="2x"></font-awesome-icon>
        <div class="button-body">Dismiss</div>
      </div>
    </div>
  </div>
</template>

<script>
import { Song } from "../../NBS.js";
import { state } from "@/state.js";

export default {
  inject: ["hide"],
  methods: {
    inputFile(event) {
      if (event.target.files.length === 0) {
        return;
      }
      const file = event.target.files[0];
      state.loadFile(file)
        .then(() => this.hide());
    },
    newSong() {
      state.setSong(Song.new());
      this.hide();
    },
  },
};
</script>

<style scoped>
.section {
  padding: 0 10px;
  width: 50%;
}

p {
  font-size: 13px;
  margin: 3px 0;
}

.about {
  border-right: 1px solid #777;
  padding-right: 20px;
}
.about h1 {
  margin: 0;
}

.actions {
  font-size: 13px;
}

.button {
  padding: 10px;
  border-radius: 5px;
  min-width: 200px;
  /* makes the added border on hover not cause any size changes */
  border: 1px solid transparent;
}
.button:hover, .button:active {
  border: 1px solid #777;
}
.button:active {
  background-image: linear-gradient(#dfdfdf, #cdcdcd);
}
.button-body {
  padding-left: 5px;
}

.load-song {
  position: relative;
}
.file-input {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
