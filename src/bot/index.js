// Technical analysis (TA) bot

const Trader = require('./trader')

class Bot extends Trader {
    constructor(...args) {
        super(...args)
    }
}

module.exports = Bot