const api = require('@marcius-capital/binance-api') // Binance exchange

// Modules
const indicators = require('./modules/indicators')
const signals = require('./modules/signals')

const Observer = require('./modules/observer')

class Exchange {
    constructor({ config, auth }) {
        // Init data
        this.config = config
        this.auth = auth

        this.klines = []
        this.limit = 50

        // Observers
        this.$klines = new Observer()
        this.$signals = new Observer()

        this.checkApi(this.auth) // Validate API keys
            .then(() => this.mountedExchange())
    }

    mountedExchange() {
        console.log('[Bot] started')
        this.getKlines(this.config.symbol, this.config.interval)
            .then(res => this.klines = res)
            .then(() => this.getKline(this.config.symbol, this.config.interval))


        this.$klines.subscribe(klines => {
            const indicators = this.getIndicators(klines, this.config.indicators)
            this.$signals.next(this.getSignals(klines, indicators))
        })

    }

    stop() {
        console.log('[Bot] stoped')
        // api.stream.close.kline({ symbol: this.config.symbol })
        // this.$klines.unsubscribe()
        // this.$signals.unsubscribe()
    }

    /**
     * Rest request - klines
     * @returns {array} => [{ open: 0.1, high: 0.1, low: 0.1, close: 0.1 }, ... ]
     */

    getKlines(symbol, interval) {
        return api.rest.klines({ symbol: symbol.toUpperCase(), interval, limit: this.limit })
    }

    /**
    * Stream request - kline
    * @returns {object} => { open: 0.1, high: 0.1, low: 0.1, close: 0.1 }
    */

    getKline(symbol, interval) {
        api.stream.kline({ symbol, interval }, cb => this.updateKlines(cb))
    }

    /**
     * Transform data to the appropriate format
     * @returns {object} => {open: [0.01, ... ], close: [0.05, ... ], high: [0.01, ...], low: [0.01, ...] }
     */

    updateKlines(kline) {
        const lastItem = this.klines.slice(-1)[0]

        // Update last item in arr or add new one
        if (kline.closeTime == lastItem.closeTime) {
            const index = this.klines.findIndex(i => i.closeTime == kline.closeTime)
            this.klines[index] = kline
        } else if (kline.closeTime > lastItem.closeTime) {
            this.klines = this.klines.concat([kline]).slice(-this.limit)
        }

        // Transform klines in appropriate format
        const map = (res, price = 'close') => res.map(i => parseFloat(i[price]))
        const klines = { open: map(this.klines, 'open'), close: map(this.klines, 'close'), high: map(this.klines, 'high'), low: map(this.klines, 'low'), }
        this.$klines.next(klines) // Emit to Observer
    }

    /**
	 * Get output data of indicators that are used in the config
	 * @returns {object} => { bbands: {lower: [], middle: [], close: []}, rsi: [] }
	 */

    getIndicators(klines, indicatorsConfig) {
        return indicatorsConfig.reduce((result, item) => {
            result[item.symbol] = indicators[item.symbol](klines, item.options)
            return result
        }, {})
    }

    /**
     * Compare klines data with indicators
     * @returns {object} => {buy: false, sell: false}
     */

    getSignals(values, indicators) {
        // return { bbands: { buy: false, sell: false }, rsi: { buy: false, sell: false } }
        const _signals = Object.keys(indicators).reduce((result, item) => {
            result[item] = signals[item]({ values, indicator: indicators[item] })
            return result
        }, {})

        return {
            buy: Object.values(_signals).map(i => i.buy).every(i => i),
            sell: Object.values(_signals).map(i => i.sell).every(i => i),
        }
    }

    /**
     * Check API, return TRUE or ERR
     * @returns {boolean|string} => true | Error: -2014: API-key format invalid.
     */

    checkApi(auth = {}) {
        return api.rest.account({ auth })
            .then(() => true)
            .catch(err => {
                throw new Error(api.error(err))
            })
    }

}

module.exports = Exchange