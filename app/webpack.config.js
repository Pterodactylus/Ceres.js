const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: '../../Ceres-v2.0.0.js',
    path: path.resolve(__dirname, 'dist'),
  },
};