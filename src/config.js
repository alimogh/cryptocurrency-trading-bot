const config = {
    symbol: 'btcusdt',
    interval: '30m',
    deposit: 10, // 10%; 1/10 of deposit
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
    key: '',
    secret: ''
}

module.exports = {
    config,
    auth
}