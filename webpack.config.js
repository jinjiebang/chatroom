const nodeExternals = require('webpack-node-externals')
module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    target: 'node',
    entry: {
        app: "./src/app.ts"
    },
    output: {
        filename: "app.js",
        path: __dirname + '/bin'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },
    externals:[
        new nodeExternals()
    ]
};