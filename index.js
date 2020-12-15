/**
 * ======= Scouti.ng =======
 * Entrypoint of the backend.
 * ======= Scouti.ng =======
 */

// Imports
const RestNio = require('restnio');
new RestNio((router, rnio) => {
    router.get('/', () => "Serve index...");

    router.ws('/join', {
        params: {
            room: {
                type: 'string',
                required: true
            }
        },
        
    });

}, {
    port: 80
}).bind();