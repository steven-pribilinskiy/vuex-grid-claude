<template>
  <div class="grid-cell" :class="{ 'grid-cell--loading': isLoading }">
    <template v-if="cellData">
      <input
        type="checkbox"
        :checked="cellData.checked"
        class="grid-cell__checkbox"
        @change="onCheckboxChange"
      />
      <input
        type="text"
        :value="cellData.value"
        :disabled="cellData.checked"
        class="grid-cell__input"
        :class="{ 'grid-cell__input--disabled': cellData.checked }"
        @input="onInputChange"
      />
    </template>
    <span v-else-if="isLoading" class="grid-cell__loader">&hellip;</span>
  </div>
</template>

<script>
/**
 * GridCell — renders a single cell with a checkbox and digit-only input.
 *
 * When the checkbox is checked the input becomes disabled.
 * The input filters out non-digit characters on every keystroke.
 * Both interactions are committed to the Vuex store so the
 * SaveButton can track modifications.
 */
export default {
  name: 'GridCell',

  props: {
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    cellKey: { type: String, required: true },
  },

  computed: {
    cellData() {
      return this.$store.getters.getCellData(this.cellKey);
    },
    isLoading() {
      return this.$store.getters.isChunkLoading(this.row, this.col);
    },
  },

  methods: {
    onCheckboxChange(e) {
      this.$store.commit('SET_CELL_CHECKED', {
        key: this.cellKey,
        checked: e.target.checked,
      });
    },

    /** Filter to digits only, then commit to store. */
    onInputChange(e) {
      const digitsOnly = e.target.value.replace(/\D/g, '');
      e.target.value = digitsOnly;
      this.$store.commit('SET_CELL_VALUE', {
        key: this.cellKey,
        value: digitsOnly,
      });
    },
  },
};
</script>
