<template>
  <div class="overlay flex flex-row" v-show="computedVisible">
    <div class="about section">
      <h1>nbsplayer</h1>
    </div>
    <div class="section actions">
      <div class="button load-song">
        <table>
          <tr>
            <td>
              <font-awesome-icon icon="folder-open" fixed-width size="2x"></font-awesome-icon>
            </td>
            <td class="button-body">
              <div>Load a song</div>
              <input type="file" accept=".nbs" @input="loadFile">
            </td>
          </tr>
        </table>
      </div>
      <div class="button new-song" @click="hide">
        <table>
          <tr>
            <td>
              <font-awesome-icon icon="file" fixed-width size="2x"></font-awesome-icon>
            </td>
            <td class="button-body">
              <div>Create a new song</div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import overlayMixin from "./overlay.js";
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
.about {
  border-right: 1px solid #777;
}
.actions {
  font-size: smaller;
}
.section {
  padding: 0 10px;
}
.button {
  max-width: 500px;
  padding: 10px;
  border-radius: 5px;
  /* makes the added border not cause any size changes */
  border: 1px solid transparent;
}
.button:hover {
  border: 1px solid #777;
}
.button-body {
  padding-left: 5px;
}
</style>
