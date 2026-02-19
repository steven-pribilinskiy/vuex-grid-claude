<template>
  <div class="row-ruler">
    <div
      class="row-ruler__track"
      :style="{ transform: `translateY(${-scrollTop}px)` }"
    >
      <div
        v-for="row in visibleRows"
        :key="row"
        class="row-ruler__cell"
        :style="{
          position: 'absolute',
          top: row * cellHeight + 'px',
          height: cellHeight + 'px',
        }"
      >
        {{ row }}
      </div>
    </div>
  </div>
</template>

<script>
/**
 * RowRuler — vertical ruler along the left showing row indices.
 *
 * Only renders labels for rows currently in the visible range.
 * The track is translated to stay in sync with vertical scrolling.
 */
export default {
  name: 'RowRuler',

  props: {
    startRow: { type: Number, required: true },
    endRow: { type: Number, required: true },
    scrollTop: { type: Number, required: true },
    cellHeight: { type: Number, required: true },
  },

  computed: {
    visibleRows() {
      const rows = [];
      for (let r = this.startRow; r <= this.endRow; r++) {
        rows.push(r);
      }
      return rows;
    },
  },
};
</script>
