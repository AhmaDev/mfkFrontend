import { createStore } from "vuex";

export default createStore({
  state: {
    loading: false,
  },
  getters: {},
  mutations: {
    loadingState: function (state, payload) {
      state.loading = payload;
    },
  },
  actions: {},
  modules: {},
});
