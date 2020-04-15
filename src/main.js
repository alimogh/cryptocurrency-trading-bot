const { config, auth } = require('./config')
const Bot = require('./bot')

// Init bot
new Bot({ config, auth })