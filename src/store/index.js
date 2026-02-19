/**
 * Vuex store for the virtual grid.
 *
 * Uses sparse storage — only cells that have been loaded or modified
 * exist in the store. Data is loaded in chunks (CHUNK_SIZE x CHUNK_SIZE)
 * to batch network-simulated requests efficiently.
 */
import Vue from 'vue';
import Vuex from 'vuex';
import { generateChunkData } from '../utils/dataGenerator';

Vue.use(Vuex);

const CHUNK_SIZE = 10;

export default new Vuex.Store({
  state: {
    /** @type {Object<string, { checked: boolean, value: string }>} */
    cells: {},

    /** @type {Object<string, { checked: boolean, value: string }>} */
    modified: {},

    /** @type {Object<string, boolean>} Chunks currently being fetched */
    loadingChunks: {},

    /** @type {Object<string, boolean>} Chunks already fetched */
    loadedChunks: {},
  },

  mutations: {
    /**
     * Bulk-set cell data for an entire chunk after async load.
     * Uses Vue.set for reactivity on new keys.
     */
    SET_CHUNK_DATA(state, { cells, chunkKey }) {
      Object.entries(cells).forEach(([key, data]) => {
        Vue.set(state.cells, key, data);
      });
      Vue.set(state.loadedChunks, chunkKey, true);
      Vue.delete(state.loadingChunks, chunkKey);
    },

    /** Mark a chunk as currently loading. */
    SET_CHUNK_LOADING(state, { chunkKey }) {
      Vue.set(state.loadingChunks, chunkKey, true);
    },

    /** Toggle checkbox for a cell and track the modification. */
    SET_CELL_CHECKED(state, { key, checked }) {
      const cell = state.cells[key];
      if (cell) {
        cell.checked = checked;
      }
      const existing = state.modified[key] || { ...state.cells[key] };
      Vue.set(state.modified, key, { ...existing, checked });
    },

    /** Update input value for a cell and track the modification. */
    SET_CELL_VALUE(state, { key, value }) {
      const cell = state.cells[key];
      if (cell) {
        cell.value = value;
      }
      const existing = state.modified[key] || { ...state.cells[key] };
      Vue.set(state.modified, key, { ...existing, value });
    },

    /** Clear all modification tracking after save. */
    CLEAR_MODIFIED(state) {
      state.modified = {};
    },
  },

  actions: {
    /**
     * Determine which chunks overlap the visible range and
     * dispatch a load for any that haven't been fetched yet.
     */
    loadChunksForRange({ state, dispatch }, { startRow, endRow, startCol, endCol }) {
      const startChunkRow = Math.floor(startRow / CHUNK_SIZE);
      const endChunkRow = Math.floor(endRow / CHUNK_SIZE);
      const startChunkCol = Math.floor(startCol / CHUNK_SIZE);
      const endChunkCol = Math.floor(endCol / CHUNK_SIZE);

      for (let cr = startChunkRow; cr <= endChunkRow; cr++) {
        for (let cc = startChunkCol; cc <= endChunkCol; cc++) {
          const chunkKey = `${cr}-${cc}`;
          if (!state.loadedChunks[chunkKey] && !state.loadingChunks[chunkKey]) {
            dispatch('loadChunk', { chunkRow: cr, chunkCol: cc });
          }
        }
      }
    },

    /** Load a single chunk via the data generator (500ms simulated delay). */
    async loadChunk({ commit }, { chunkRow, chunkCol }) {
      const chunkKey = `${chunkRow}-${chunkCol}`;
      commit('SET_CHUNK_LOADING', { chunkKey });

      const startRow = chunkRow * CHUNK_SIZE;
      const startCol = chunkCol * CHUNK_SIZE;
      const cells = await generateChunkData(startRow, startCol, CHUNK_SIZE);

      commit('SET_CHUNK_DATA', { cells, chunkKey });
    },

    /** Log all modified cells to the console and clear modification state. */
    saveModified({ state, commit }) {
      console.log('Modified cells:', JSON.parse(JSON.stringify(state.modified)));
      commit('CLEAR_MODIFIED');
    },
  },

  getters: {
    /** Return cell data for a given key, or null if not loaded. */
    getCellData: (state) => (key) => {
      return state.cells[key] || null;
    },

    /** True when at least one cell has been modified. */
    hasModified: (state) => {
      return Object.keys(state.modified).length > 0;
    },

    /** Check if the chunk containing a row/col is currently loading. */
    isChunkLoading: (state) => (row, col) => {
      const chunkKey = `${Math.floor(row / CHUNK_SIZE)}-${Math.floor(col / CHUNK_SIZE)}`;
      return !!state.loadingChunks[chunkKey];
    },
  },
});
