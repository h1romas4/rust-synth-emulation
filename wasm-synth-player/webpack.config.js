const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./src/js/bootstrap.js",
    output: {
        path: path.resolve(__dirname, "../dist"), // eslint-disable-line
        filename: "bootstrap.js",
    },
    mode: "development",
    plugins: [
        new CopyWebpackPlugin(['./src/www/index.html', './src/www/style.css'])
    ],
    module: {
        rules: [
            {
                test: /.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.wasm'],
        modules: [
            "node_modules"
        ]
    },
};
