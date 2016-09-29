import React, {PropTypes, Component} from 'react';
import rtree from 'rtree';
import autobind from 'autobind-decorator';

import { CanvasOverlay } from 'react-map-gl';

export default class FootprintOverlay extends Component {

  tree: null

  constructor(props) {
    super(props);
    this.tree = rtree(9);
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
      this.props.notify({features: points || []});
      if ( points.length ) {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = fill;
        points.forEach( pnt => {
          this._renderGeom( pnt, ctx, zoom, project );
        });
      }
    }
  }

  _renderGeom( loc, ctx, zoom, project ) {
    if ( Math.floor( zoom ) < 5 ) {
      const px = project( loc.geometry.coordinates );
      ctx.beginPath();
      ctx.arc(px[0], px[1], Math.max(3, Math.floor( zoom * .75 )), 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // render footprint // ctx.fillRect(25,25,100,100);
      const ul = project( [ loc.properties.bounds[0], loc.properties.bounds[3] ] );
      const lr = project( [ loc.properties.bounds[2], loc.properties.bounds[1] ] );
      ctx.beginPath();
      ctx.rect(ul[0], ul[1], lr[0] - ul[0], ul[1] - lr[1]);
      ctx.stroke();
    }
  }

  render() {
    return (
      <CanvasOverlay { ...this.props } redraw={ this._redraw } />
    );
  }

};
