/** @typedef {import("restnio").RouteBack} RouteBack */

const { params } = require("restnio");


/** @type RouteBack */
module.exports = (router, rnio) => {
    router.all('/', (params, client) => {
        'Test'
    });
}