<template>
  <div class="overlay" v-show="computedVisible">
    <b>Loading...</b>
  </div>
</template>

<script>
import overlayMixin from "./overlay.js";

export default {
  mixins: [overlayMixin],
};
</script>
