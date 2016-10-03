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
          libraryTarget: 'umd'
      },
      resolve: {
        extensions: ['', '.js'],
        alias: {
          webworkify: 'webworkify-webpack',
          'mapbox-gl': path.resolve('./node_modules/mapbox-gl') //dist/mapbox-gl.js')
        }
      },
      //externals: [{'react': 'react'}],
      module : {
        loaders : [
          {
            test: /\.js?$/,
            exclude: /(node_modules|bower_components)/,
            loaders: [`babel?${JSON.stringify( babelSettings )}`]
          },
          {
            test: /\.js$/,
            include: path.resolve(__dirname, 'node_modules/webworkify/index.js'),
            loader: 'worker'
          },
          {
            test: /mapbox-gl.+\.js$/,
            loader: 'transform/cacheable?brfs'
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
