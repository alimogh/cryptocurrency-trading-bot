const api = require('@marcius-capital/binance-api')
const Observer = require('./modules/observer')

const Exchange = require('./exchange')

class Trader extends Exchange {
    constructor(...args) {
        super(...args)

        this.orders = [] // Bufer open order
        this.balance = []
        this.symbolInfo = {} // basic requirements of the market

        // Observers
        this.$userData = new Observer()

        this.mountedTrader()
    }

    async mountedTrader() {
        // Init trader data
        const symbolInfo = this.symbolInfo = await this.getSymbolInfo()
        this.balance = await this.getBalance(symbolInfo.pair)
        this.orders = await this.getOrders()
        this.getUserData() // User data stream

        // Subscribe on signals for open a BUY position
        this.$signals.subscribe(signals => {
            // Will open position when trader data is ready, is buy signal and none open orders
            if (this.onTraderReady() && signals.buy && this.orders.length == 0) {
                this.createOrder()
            }
        })

        // Real-time account changes and updates data (balance, orders)
        this.$userData.subscribe(res => {
            if (res.event == 'outboundAccountInfo') {  // Update balance
                this.balance = res.balances.filter(i => i.asset == pair.baseAsset || i.asset == pair.quoteAsset)
            } else if (res.event == 'outboundAccountInfo') { // Upd order
                const index = this.orders.findIndex(i => i.id == res.id)
                if (index >= 0 && res.status == 'FILLED') this.createSellOrder({}, res.id)
            }
        })

    }

    createOrder() {
        const price = this.klines.slice(-1)[0].close
        const baseAssetBalance = this.balance.find(i => i.asset == this.symbolInfo.pair.baseAsset)
        const quantity = baseAssetBalance * (this.config.deposit / 100)

        if (quantity >= this.symbolInfo.minQuantity) {
            return console.error(`[trader] Min order ${this.symbolInfo.minQuantity} your position ${quantity} - ${(this.config.deposit)}% from deposit`)
        }

        return this.createBuyOrder({ price, quantity })
    }

    createBuyOrder({ price, quantity, side = 'BUY' }) {
        quantity = quantity.toFixed(this.symbolInfo.decimalPlaces)
        return api.rest.createOrder({ params: { symbol: this.config.symbol.toUpperCase(), price, quantity, side }, auth: this.auth })
            .then(order => {
                console.log('[trader] created buy order')
                this.order = this.order.concat([order]) // Add order to bufer
            })
            .catch(err => console.error(api.error(err)))
    }

    createSellOrder({ side = 'SELL' }, id) {
        let order = this.orders.find(i => i.id == id)
        order.price = (order.price * ((1 / 100) + 1)).toFixed(this.symbolInfo.precision)
        api.rest.createOrder({ params: { symbol: this.config.symbol.toUpperCase(), price: order.price, quantity: order.quantity, side }, auth: this.auth })
            .then(() => {
                console.log('[trader] created sell order')
                this.orders = this.orders.filter(i => i.id != id) // Remove order from bufer
            })
            .catch(err => console.error(api.error(err)))
    }

    getBalance(pair) {
        return api.rest.account({ auth: this.auth })
            .then(res => res.balances.filter(i => i.asset == pair.baseAsset || i.asset == pair.quoteAsset))
    }

    getOrders() {
        return api.rest.openOrders({ params: { symbol: 'BTCUSDT' }, auth: this.auth })
    }

    /**
     * Stream user data. Returns a lot of data about balance, orders etc.
     * @docs https://github.com/binance-exchange/binance-official-api-docs/blob/master/user-data-stream.md
     */

    getUserData() {
        api.stream.userData({ auth: this.auth }, cb => this.$userData.next(cb))
    }

    /**
     * Symbol information
     * "decimalPlaces" - cropping amount when placing an order
     * @returns {object} => { pair: {baseAsset: 'BTC', quoteAsset: 'USDT'}, decimalPlaces: 5,  minQuantity: 0.000001 }
     */

    getSymbolInfo() {
        const info = (data) => {
            const infoSymbol = data.symbols.find(i => i.symbol.toLowerCase() == this.config.symbol)
            const decimalPlaces = infoSymbol.filters.find(i => i.filterType == 'MIN_NOTIONAL').avgPriceMins
            const minQuantity = infoSymbol.filters.find(i => i.filterType == 'LOT_SIZE').minQty

            console.log(infoSymbol)

            const config = {
                pair: {
                    baseAsset: infoSymbol.baseAsset,
                    quoteAsset: infoSymbol.quoteAsset,
                },
                decimalPlaces,
                minQuantity,
                precision: infoSymbol.quotePrecision
            }

            return config
        }

        return api.rest.exchangeInfo()
            .then(res => info(res))
            .catch(err => console.error(api.error(err)))
    }


    /**
     * On ready trader class (symbol info, balance)
     * @returns {boolean}
     */
    onTraderReady() {
        return (Object.keys(this.symbolInfo).length > 0) && (this.balance.length > 0)
    }

}

module.exports = Trader