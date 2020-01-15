const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const webpack = require('webpack');

const ENV = process.env.npm_lifecycle_event;
const isDev = ENV === 'dev';
const isProd = ENV === 'build';

function setDevTool() {
  if (isDev) {
    return 'cheap-module-eval-source-map';
  }
  return 'none';
}

function setMode() {
  if (isProd) {
    return 'production';
  }
  return 'development';
}

const config = {
  target: 'web',
  entry: {
    app: path.resolve(__dirname, 'src/app.js'),
    landingpage: path.resolve(__dirname, 'src/index.js'),
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
  },
  mode: setMode(),
  devtool: setDevTool(),
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              minimize: false,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: true, config: { path: './postcss.config.js' } },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'postcss-loader',
            options: { sourceMap: true, config: { path: './postcss.config.js' } },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'img',
              name: '[folder]_[name].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                processive: true,
                quality: 98,
              },
            },
          },
        ],
      },
      {
        test: /\.(svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'icons/[folder]_[name].[ext]',
          },
        },
      },
      {
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              name: '[folder]_[name].[ext]',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'src/html/app.html'),
      inject: 'body',
      favicon: './src/assets/favicon/fav16.png',
      chunksSortMode: 'manual',
      filename: 'app.html',
      chunks: ['app'],
    }),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, 'src/html/landingpage.html'),
      inject: 'body',
      favicon: './src/assets/favicon/fav16.png',
      chunksSortMode: 'manual',
      chunks: ['landingpage'],
    }),
    new MiniCssExtractPlugin({
      moduleFilename: ({ name }) => `${name.replace('/js/', '/css/')}.css`,
    }),
    new webpack.DefinePlugin({
      API_KEY: JSON.stringify(process.env.API_KEY),
      APP_ENV: JSON.stringify(process.env.APP_ENV),
    }),
  ],

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8080,
    stats: 'errors-only',
    clientLogLevel: 'none',
  },
};

if (isProd) {
  config.plugins.push(new UglifyJSPlugin());
}

module.exports = config;
