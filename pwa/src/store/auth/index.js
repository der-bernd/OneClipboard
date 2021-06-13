import {} from "../../ApiAccess";

import { Notify } from "quasar";
function errorNotify(msg) {
  Notify.create({
    type: "negative",
    message: msg
  });
}

function successNotify(msg) {
  Notify.create({
    type: "positive",
    message: msg
  });
}

export default {
  namespaced: true,

  state: {
    user: {},
    signinLoaded: false
  },

  getters: {},

  mutations: {},

  actions: {}
};
