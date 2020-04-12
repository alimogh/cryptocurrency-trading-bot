// Observer pattern helps track changes
// RU: https://monsterlessons.com/project/lessons/observer-pattern-v-javascript

class Observer {
    constructor() {
        this.observers = []
    }

    subscribe(fn) {
        this.observers.push(fn)
    }

    unsubscribe(fn) {
        this.observers = this.observers.filter(subscriber => subscriber !== fn)
    }

    next(data) {
        this.observers.forEach(subscriber => subscriber(data))
    }
}

module.exports = Observer


