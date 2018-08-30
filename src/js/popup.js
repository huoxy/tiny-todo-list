import Vue from "vue"
Vue.config.productionTip = false
Vue.config.devtools = false

import Todolist from "../vue/todo-list.vue"

import "node_modules/font-awesome/css/font-awesome.css"

import '../popup.html'
import "../img/icon_16.png"
import "../img/icon_24.png"
import "../img/icon_32.png"
import "../img/icon_128.png"

chrome.storage.sync.get(['todos', 'todoType'], (result) => {
  var vm = new Vue({
    el: '#main_wrapper',
    render: h => h(Todolist, {
      props: {
        'saved-todos': result.todos,
        'saved-todo-type': result.todoType
      }
    })
  })
})
