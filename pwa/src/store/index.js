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
    setPage(state, obj) {
      state.pageName = obj.name;
      state.pageTrans = obj.transition || "slide";
      state.onlyInNav = obj.onlyInNav || false;
      state.navTitle = obj.navTitle || "";
    },

    setSupportData(state, data_) {
      state.supportData = data_;
    },

    addToLegal(state, legal_) {
      state.legal = {
        ...state.legal,
        ...legal_
      };
    },

    setInfo(state, info_) {
      state.info = info_;
    },

    setOldVersionRunning(state, running_) {
      state.oldVersionRunning = running_;
    },

    setAskAgainWhenAppreciatingNewPassenger(state, askAgain) {
      state.settings.askAgainWhenAppreciatingNewPassenger = askAgain;
    },

    setEnablePostillonNewsFeed(state, show) {
      state.settings.enablePostillonNewsFeed = show;
    },

    setWantedPage(state, payload) {
      state.nextPage = payload;
    },

    resetWantedPage(state) {
      state.nextPage = "";
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

    getNextPage(state) {
      return state.nextPage;
    },

    getLegalViews(state) {
      return Object.keys(state.legal);
    }
  },
  strict: process.env.DEV,
  state: {
    dataSaver: false,
    pageTrans: "slide",
    pageName: "Willkommen", // needed for scroll-relative Header
    onlyInNav: false,
    navTitle: "",
    testValue: 10,
    legal: {},
    supportData: null,
    info: null,
    scroll: 0,
    nextPage: "",
    oldVersionRunning: false,
    settings: {
      askAgainWhenAppreciatingNewPassenger: true, // when true, user has to confirm action at appreciating new passenger
      enablePostillonNewsFeed: true // when true, postillon ticker is displayed in left drawer
    }
  }
});

export default store;
