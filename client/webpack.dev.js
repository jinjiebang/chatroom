const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
    mode: 'development',
    output: {
        filename: 'js/bundle.js',
        path: __dirname + '/dist'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: __dirname + './dist',
    },
    module: {
        rules: [{
            test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
            loader: 'file-loader',
            query: {
                name: '[name].[ext]',
                outputPath: 'images'
            }
        }
        ]
    },
    plugins:[
        new webpack.HotModuleReplacementPlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
            chunkFilename: 'css/[id].css'
        }),
    ]
});