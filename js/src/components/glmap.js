import React from 'react';
import MapGL, {ScatterplotOverlay, ChoroplethOverlay} from 'react-map-gl';
import dispatcher from './dispatcher.js';
import rasterTileStyle from 'raster-tile-style';
import Immutable from 'immutable';
import autobind from 'autobind-decorator';

class GlMap extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      layerType: null,
      features: null,
      geojson: null,
      mapStyle: null,
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

  componentWillReceiveProps( newProps ) {
    if ( this.state.features && newProps.geojson && this.state.features.size != newProps.geojson.features.length ){
      this._updateFeatures( newProps.geojson );
    }
  }

  componentWillMount(){
    if ( !this.state.features || this.state.features.size != this.props.geojson.features.length ){
      this._updateFeatures( this.props.geojson );
    }

    if ( this.props.tileSource ) {
      const source = this.props.accessToken ? this.props.tileSource + `?access_token=${this.props.accessToken}` : this.props.tileSource;
      this.setState( { mapStyle: Immutable.fromJS(rasterTileStyle([source])) } );
    }

    dispatcher.register( payload => {
      if ( payload.actionType === 'glmap_update' ) {
        if ( payload.data.feature ) {
          const _geojson = this.state.geojson;
          _geojson.features.push( payload.data.feature );
          this._updateFeatures( _geojson );
        }
      }
    } );
  }

  _updateFeatures( geojson ) {
    let features;
    let layerType;
    switch ( geojson.features[0].geometry.type ) {
      case 'Point':
        features = Immutable.fromJS( geojson.features.map( f => f.geometry.coordinates ) );
        layerType = 'Point';
        break;
      case 'Polygon':
        features = Immutable.fromJS( geojson ).get('features');
        layerType = 'Polygon';
        break;
    }
    this.setState( { features, layerType, geojson } );
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
    const { features, layerType, mapStyle } = this.state;

    return (
      <div style={{ width: mapProps.width, height: mapProps.height }}> 
        <MapGL 
          { ...mapProps }
          mapStyle={ mapStyle } 
          onChangeViewport={ this._onChangeViewport }>
            { layerType === 'Point' && <ScatterplotOverlay
                { ...mapProps }
                { ...layerProps }
                locations={ features }
                renderWhileDragging={ true } 
              />
            }
            { layerType === 'Polygon' && <ChoroplethOverlay
                { ...mapProps }
                { ...layerProps }
                renderWhileDragging={ false }
                features={ features }
              />
            }
        </MapGL>
      </div>
    );
  }
}

export default GlMap;
