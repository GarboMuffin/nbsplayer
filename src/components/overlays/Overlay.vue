<template>
  <div class="overlay-container" v-show="computedVisible" @click.self="dismiss">
    <div class="overlay" v-show="computedVisible">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
  },

  data() {
    return {
      forcedVisible: null,
      dismissable: false,
    };
  },

  // Give control to hide or show to children if they want
  provide() {
    return {
      hide: this.hide,
      show: this.show,
    };
  },

  mounted() {
    if ("dismissable" in this.$attrs) {
      this.dismissable = true;
    }
  },

  watch: {
    visible() {
      this.forcedVisible = null;
    },
  },
  computed: {
    computedVisible() {
      if (this.forcedVisible !== null) {
        return this.forcedVisible;
      }
      return this.visible;
    }
  },
  methods: {
    hide() {
      this.forcedVisible = false;
    },
    show() {
      this.forcedVisible = true;
    },
    dismiss() {
      if (this.dismissable) {
        this.hide();
      }
    }
  },
}
</script>

<style scoped>
.overlay-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  background-color: #0004;
}

.overlay {
  /* always centered */
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* make it look half decent */
  background-color: #ededed;
  border-left: 1px solid #e4e4e4;
  border-top: 1px solid #e4e4e4;
  border-radius: 7px;
  padding: 15px 30px;
  box-shadow: 3px 3px #111;
}
</style>
