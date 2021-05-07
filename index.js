/**
 * ======= Scouti.ng =======
 * Entrypoint of the backend.
 * ======= Scouti.ng =======
 */

// Imports
const RestNio = require('restnio');
new RestNio((router, rnio) => {

    // Import the main site.
    router.use('', require('./www'));

    // router.use('/api/games/')
}, {
    port: 7070
}).bind();
