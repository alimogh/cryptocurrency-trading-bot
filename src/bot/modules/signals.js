// Compares arrays and returns buy & sell boolean

const trendSignal = (a, b) => {
    return {
        buy: a.pop() < b.pop(),
        sell: a.pop() > b.pop(),
    }
}

const oscillatorSignal = (indicator, options) => {
    return {
        buy: indicator.pop() < options[0],
        sell: indicator.pop() > options[1]
    }
}

const schema = {
    bbands: ({ values, indicator }) => ({
        buy: values.close.pop() <  indicator.lower.pop(),
        sell: values.close.pop() > indicator.upper.pop(),
    }),
    rsi: ({ indicator, options = [40, 60] }) => oscillatorSignal(indicator, options),
    sma: ({ values, indicator }) => trendSignal(values.close, indicator),
}

module.exports = schema