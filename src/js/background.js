import moment from "moment"

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.sync.get('todos', (result) => {
    let todos = result.todos || []

    // get !todo.done todos
    todos = todos.filter((todo) => {
      return !todo.done
    })

    if (todos.length) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/build/icon_128.png',
        title: 'Don\'t forget!',
        message: 'You have ' + todos.length +
          ' things to do. Wake up, dude!'
      }, (notificationId) => {
        setTimeout(() => {
          chrome.notifications.clear(notificationId)
        }, 5000)
      })
    }
  })
})

export const setBadgeText = (todos) => {
  let undos = todos.filter((todo) => {
    return !todo.done
  })

  chrome.browserAction.setBadgeText({
    text: (undos.length || "").toString()
  })
}

const minutesAgo = moment().add(-5, 'minutes').format("YYYY-MM-DD HH:mm")
const minutesLater = moment().add(5, 'minutes').format("YYYY-MM-DD HH:mm")

const initialTodos = [{
  name: 'Install Tiny Todo. :-)',
  done: true,
  time: minutesAgo
}, {
  name: 'Click the "calendar" icon or time(below) to re-select deadline',
  done: false,
  time: minutesAgo
}, {
  name: 'Click the "x" icon to clear deadline',
  done: false,
  time: minutesAgo
}, {
  name: 'Doubleee clickkk tooo edittt & fixxx meee',
  done: false,
  time: minutesLater
}, {
  name: 'Click the "trash" icon to delete me',
  done: false,
  time: null
}, {
  name: 'Click the left-bottom "bar" icon to tune order',
  done: false,
  time: null
}, {
  name: 'Create your own todos',
  done: false,
  time: null
}, {
  name: 'Share Tiny Todo to Twitter!',
  done: false,
  time: null
}]

// when installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'install') {
    chrome.storage.sync.set({
      todos: initialTodos
    })
  } else if (details.reason == 'update') {
    chrome.alarms.create('reminder', {
      delayInMinutes: 0.1,
      periodInMinutes: 60 * 6 // alarm every 6 hours
    })
  } else {
    // XXX do nothing
  }
  chrome.storage.sync.get('todos', (result) => {
    setBadgeText(result.todos || [])
  })
})
