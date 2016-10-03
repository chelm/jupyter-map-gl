var webpack = require('webpack');
var version = require('./package.json').version;
var path = require( 'path' );

const babelSettings = {
  plugins: [
    'transform-flow-strip-types',
    'add-module-exports',
    'transform-regenerator',
    'transform-decorators-legacy'
  ],
  presets: [ 'es2015', 'react', 'stage-1' ]
};


module.exports = [
    {
      entry: './src/index.js',
      output: {
          filename: 'index.js',
          path: '../jupyter_map_gl/static',
          libraryTarget: 'amd'
      },
      plugins:[
        new webpack.DefinePlugin({
          'process.env':{
            'NODE_ENV': JSON.stringify('production')
          }
        })
      ],
      module : {
        loaders : [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: [`babel?${JSON.stringify( babelSettings )}`]
          },
          { 
            test: /\.css$/, loader: "style-loader!css-loader" 
          },
          {
            test: /\.json$/, loader: 'json-loader'
          }
        ]
      }
    }
];
