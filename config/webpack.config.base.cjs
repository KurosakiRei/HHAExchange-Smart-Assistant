const path = require("path");
const webpack = require('webpack')

const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { VueLoaderPlugin } = require('vue-loader')

const webpackConfig = {
  resolve: {
    extensions: [".js", ".ts"],
  },
  optimization: {
    minimize: false,
    moduleIds: "named",
  },
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "../dist"),
  },
  target: "web",
  externals: {
    jquery: "$",
  },
  module: {
    rules: [
      {
        test: /\.m?ts$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [
              '\\.vue$'
            ],
            happyPackMode: false
          }
        },
      },
      {
        test: /\.less$/,
        use: ["style-loader", "css-loader", "less-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      }, {
        test: /\.(scss)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      }, {
        test: /\.vue$/,
        use: [
          /* config.module.rule('vue').use('vue-loader') */
          {
            loader: 'vue-loader',
          }
        ]
      },/* config.module.rule('svg') */
      {
        test: /\.(svg)(\?.*)?$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        }
      },
      /* config.module.rule('images') */
      {
        test: /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'img/[name].[hash:8][ext]'
        }
      },
      /* config.module.rule('media') */
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        type: 'asset',
        generator: {
          filename: 'media/[name].[hash:8][ext]'
        }
      },
      /* config.module.rule('fonts') */
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        type: 'asset',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      },
      /* config.module.rule('docx') — Epic 17: fax template inline */
      {
        test: /\.docx$/,
        type: 'asset/inline',
      },
      /* config.module.rule('pdf') — Epic 21: M11Q template inline */
      {
        test: /\.pdf$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: process.env.npm_config_report ? [new BundleAnalyzerPlugin()] : [new VueLoaderPlugin(),
  new webpack.DefinePlugin({
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  }),],
};

module.exports = webpackConfig;
