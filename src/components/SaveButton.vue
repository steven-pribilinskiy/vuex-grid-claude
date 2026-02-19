<template>
  <button v-if="hasModified" class="save-button" @click="save">
    Save Changes
  </button>
</template>

<script>
/**
 * SaveButton — appears when any cell has been modified.
 *
 * On click, dispatches the saveModified action which logs
 * all modified cells to the browser console and clears
 * the modification tracking state.
 */
export default {
  name: 'SaveButton',

  computed: {
    hasModified() {
      return this.$store.getters.hasModified;
    },
  },

  methods: {
    save() {
      this.$store.dispatch('saveModified');
    },
  },
};
</script>
