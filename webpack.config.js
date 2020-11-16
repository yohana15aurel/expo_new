const path = require('path');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const config = {
    watch: true,
    entry: [
      './assets/js/scripts/main.js'
    ],
    output: {
      filename: 'main-dist.js',
      path: path.resolve(__dirname, 'assets/js'),
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: []
            }
          }
        }
      ]
    }
  };

  if (!isDevelopment) {
    config.watch = false;
  }

  return config;
};
