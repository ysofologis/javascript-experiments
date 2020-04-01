import Vue from 'vue'
import $ from "jquery"

import App from './App.vue'

Vue.config.productionTip = false
Vue.prototype.$jq = $

new Vue({
  render: h => h(App),
}).$mount('#app')
