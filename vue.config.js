const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');
const nodeExternals = require('webpack-node-externals');
const merge = require('lodash.merge');

const TARGET_NODE = process.env.WEBPACK_TARGET === 'node';

const target = TARGET_NODE
  ? 'server'
  : 'client';

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  css: {
    extract: isProduction
  },
  configureWebpack: () => ({
    entry: `./src/entry-${target}`,
    target: TARGET_NODE ? 'node' : 'web',
    node: TARGET_NODE ? undefined : false,
    plugins: [
      TARGET_NODE
        ? new VueSSRServerPlugin()
        : new VueSSRClientPlugin()
    ],
    externals: TARGET_NODE ? nodeExternals({
      whitelist: /\.css$/
    }) : undefined,
    output: isProduction ? {
      libraryTarget: TARGET_NODE ? 'commonjs2' : undefined
    } : {
      filename: '[name].js',
      chunkFilename: 'js/[id].[chunkhash].js',
      publicPath: '/',
      libraryTarget: TARGET_NODE ? 'commonjs2' : undefined
    },
    optimization: {
      splitChunks: undefined
    }
  }),
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options =>
        merge(options, {
          optimizeSSR: false
        })
      );
  }
};
