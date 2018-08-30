<template>
<div class="todo-list">
  <section class="todo-list-head">
    <table>
      <tbody>
        <tr>
          <td>
            <input autofocus autocorrect="off" spellcheck="false" autocapitalize="off" autocomplete="off" type="text" placeholder="New Todo  or  Search" v-model="newTodo" @keyup.enter="createTodo" :disabled="sortting" />
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="todo-list-body" :class="{sortting: sortting, dragging: dragging}">
    <table v-if="!sortting">
      <tbody>
        <tr v-for="todo in filteredTodos" :class="{done: todo.done, editing: todo == todoNameEditted}">
          <td @click="todo.done = !todo.done" v-show="todo != todoNameEditted" class="todo-check">
            <i :class="[todo.done?'fa-check':'fa-square-o', 'fa']" aria-hidden="true"></i>
          </td>
          <td v-show="todo != todoNameEditted" @dblclick="beforeEditTodoName(todo)">
            <label class="todo-name">{{ todo.name }}</label>
            <div class="todo-time" v-if="todo.time && !todo.done">
              <label :class="{'late': isLate(todo)}" @click.stop="beforeEditTodoTime(todo)">{{ timeToCalendar(todo.time) }}</label>
              <i class="fa fa-times" @click.stop="todo.time = null"></i>
            </div>
          </td>
          <td v-show="todo != todoNameEditted" class="todo-action text-right" style="width:15%;">
            <i @click="beforeEditTodoTime(todo)" class="fa fa-calendar-check-o" aria-hidden="true"></i>
            <i @click="removeTodo(todo)" class="fa fa-trash-o" aria-hidden="true"></i>
          </td>
          <td v-show="todo == todoNameEditted" colspan=2>
            <input autocorrect="off" spellcheck="false" autocapitalize="off" type="text" v-model="todo.name" v-todo-focus="todo == todoNameEditted" @keyup.enter="finishEditTodoName(todo)" />
          </td>
          <td v-show="todo == todoNameEditted" class="todo-action text-right">
            <i @click="cancelEditTodoName(todo)" class="fa fa-close" aria-hidden="true"></i>
            <i @click="finishEditTodoName(todo)" class="fa fa-check" aria-hidden="true"></i>
          </td>
        </tr>
      </tbody>
    </table>

    <table v-if="sortting" @start="dragging=true" @end="dragging=false">
      <tbody>
        <draggable v-model="todos">
          <tr v-for="todo in todos">
            <td class="todo-move">
              <i class="fa fa-bars" aria-hidden="true"></i>
            </td>
            <td>
              <label class="todo-name">{{ todo.name }}</label>
            </td>
          </tr>
        </draggable>
      </tbody>
    </table>
  </section>

  <section class="todo-list-stat">
    <table>
      <tbody>
        <tr>
          <td class="todo-sort" v-if="!sortting">
            <i class="fa fa-bars" @click="sortting=true" v-if="!sortting"></i>
          </td>
          <td class="todo-social" v-if="!sortting">
            <social-sharing :url="url" title="Tiny Todo" description="Tiny Todo allows to add and remove items or tasks with ease. Support both Firefox addons and Chrome extensions" quote="Tiny Todo" hashtags="todolist,todo,task" twitter-user="sykp241095" inline-template>
              <div>
                <network network="twitter">
                  <i class="fa fa-twitter"></i>
                </network>
              </div>
            </social-sharing>
          </td>
          <td class="todo-filter" v-if="!sortting">
            <div class="pretty p-icon p-round p-jelly">
              <input type="radio" v-model="todoType" v-bind:value="'all'" />
              <div class="state p-primary">
                <i class="icon mdi mdi-check"></i>
                <label>all<span class="todo-count">{{ getTodosOfType('all').length }}</span></label>
              </div>
            </div>
            <div class="pretty p-icon p-round p-jelly">
              <input type="radio" v-model="todoType" v-bind:value="'todo'" />
              <div class="state p-primary">
                <i class="icon mdi mdi-check"></i>
                <label>todo<span class="todo-count">{{ getTodosOfType('todo').length }}</span></label>
              </div>
            </div>
            <div class="pretty p-icon p-round p-jelly">
              <input type="radio" v-model="todoType" v-bind:value="'done'" />
              <div class="state p-primary">
                <i class="icon mdi mdi-check"></i>
                <label>done<span class="todo-count">{{ getTodosOfType('done').length }}</span></label>
              </div>
            </div>
            <div class="pretty p-icon p-round p-jelly">
              <input type="radio" v-model="todoType" v-bind:value="'late'" />
              <div class="state p-primary">
                <i class="icon mdi mdi-check"></i>
                <label>late<span class="todo-count">{{ getTodosOfType('late').length }}</span></label>
              </div>
            </div>
          </td>
          <td style="text-align:center;" v-if="sortting">
            <i class="fa fa-check" @click="sortting=false"></i>
          </td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="todo-conf-page text-center" v-if="todoTimeEditted">
    <i class="fa fa-close float-right close" @click="cancelEditTodoTime"></i>
    <table class="todo-conf-time">
      <tbody>
        <tr>
          <td>
            <flat-pickr v-model="todoTimeCache" :config="datePickrConfig" placeholder="Select time"></flat-pickr>
          </td>
        </tr>
      </tbody>
    </table>
    <table class="todo-conf-btns">
      <tbody>
        <tr>
          <td class="text-center">
            <i @click="finishEditTodoTime" class="fa fa-check"></i>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</div>
</template>

<script>
'use strict';

import Vue from "vue"
import moment from "moment"
import flatPickr from "vue-flatpickr-component"
import draggable from "vuedraggable"
const SocialSharing = require("vue-social-sharing")
Vue.use(SocialSharing)

const {
  detect
} = require('detect-browser')
const browser = detect()

let url = "https://addons.mozilla.org/en-US/firefox/addon/tiny-todo/"
if (browser && browser.name == "chrome") {
  url = "https://chrome.google.com/webstore/detail/tiny-todo/mmnhechnpmgdgodpkpfcljnpgmhfeimo"
}

import "pretty-checkbox"
import "flatpickr/dist/flatpickr.css"

import {
  setBadgeText
} from "../js/background.js"


var now = moment(),
  defaultDate = now.clone().toDate(),
  maxDate = now.clone().add(137, "years").toDate(); // Human can not live more than 137 years.

export default {
  props: ['savedTodos', 'savedTodoType'],
  data() {
    return {
      todos: this.savedTodos || [],
      // crud operations
      newTodo: '',
      // edit todo.name
      todoNameEditted: null,
      // edit todo.time
      todoTimeEditted: null,
      todoTimeCache: null,
      now: now.toDate(),
      // vue-datepickr
      datePickrConfig: {
        inline: true,
        enableTime: true,
        time_24hr: true,
        defaultDate: defaultDate,
        maxDate: maxDate
      },
      todoType: this.savedTodoType || "all",
      // vuedraggable
      sortting: false,
      dragging: false,
      url: url
    }
  },
  computed: {
    filteredTodos() {
      if (this.newTodo) {
        return this.todos.filter((todo) => {
          return todo.name.toLowerCase().indexOf(this.newTodo.toLowerCase()) >= 0
        })
      }
      return this.getTodosOfType(this.todoType)
    }
  },
  components: {
    flatPickr,
    draggable,
  },
  methods: {
    createTodo() {
      let name = this.newTodo && this.newTodo.trim()
      if (!name) {
        return
      }
      this.todos.push({
        name: name,
        done: false,
        time: null
      })
      this.newTodo = ''
    },
    removeTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
    },

    // edit todo.name
    beforeEditTodoName(todo) {
      // Do nothing while editing
      if (this.todoNameEditted) {
        return
      }
      this.todoNameCache = todo.name
      this.todoNameEditted = todo
    },
    cancelEditTodoName(todo) {
      this.todoNameEditted = null
      todo.name = this.todoNameCache
    },
    finishEditTodoName(todo) {
      if (!this.todoNameEditted) {
        return
      }
      this.todoNameEditted = null
      todo.name = todo.name.trim()
      if (!todo.name) {
        this.removeTodo(todo)
      }
    },

    // edit todo.time
    beforeEditTodoTime(todo) {
      this.todoTimeEditted = todo
      this.todoTimeCache = todo.time
    },
    cancelEditTodoTime() {
      this.todoTimeEditted = null
      this.todoTimeCache = null
    },
    finishEditTodoTime() {
      if (this.todoTimeEditted && this.todoTimeCache) {
        this.todoTimeEditted.time = this.todoTimeCache
      }
      this.todoTimeEditted = null
      this.todoTimeCache = null
    },

    // utils
    isLate(todo) {
      return !todo.done && todo.time && moment(todo.time) < this.now
    },
    timeToCalendar(time) {
      return moment(time).calendar()
    },
    getTodosOfType(type) {
      if (type == 'todo') {
        return this.todos.filter((todo) => {
          return !todo.done
        })
      } else if (type == 'done') {
        return this.todos.filter((todo) => {
          return todo.done
        })
      } else if (type == 'late') {
        return this.todos.filter((todo) => {
          return this.isLate(todo)
        })
      } else {
        return this.todos
      }
    }
  },
  watch: {
    todos: {
      handler(newTodos, oldTodos) {
        chrome.storage.sync.set({
          'todos': newTodos
        })
        setBadgeText(newTodos)
      },
      deep: true
    },
    todoType: {
      handler(newVal, oldVal) {
        chrome.storage.sync.set({
          todoType: newVal
        })
      },
      deep: true
    }
  },
  directives: {
    'todo-focus': (el, binding) => {
      if (binding.value) {
        el.focus()
      }
    }
  }
}
</script>

<style lang="stylus">
$width = 400px
$height = 600px
$fontSize = 18px
$todoListStatHeight = $fontSize * 3

$color = rgb(40, 40, 40)
$doneColor = rgb(160, 160, 160)

@keyframes will-be-done
  0%
    color $color
  100%
    color $doneColor

@keyframes will-be-shown
  0%
    opacity 0
  100%
    opacity 1

body
  padding 0
  margin 0
  border none
  width $width
  height $height

  ::-webkit-scrollbar
    display none

  ::placeholder
    color grey

  *
    box-sizing border-box
    -webkit-font-smoothing antialiased
    // white-space pre-wrap
    word-wrap break-word
    word-break break-word

  .text-center
    text-align center

  .text-right
    text-align right

  .float-right
    float right

    &.close
      cursor pointer

  .todo-list
    min-width $width
    max-width ($width + 100px)
    height $height
    overflow scroll
    background-color white
    color $color

    .todo-list-head, .todo-list-body, .todo-list-stat, .todo-conf-page
      background-color inherit
      width 100%

      table
        width 100%
        border-collapse collapse

        tbody
          tr
            td
              font-family Arial, Helvetica, sans-serif
              font-size $fontSize
              vertical-align top
              padding ($fontSize / 2) 0

              input[type=text]
                width 100%
                border none
                box-shadow none
                outline 0 none
                font-size $fontSize
                padding 0

              i, label
                cursor pointer

              i
                font-size ($fontSize * 0.9)

              .todo-time

                label
                  font-size ($fontSize * 0.6)
                  color rgb(130, 130, 130)
                  border-bottom 1px dashed rgb(190, 190, 190)

                  &.late
                    color firebrick
                    font-weight bolder

                i
                  margin-left 5px
                  font-size ($fontSize * 0.6)
                  color rgb(150, 150, 150)

              &.todo-check, &.todo-sort, &.todo-move
                width 25px

    .todo-list-head
      border-bottom 1px solid rgb(190, 190, 190)

      table
        tbody
          tr
            td
              padding 0

              input[type=text]
                padding $fontSize
                background-image url(../img/search.svg)
                background-position ($width - $fontSize - @padding) (@padding + 3px)
                background-repeat no-repeat
                background-size $fontSize $fontSize
                padding-right ($fontSize + @padding * 2)

                &:disabled
                  background-color white
                  cursor default
                  opacity 0.5

    .todo-list-body
      padding 0 10px $todoListStatHeight 10px

      table
        tbody
          tr
            border-bottom 1px dashed rgb(240, 240, 240)

            td
              i
                color $color

              &.todo-action
                word-spacing ($fontSize / 3)

                i
                  opacity 0.4

            // tr:hover, tr.editing
            &:hover, &.editing
              td
                &.todo-action
                  i
                    opacity 0.7

                    &:hover
                      opacity 1

            &.done
              td
                label
                  &.todo-name
                    color $doneColor
                    animation-name will-be-done
                    animation-duration 0.2s
                    font-style italic
                    text-decoration line-through

      &.sortting
        opacity 0.8

        table
          tbody
            tr
              width 100%
              cursor move

              td
                cursor move

                *
                  cursor move

        &.dragging
          opacity 0.5

    .todo-list-stat
      position fixed
      left 0
      right  0
      bottom 0
      border-top 1px dashed lightgrey
      padding 0 10px

      table
        tbody
          tr
            td
              padding 0
              line-height ($fontSize * 3)

              &.todo-social
                padding-left 10px
                color grey
                word-spacing 3px

                &:hover
                  color $color

              &.todo-filter
                text-align right
                padding-right ($fontSize / 3)

                .pretty
                  font-size ($fontSize * 0.8)
                  text-transform capitalize
                  margin 0

                  .todo-count
                    margin-left 2px
                    text-decoration underline

    .todo-conf-page
      position fixed
      z-index 999
      top 0
      right 0
      bottom 0
      left 0
      opacity 1
      animation-name will-be-shown
      animation-duration 0.2s
      padding $fontSize
      background-color rgba(255, 255, 255, 0.95)
      text-align center

      .flatpickr-calendar
        display inline-block
        box-shadow none
        border 1px dashed lightgrey

        .flatpickr-day
          &.selected
            border-color rgb(90, 90, 90)
            background-color rgb(90, 90, 90)

      table
        &.todo-conf-time
          tbody
            tr
              td
                input[type=text]
                  text-align center

        &.todo-conf-btns
          position fixed
          left 0
          right 0
          bottom 0
          border-top 1px dashed lightgrey

          tbody
            tr
              td
                padding 0
                vertical-align middle
                line-height ($fontSize * 3)
</style>
