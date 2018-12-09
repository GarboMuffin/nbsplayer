export default {
  props: ["visible"],
  data() {
    return {
      forcedVisible: null,
    };
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
  },
};
