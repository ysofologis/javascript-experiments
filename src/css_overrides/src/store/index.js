
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    uiPage: 'home',
  },
  getters: {
    uiPage: (state) => state.uiPage
  },
  mutations: {
    setUiPage (state, page) {
      state.uiPage = page
    },
  },
  actions: {
    setUiPage({commit}, page) {
      commit('setUiPage', page)
    }
  }
})
