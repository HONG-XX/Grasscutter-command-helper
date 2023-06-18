const CracoLessPlugin = require('craco-less')
const path = require('path')
const resolve = dir => path.resolve(__dirname, dir)
module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
  webpack: {
    alias: {
      Components: resolve('src/components'),
      Public: resolve('src/public'),
      Pages: resolve('src/pages'),
      Utils: resolve('src/utils'),
    }
  }
};