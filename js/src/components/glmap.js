import React from 'react';
import MapGL, {ScatterplotOverlay} from 'react-map-gl';
import dispatcher from './dispatcher.js';
import rasterTileStyle from 'raster-tile-style';
import Immutable from 'immutable';
import autobind from 'autobind-decorator';

var tileSource = '//tile.stamen.com/toner/{z}/{x}/{y}.png';
var mapStyle = Immutable.fromJS(rasterTileStyle([tileSource]));

class Heatmap extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      viewport: {
        width: props.width || 500,
        height: props.height || 500,
        latitude: props.latitude || 0,
        longitude: props.longitude || 0,
        zoom: props.zoom || 2,
        startDragLngLat: null,
        isDragging: false
      },
      //mapStyle: mapStyle
    };
  }

  componentWillMount(){
    dispatcher.register( payload => {
      if ( payload.actionType === 'heatmap_update' ) {
        //this.setState({ payload.data })
      }
    } );
  }

  @autobind
  _onChangeViewport(opt) {
    if (this.props.onChangeViewport) {
      return this.props.onChangeViewport(opt);
    }
    this.setState({
      viewport: {
        latitude: opt.latitude,
        longitude: opt.longitude,
        zoom: opt.zoom,
        startDragLngLat: opt.startDragLngLat,
        isDragging: opt.isDragging
      }
    });
  }

  buildLocations( geojson ) {
    return Immutable.fromJS( geojson.features.map( f => f.geometry.coordinates ));
  }

  render() {
    const viewport = {...this.state.viewport, ...this.props}

    const locations = this.props.geojson ? this.buildLocations( this.props.geojson ) : null;
    
    return (
      <div style={{ width: viewport.width, height: viewport.height }}> 
        <MapGL 
          {...viewport} 
          onChangeViewport={ this._onChangeViewport } >
            <ScatterplotOverlay
              { ...viewport }
              locations={ locations }
              dotRadius={ 2 }
              globalOpacity={ .9 }
              compositeOperation="screen"
              dotFill="#1FBAD6"
              renderWhileDragging={true} 
            />
        </MapGL>
      </div>
    );
  }
}

export default Heatmap;
