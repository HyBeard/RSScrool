const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/app.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
  },

  module: {
    rules: [
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[folder]_[name].[ext]',
          },
        },
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
        test: /\.(gif|png|jpe?g)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[folder]_[name].[ext]',
            },
          },
        ],
      },
    ],
  },


  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/html/index.html'),
      inject: 'body',
    }),
  ],
};
