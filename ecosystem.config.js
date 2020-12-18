module.exports = {
apps: [
    {
        name: "scoutio",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
        },
        env_test: {
            NODE_ENV: "test",
        },
        env_staging: {
            NODE_ENV: "staging",
        },
        env_development: {
            NODE_ENV: "development",
            watch: "."
        },
    },
]};
