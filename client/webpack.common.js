const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const seen = new Set();
const nameLength = 8;
module.exports = {
    entry: {
        app: './src/main.js'
    },
    plugins: [
        new OptimizeCssAssetsPlugin(),
        new CleanWebpackPlugin(),
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            title: "Chatroom",
            template: 'index.html'
        }),
        new CopyWebpackPlugin([
            {
                from: __dirname + '/favicon.ico',
                to: 'favicon.ico'
            }
        ]),
        new webpack.NamedChunksPlugin(chunk => {
            if (chunk.name) {
                return chunk.name;
            }
            const modules = Array.from(chunk.modulesIterable);
            if (modules.length > 1) {
                const hash = require("hash-sum");
                const joinedHash = hash(modules.map(m => m.id).join("_"));
                let len = nameLength;
                while (seen.has(joinedHash.substr(0, len))) len++;
                seen.add(joinedHash.substr(0, len));
                return `chunk-${joinedHash.substr(0, len)}`;
            } else {
                return modules[0].id;
            }
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: process.env.NODE_ENV === 'development',
                        publicPath: '../',
                    },
                },
                    'css-loader',
                {
                    loader: 'postcss-loader',
                    options: {

                        plugins: [require('autoprefixer')],

                        browser: ['last 10 versions']

                    }
                }
                ]
            },
            {
                test: /\.(htm|html)$/,
                use: [
                    'raw-loader'
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
        }
    },

    optimization: {
        splitChunks: {
            chunks: 'all'
        },
        runtimeChunk: true,
        moduleIds: 'hashed'
    },

};