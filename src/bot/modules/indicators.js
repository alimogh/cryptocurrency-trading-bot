// https://tulipindicators.org/list
// https://www.npmjs.com/package/tulind
const tulind = require('tulind')

// Simplify the work with data
// bbands: [[2,3,4], [2,3,4], ... ] => {lower: [2,3,4], upper: [2,3,4], ... }
const resultWrapper = (response, schema) => {
    return response.reduce((result, item, index) => {
        if (schema.length == 0) return result = item
        result[schema[index]] = item
        return result
    }, {})
}

// Make response synchronous
const indicator = ({ indicator, values, options }, schema = []) => {
    let indicators = null
    tulind.indicators[indicator].indicator([values], options, (err, res) => {
        if (err) console.error(err)
        indicators = resultWrapper(res, schema)
    })
    return indicators
}

const schema = {
    bbands: (values, options = [5, 3]) => indicator({ indicator: 'bbands', values: values.close, options }, ['lower', 'middle', 'upper']), //  options: [ 'period', 'stddev' ], result: ['lower', 'middle', 'upper']
    rsi: (values, options = [14]) => indicator({ indicator: 'rsi', values: values.close, options }),
    sma: (values, options = [5]) => indicator({ indicator: 'sma', values: values.close, options }),
}


module.exports = schema