import React from 'react';
import MapGL, {ScatterplotOverlay, ChoroplethOverlay} from 'react-map-gl';
import dispatcher from './dispatcher.js';
import rasterTileStyle from 'raster-tile-style';
import Immutable from 'immutable';
import autobind from 'autobind-decorator';

//var tileSource = '//tile.stamen.com/toner/{z}/{x}/{y}.png';
//var mapStyle = Immutable.fromJS(rasterTileStyle([tileSource]));

class GlMap extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      viewport: {
        width: props.width || 500,
        height: props.height || 500,
        latitude: props.latitude || 0,
        longitude: props.longitude || 0,
        zoom: props.zoom || 2,
        showZoomControls: props.showZoomControls || true,
        startDragLngLat: null,
        isDragging: null
      },
    };
  }

  componentWillMount(){
    dispatcher.register( payload => {
      if ( payload.actionType === 'glmap_update' ) {
        //this.setState({ payload.data })
      }
    } );
  }

  @autobind
  _onChangeViewport(opt) {
    if (this.props.onChangeViewport) {
      return this.props.onChangeViewport(opt);
    }
    const viewport =  {
      ...this.state.viewport,
      zoom: opt.zoom,
      latitude: opt.latitude,
      longitude: opt.longitude,
      startDragLngLat: opt.startDragLngLat,
      isDragging: opt.isDragging
    };

    this.setState( { viewport } );
  }

  render() {
    const mapProps = { ...this.state.viewport, mapboxApiAccessToken: this.props.mapboxApiAccessToken }
    const layerProps = { ...this.props.layerProps };
    const { geojson } = this.props;

    let points;
    let polygons; 

    if ( geojson ) { 
      switch ( geojson.features[0].geometry.type ) {
        case 'Point':
          points = Immutable.fromJS( geojson.features.map( f => f.geometry.coordinates ) );
          break;
        case 'Polygon': 
          polygons = Immutable.fromJS( geojson )
          break; 
      }
    }

    return (
      <div style={{ width: mapProps.width, height: mapProps.height }}> 
        <MapGL 
          { ...mapProps } 
          onChangeViewport={ this._onChangeViewport }>
            { points && <ScatterplotOverlay
                { ...mapProps }
                { ...layerProps }
                locations={ points }
                renderWhileDragging={ true } 
              />
            }
            { polygons && <ChoroplethOverlay
                { ...mapProps }
                { ...layerProps }
                renderWhileDragging={ true }
                features={ polygons.get('features') }
              />
            }
        </MapGL>
      </div>
    );
  }
}

export default GlMap;
