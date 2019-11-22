const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
    entry: "./src/js/bootstrap.js",
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: "bootstrap.js",
    },
    mode: "development",
    plugins: [
        new CopyWebpackPlugin(['./src/www/index.html', './src/www/style.css'])
    ],
};
