/** @typedef {import("restnio").RouteBack} RouteBack */

const { params } = require("restnio");

const head = `
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta property="og:site_name" content="Overvliegen A287">
<meta property="og:title" content="Overvliegen A287" />
<meta property="og:description" content="Startopdracht overvliegen." />
<meta property="og:image" itemprop="image" content="https://api.scouti.ng/overvliegen/turtle.gif">
<meta property="og:type" content="website" />
<meta property="og:updated_time" content="1440432930" />
<style>
* {
    font-family: monospace;
}
</style>`

/** @type RouteBack */
module.exports = (router, rnio) => {
    router.all('/', (params, client) => {
        if (params.pwd == 'bitterbal') {
            return `<html>
                ${head}
                <body>
                    <h2>Overvliegen A287</h2>
                    <span style="color: green">Goed codewoord!</span>
                    <h3>Weekopdracht: Kom als een schildpad.</h3>
                    Beste afdeling. Het is erg belangrijk dat jullie aankomende zaterdag allemaal verschijnen als schildpad. <br/>
                    Je mag helemaal zelf bedenken hoe je dit verzorgt. Als het niet duidelijk is dat je een schildpad bent dan zijn er wel strafpunten!
                    <br/><br/>
                    <h3>Alternatieve opdracht: Afwezig.</h3>
                    De afdeling die niet aanwezig kunnen zijn tijdens het overvliegen krijgen de volgende opdracht mee:<br/>
                    Stuur stipt om 2030 op zaterdag 19 maart een filmpje in de overvliegen appgroep van jezelf die een adtje trekt.
                    Dit mag gewoon een wateradt zijn als je geen alcohol wilt nuttigen.
                    Het is heel belangrijk dat je in het filmpje kan zien dat je een schildpad bent.
                    Maak dit zo mooi mogelijk; denk aan schmink, kleding, attributen, etc.
                    Na het adtten eet je nog een beschuitje en probeer je zo snel mogelijk te fluiten.
                    <br/><br/>
                    SUCCESS!!!<br/>
                    <img src="turtle.gif" alt="SchildpadGifje">
                </body>
            </html>`;
        } else {
            return `<html>
            ${head}
            <body>
                <h2>Overvliegen A287</h2>
                ${params.pwd ? '<span style="color: red">Fout codewoord!</span>': '<span style="color: orange">Codewoord ontbreekt!</span>'}
                <h3>Startopdracht: Vind het goede codewoord (9 letters)</h3>
                <form action="/overvliegen/" method="post">
                    <input type="password" id="pwd" name="pwd" minlength="9" maxlength="9" placeholder="Codewoord"><br>
                    <input type="submit" value="Login">
                </form>
            </body>
            </html>`
        }
    });

    router.use('/turtle.gif', rnio.serve(__dirname + '/turtle.gif', { cache: true, noFilename: true}));
}