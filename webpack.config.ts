import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import StatoscopePlugin from '@statoscope/webpack-plugin';
const nodeExternals = require('webpack-node-externals');

import ModuleLogger from './plugins/moduleLogger';

const config: webpack.Configuration = {
    mode: 'production',
    entry: {
        root: './src/pages/root.tsx',
        root2: './src/pages/root2.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
    },
    plugins: [
        new HtmlWebpackPlugin(),
        new ModuleLogger(),
        new StatoscopePlugin({
            saveStatsTo: 'stats.json',
            saveOnlyStats: false,
            open: false,
        }),
    ],
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer"),
            "stream": false,
        },
        extensions: [".tsx", ".ts", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: "ts-loader",
                exclude: ["/node_modules/"],
            }
        ],
    },
    optimization: {
        minimize: true,
        moduleIds: 'deterministic',
        innerGraph: true,
        concatenateModules: true,
        splitChunks: {
            minChunks: 2,
            chunks: 'all',
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                },
            },
        },
    },
    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    },
    target: 'node',
    externals: [nodeExternals()],
    externalsPresets: {
        node: true,
    },
};

export default config;