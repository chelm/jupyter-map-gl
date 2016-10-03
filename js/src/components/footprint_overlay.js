import React, {PropTypes, Component} from 'react';
import rtree from 'rtree';
import tilebelt from 'tilebelt';
import autobind from 'autobind-decorator';

import { CanvasOverlay } from 'react-map-gl';

export default class FootprintOverlay extends Component {

  tree: null

  constructor( props ) {
    super( props );
    this.tree = rtree( 9 );
    this.state = {
    };
  }

  componentWillReceiveProps( newProps ) {
    if ( this.props.features && this.props.features.length < newProps.features.length ) {
      const newFeatures = newProps.features.slice( this.props.features.length-1, -1 );
      this._indexFeatures( newFeatures );
    }
  }

  componentWillMount(){
    this._indexFeatures( this.props.features );
  }

  _indexFeatures( features ) {
    this.tree.geoJSON( {
      "type":"FeatureCollection",
      "features": features
    } );
  }

  // project center to pxy, find min/max pixel xy, unproject to lat/lon
  _getBounds( center, width, height, project, unproject ){
    const xy = project( center );
    const ul = unproject( [ xy[0] - ( width / 2 ), xy[1] - ( height / 2 ) ] );
    const lr = unproject( [ xy[0] + ( width / 2 ), xy[1] + ( height / 2 ) ] );
    return [ ul[0], lr[1], lr[0], ul[1] ];
  }

  @autobind
  _redraw( opts ) {
    const { ctx, project, unproject, width, height } = opts;
    opts.ctx.clearRect(0, 0, width, height);

    if ( !opts.isDragging ) {
      const { longitude, latitude, fill = '#1FBAD6', stroke = '#ffffff', strokeWidth = 1, zoom } = this.props;
      const bounds = this._getBounds( [ longitude, latitude ], width, height, project, unproject ) ;
      const points = this.tree.bbox( ...bounds );
      if ( points.length ) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = fill;
        let tiles = [];
        points.forEach( pnt => {
          const pntTiles = this._renderGeom( pnt, ctx, zoom, project, width, height );
          pntTiles.forEach( pTile => tiles.push( pTile ) )
        });
        this.props.notify( { features: tiles } );
      } else {
        this.props.notify( { features: [] } );
      }
    }
  }

  _bboxToTiles( bbox, zoom ) {
    const tiles = [];
    const ll = tilebelt.pointToTile( bbox[0], bbox[1], zoom );
    const ur = tilebelt.pointToTile( bbox[2], bbox[3], zoom );
    
    for ( let i = ll[0]; i < Math.min(ur[ 0 ], 2**zoom); i++ ) {
      for ( let j = ur[1]; j < Math.min(ll[ 1 ], 2**zoom); j++ ) {
        tiles.push( [ i, j, zoom ] );
      }
    }
    return tiles;
  }

  _renderBox( ctx, bbox, project, width, height ) {
    const ul = project( [ bbox[0], bbox[3] ] );
    const lr = project( [ bbox[2], bbox[1] ] );
    const buf = -50.0;
    const shouldDraw = ( ul[0] > buf && ul[0] < width + Math.abs( buf ) ) && ( ul[1] > buf && ul[1] < height + Math.abs( buf ) ) 
      //&& ( lr[0] < width + (buf * -1) && lr[0] < buf );
    if ( shouldDraw ) {
      ctx.beginPath();
      ctx.rect(ul[0], ul[1], lr[0] - ul[0], lr[1] - ul[1]);
      ctx.stroke();
    } 
    return shouldDraw;
  }

  @autobind
  _renderGeom( loc, ctx, zoom, project, width, height ) {
    const tileSet = [];
    if ( Math.floor( zoom ) < 5 ) {
      const px = project( loc.properties.center.coordinates );
      ctx.beginPath();
      ctx.arc( px[0], px[1], Math.max(3, Math.floor( zoom * .75 )), 0, 2 * Math.PI );
      ctx.fill();
    } else if ( Math.floor( zoom ) <= 8 ){
      this._renderBox( ctx, loc.properties.bounds, project, width, height );
    } else if ( Math.floor( zoom ) > 8 ) {
      const tiles = this._bboxToTiles( loc.properties.bounds, 15 );
      tiles.forEach( tile => {
        const bbox = tilebelt.tileToBBOX( tile );
        const _drawn = this._renderBox( ctx, bbox, project, width, height );
        if ( _drawn ) {
          const _loc = { ...loc, properties: { ...loc.properties, zxy: tile, bounds: bbox } };
          tileSet.push( _loc ); 
        }
      });
    }
    return tileSet;
  }

  render() {
    return (
      <CanvasOverlay key={ 'canvas' } { ...this.props } isDragging={ false } redraw={ this._redraw } />
    );
  }

};
