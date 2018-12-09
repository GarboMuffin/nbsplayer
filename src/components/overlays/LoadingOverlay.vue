<template>
  <div class="overlay" v-show="computedVisible">
    <b>Loading...</b>
  </div>
</template>

<script>
import overlayMixin from "./mixin.js";

export default {
  mixins: [overlayMixin],
  created() {

  },
};
</script>
