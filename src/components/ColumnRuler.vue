<template>
  <div class="column-ruler">
    <div
      class="column-ruler__track"
      :style="{ transform: `translateX(${-scrollLeft}px)` }"
    >
      <div
        v-for="col in visibleColumns"
        :key="col"
        class="column-ruler__cell"
        :style="{
          position: 'absolute',
          left: col * cellWidth + 'px',
          width: cellWidth + 'px',
        }"
      >
        {{ col }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ColumnRuler — horizontal ruler along the top showing column indices.
 *
 * Only renders labels for columns currently in the visible range.
 * The track is translated to stay in sync with horizontal scrolling.
 */
export default {
  name: 'ColumnRuler',

  props: {
    startCol: { type: Number, required: true },
    endCol: { type: Number, required: true },
    scrollLeft: { type: Number, required: true },
    cellWidth: { type: Number, required: true },
  },

  computed: {
    visibleColumns() {
      const cols = [];
      for (let c = this.startCol; c <= this.endCol; c++) {
        cols.push(c);
      }
      return cols;
    },
  },
};
</script>
