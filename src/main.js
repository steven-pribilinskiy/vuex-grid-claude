/**
 * Application entry point.
 *
 * Mounts the Vue 2 app with Vuex store and global styles.
 */
import Vue from 'vue';
import App from './App.vue';
import store from './store';
import './styles/grid.css';

Vue.config.productionTip = false;

new Vue({
  store,
  render: (h) => h(App),
}).$mount('#app');
