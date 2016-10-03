import React from 'react';
import MapGL, {ScatterplotOverlay, ChoroplethOverlay} from 'react-map-gl';
import FootprintOverlay from './footprint_overlay';
import dispatcher from './dispatcher.js';
import rasterTileStyle from 'raster-tile-style';
import Immutable from 'immutable';
import autobind from 'autobind-decorator';

class GlMap extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      mapStyle: null,
      layers: props.layers || [],
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
    if ( newProps.layers && this.state.layers.length != newProps.layers.length ){
      this._updateLayers( newProps.layers );
    }

    if ( newProps.tileSource ) {
      const { tileSource, width, height, latitude, longitude } = newProps
      const source = newProps.accessToken ? newProps.tileSource + `?access_token=${newProps.accessToken}` : newProps.tileSource;
      
      this.setState( { 
        viewport: { ...this.state.viewport, width, height, latitude, longitude }, 
        mapStyle: Immutable.fromJS( rasterTileStyle( [ source ] ) ) 
      } );
    }
    
  }

  componentWillMount(){
    if ( this.props.layers && this.state.layers !== this.props.layers.length ) {
      this._updateLayers( this.props.layers );
    }

    if ( this.props.tileSource ) {
      const source = this.props.accessToken ? this.props.tileSource + `?access_token=${this.props.accessToken}` : this.props.tileSource;
      this.setState( { mapStyle: Immutable.fromJS(rasterTileStyle([source])) } );
    } 

    dispatcher.register( payload => {
      if ( payload.actionType === 'glmap_update' ) {
        const { data = {} } = payload;
        if ( data.features && data.layerId ) {
          this._updateFeatures( data.layerId, data.features );
        } else if ( data.layers ) { 
          this._updateLayers( data.layers );
        }
      }
    } );
  }

  _updateFeatures( layerId, newFeatures ) {
    // find layer and set features... then set state
    const _layers = [ ...this.state.layers ];
    // prob dont need foreach, find would work
    _layers.forEach( layer => { 
      if ( layer.id === layerId ) {
        layer.features = layer.features.concat( newFeatures );  
      }
    }); 
    this.setState( { layers: [ ..._layers ] } );
  }

  _updateLayers( layers ){
    const _layers = layers.map( layer => {
      layer.features = layer.geojson.features;
      return layer;
    });
    this.setState( { layers: _layers } );
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

  buildLayers( layers, mapProps ) {
    return layers.map( ( layer, i ) => {
      const layerProps = { ...mapProps, ...layer.props, notify: this.notify_python, features: layer.features };
      if ( layer.type === 'footprint' ) {
        return <FootprintOverlay key={i} { ...layerProps } />;
      } else if ( layer.type === 'choropleth' ) {
        return <ChoroplethOverlay key={i} { ...layerProps } features={ Immutable.fromJS( layer.features.map( f => f.geometry.coordinates ) ) } />;
      } else if ( layer.type === 'scatter' ) {
        return <ScatterplotOverlay key={i} { ...layerProps } features={ Immutable.fromJS( layer.features ) } />;
      }
    });
  }

  @autobind
  notify_python( data ) {
    this.props.comm.send({ method: "notify", data } );
  }

  render() {
    const mapProps = { ...this.state.viewport, mapboxApiAccessToken: this.props.mapboxApiAccessToken };
    const { width, height } = this.state.viewport;
    const { mapStyle, layers } = this.state;

    return (
      <div style={{ width, height }}> 
        <MapGL { ...mapProps } mapStyle={ mapStyle } onChangeViewport={ this._onChangeViewport }>
          { this.buildLayers( layers, mapProps ) }
        </MapGL>
      </div>
    );
  }
}

export default GlMap;
