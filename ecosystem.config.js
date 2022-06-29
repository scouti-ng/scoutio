module.exports = {
apps: [
    {
        name: "scoutio",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
            githook: {
                command: 'git pull && npm i && pm2 restart scoutio',
                branch: 'main',
                port: 7777,
                secret: 'scoutiowepwop'
            }
        },
        env_test: {
            NODE_ENV: "test",
        },
        env_staging: {
            NODE_ENV: "staging",
        },
        env_development: {
            NODE_ENV: "development",
            watch: ".",
            ignore_watch : ['treealias.json']
        },
    },
]};
