<template>
  <div class="grid-wrapper">
    <!-- Corner spacer where rulers intersect -->
    <div class="corner-spacer"></div>

    <!-- Horizontal ruler showing column indices -->
    <ColumnRuler
      :startCol="visibleStartCol"
      :endCol="visibleEndCol"
      :scrollLeft="scrollLeft"
      :cellWidth="CELL_WIDTH"
    />

    <!-- Vertical ruler showing row indices -->
    <RowRuler
      :startRow="visibleStartRow"
      :endRow="visibleEndRow"
      :scrollTop="scrollTop"
      :cellHeight="CELL_HEIGHT"
    />

    <!-- Main scrollable viewport -->
    <div
      ref="scrollContainer"
      class="scroll-container"
      @scroll="onScroll"
    >
      <!--
        Spacer creates the full scrollable area (40000 * cellSize).
        Only visible cells are rendered inside it.
      -->
      <div :style="spacerStyle">
        <GridCell
          v-for="cell in visibleCells"
          :key="cell.key"
          :row="cell.row"
          :col="cell.col"
          :cellKey="cell.key"
          :style="cell.style"
        />
      </div>
    </div>

    <!-- Floating save button — visible only when cells are modified -->
    <SaveButton />
  </div>
</template>

<script>
/**
 * VirtualGrid — the core component that implements virtual scrolling.
 *
 * How it works:
 * 1. A large spacer div creates a scrollable area sized to the full
 *    40000x40000 grid (4.8M x 1.6M pixels).
 * 2. On every scroll event (throttled via requestAnimationFrame),
 *    we calculate which rows and columns are in the visible viewport.
 * 3. Only those cells (plus a buffer) are rendered with absolute
 *    positioning inside the spacer. This keeps the DOM node count
 *    under ~1000 regardless of grid size.
 * 4. When new chunks enter the visible range, the Vuex store
 *    dispatches async data loading for them.
 */
import GridCell from './GridCell.vue';
import ColumnRuler from './ColumnRuler.vue';
import RowRuler from './RowRuler.vue';
import SaveButton from './SaveButton.vue';

const GRID_SIZE = 40000;
const CELL_WIDTH = 120;
const CELL_HEIGHT = 40;
const BUFFER = 5; // Extra rows/cols rendered beyond viewport

export default {
  name: 'VirtualGrid',

  components: { GridCell, ColumnRuler, RowRuler, SaveButton },

  data() {
    return {
      scrollTop: 0,
      scrollLeft: 0,
      containerWidth: 0,
      containerHeight: 0,
      ticking: false,
      CELL_WIDTH,
      CELL_HEIGHT,
    };
  },

  computed: {
    /** Full virtual size of the grid — creates scrollbar range. */
    spacerStyle() {
      return {
        width: `${GRID_SIZE * CELL_WIDTH}px`,
        height: `${GRID_SIZE * CELL_HEIGHT}px`,
        position: 'relative',
      };
    },

    /* ─── Visible range (with buffer) ──────────────── */

    visibleStartRow() {
      return Math.max(0, Math.floor(this.scrollTop / CELL_HEIGHT) - BUFFER);
    },
    visibleEndRow() {
      return Math.min(
        GRID_SIZE - 1,
        Math.floor((this.scrollTop + this.containerHeight) / CELL_HEIGHT) + BUFFER,
      );
    },
    visibleStartCol() {
      return Math.max(0, Math.floor(this.scrollLeft / CELL_WIDTH) - BUFFER);
    },
    visibleEndCol() {
      return Math.min(
        GRID_SIZE - 1,
        Math.floor((this.scrollLeft + this.containerWidth) / CELL_WIDTH) + BUFFER,
      );
    },

    /**
     * Build the array of cell descriptors for the visible viewport.
     * Each entry carries the row/col indices, a stable key for Vue's
     * diff algorithm, and an absolute-position style object.
     */
    visibleCells() {
      const cells = [];
      for (let r = this.visibleStartRow; r <= this.visibleEndRow; r++) {
        for (let c = this.visibleStartCol; c <= this.visibleEndCol; c++) {
          cells.push({
            row: r,
            col: c,
            key: `${r}-${c}`,
            style: {
              position: 'absolute',
              top: `${r * CELL_HEIGHT}px`,
              left: `${c * CELL_WIDTH}px`,
              width: `${CELL_WIDTH}px`,
              height: `${CELL_HEIGHT}px`,
            },
          });
        }
      }
      return cells;
    },
  },

  mounted() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
    this.loadVisibleChunks();
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.updateDimensions);
  },

  methods: {
    /**
     * Scroll handler throttled to one update per animation frame.
     * Updates reactive scroll offsets which triggers recomputation
     * of visibleCells and dispatches chunk loading.
     */
    onScroll() {
      if (!this.ticking) {
        requestAnimationFrame(() => {
          const el = this.$refs.scrollContainer;
          this.scrollTop = el.scrollTop;
          this.scrollLeft = el.scrollLeft;
          this.ticking = false;
          this.loadVisibleChunks();
        });
        this.ticking = true;
      }
    },

    /** Measure container size for visible range calculation. */
    updateDimensions() {
      const el = this.$refs.scrollContainer;
      if (el) {
        this.containerWidth = el.clientWidth;
        this.containerHeight = el.clientHeight;
      }
    },

    /** Ask the store to load any missing chunks in the visible range. */
    loadVisibleChunks() {
      this.$store.dispatch('loadChunksForRange', {
        startRow: this.visibleStartRow,
        endRow: this.visibleEndRow,
        startCol: this.visibleStartCol,
        endCol: this.visibleEndCol,
      });
    },
  },
};
</script>
