import Vue from "vue";
import Vuex from "vuex";

import auth from "./auth";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth
  },
  computed: {},
  mutations: {
    setEntry(state, entry_) {
      state.currentEntry = entry_;
    },

    setOldVersionRunning(state, running_) {
      state.oldVersionRunning = running_;
    }
  },
  actions: {},
  getters: {
    getSupportData(state) {
      return state.supportData;
    },

    getStudiCarInfo(state) {
      return state.info;
    },

    getEntry(state) {
      return state.currentEntry;
    },

    getLegalViews(state) {
      return Object.keys(state.legal);
    }
  },
  strict: process.env.DEV,
  state: {
    scroll: 0,
    nextPage: "",
    oldVersionRunning: false,
    currentEntry: ""
  }
});

export default store;
