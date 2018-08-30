const kit = require('nokit')
const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const CleanupPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const BLD_PATH = path.join(__dirname, 'ext', 'build');
const SRC_PATH = path.join(__dirname, 'src');
const IMG_PATH = path.join(SRC_PATH, 'img');
const NPM_PATH = path.join(__dirname, 'node_modules');

const fileLoaderCompiledName = '[name].[ext]';

const cssExtractor = new ExtractTextPlugin({
  filename: '[name].css',
  allChunks: true,
});

const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    plugins: [
      autoprefixer({
        browsers: ['last 3 versions'],
      }),
    ],
  },
};

const plugins = [
  new CleanupPlugin(BLD_PATH),
  new webpack.optimize.ModuleConcatenationPlugin(),
  cssExtractor,
];

if (kit.isProduction()) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({
    minimize: true,
    sourceMap: false,
    compress: {
      warnings: false,
    },
  }))
}

module.exports = {
  entry: {
    popup: 'src/js/popup.js',
    background: 'src/js/background.js'
  },
  output: {
    path: BLD_PATH,
    publicPath: '',
    filename: '[name].js',
  },
  resolve: {
    modules: [__dirname, NPM_PATH, IMG_PATH],
    alias: {
      vue$: 'vue/dist/vue.runtime.js',
    },
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
      options: {
        extractCSS: true,
      },
    }, {
      test: /\.css$/,
      loader: cssExtractor.extract({
        fallback: 'style-loader',
        use: [{
            loader: 'css-loader',
            options: {
              minimize: true,
            },
          },
          postcssLoader,
        ],
      }),
    }, {
      test: /\.(jpe?g|png)$/,
      loader: `file-loader?name=${fileLoaderCompiledName}`,
      include: IMG_PATH,
    }, {
      test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: `file-loader?name=${fileLoaderCompiledName}`,
    }, {
      test: /\.html$/,
      loaders: [{
        loader: `file-loader?name=${fileLoaderCompiledName}`,
      }, {
        loader: 'extract-loader',
      }, {
        loader: 'html-loader',
        options: {
          minimize: true,
        },
      }, ],
    }, ],
  },
  plugins,
};
