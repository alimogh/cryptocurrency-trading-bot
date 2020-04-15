# Cryptocurrency trading bot

Example of a simple trading bot on nodejs with WebSockets. 
Exchange **Binance**. Indicators used (add more if necessary).

* Bollinger Bands (BBands)
* Relative Strength Index (RSI)
* Simple Moving Avarage (SMA)

Bot will open a position with indicators and close with profit +1% (can change in config).

### Denial of responsibility

Bot was created for learning. It's not ready for production. Use at your own risk.

## Init

Indicator's lib [tulind](https://github.com/TulipCharts/tulipnode). Full list of indicatores with options https://tulipindicators.org/list.

### Install

Required installed [Node.js](https://nodejs.org/en/)

```node
$ npm i
$ yarn
```

*If you have questions during installation, read [tulind](https://github.com/TulipCharts/tulipnode#installation) docs (need for Windows OS).*

### Run

```node
$ node src/main.js
$ npm run dev  // for development
```

### [config.js](/src/config.js)

Set up ur options.

```javascript
const config = {
    symbol: 'btcusdt',
    interval: '30m', 
    deposit: 10, // 10%, 1/10 from depo
    profit: 1, // 1%
    indicators: [
        {
            symbol: 'bbands',
            options: [5, 3], // period, stddev
        },
        {
            symbol: 'rsi',
            options: [14], // period
        }
    ]
}

const auth = {
    key: '<YOUR-KEY>',
    secret: '<YOUR-SECRET>'
}

module.exports = {
    config,
    auth
}
```

## TODO

* ~~Trading bot~~
* Open positions with a ladder orders
* Backtesting

## Stay in touch

Feel free to ask questions 😊

* Reddit: https://reddit.com/r/MarciusCapital
* Discord: https://discordapp.com/invite/DaWfrPx