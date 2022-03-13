/** @typedef {import("restnio").RouteBack} RouteBack */

const { params } = require("restnio");


/** @type RouteBack */
module.exports = (router, rnio) => {
    router.all('/', (params, client) => {
        if (params.pwd == 'bitterbal') {
            return `<html>
                <h2>Overvliegen A287</h2>
                <span style="color: green">Goed codewoord!</span>
                <h3>Weekopdracht: Kom als een schildpad.</h3>
                Beste afdeling. Het is erg belangrijk dat jullie aankomende zaterdag allemaal verschijnen als schildpad. <br/>
                Je mag helemaal zelf bedenken hoe je dit verzorgt. Als het niet duidelijk is dat je een schildpad bent dan zijn er wel strafpunten!
                <br/><br/>
                De afdeling die niet aanwezig kunnen zijn tijdens het overvliegen krijgen de volgende opdracht mee:<br/>
                Stuur stipt om 2030 een filmpje in de overvliegen appgroep van jezelf die een adtje trekt.
                Dit mag gewoon een wateradt zijn.
                Het is heel belangrijk dat je in het filmpje kan zien dat je een schildpad bent.
                Maak dit zo mooi mogelijk; denk aan schmink, kleding, attributen, etc.
                <br/><br/>
                SUCCESS!!!
                <img src="turtle.gif" alt="SchildpadGifje">
            </html>`;
        } else {
            return `<html>
            <h2>Overvliegen A287</h2>
            ${params.pwd ? '<span style="color: red">Fout codewoord!</span>': ''}
            <h3>Startopdracht: Vind het goede codewoord:</h3>
            <form action="/overvliegen/" method="post">
                <input type="password" id="pwd" name="pwd" placeholder="Password"><br>
                <input type="submit" value="Login">
            </form>
            </html>`
        }
    });

    router.use('/turtle.gif', rnio.serve(__dirname + '/turtle.gif', { cache: true, noFilename: true}));
}