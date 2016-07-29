if (window.require) {
    window.require.config({
        map: {
            "*" : {
                "react": "https://fb.me/react-15.2.1.min.js",
                "react-dom": "https://fb.me/react-dom-15.2.1.min.js"
            }
        }
    });
}

import JupyterReact from 'jupyter-react-js';
import components from './components'; 
import dispatcher from './components/dispatcher';

// An option component update method passed to every component
// when an update message is received over the comm, 
// components will dispatch an event to every other component 
const on_update = ( module, props ) => {
  dispatcher.dispatch({
    actionType: module.toLowerCase() + '_update',
    data: props 
  });
}

function load_ipython_extension () {
  requirejs([
      "base/js/namespace",
      "base/js/events",
  ], function( Jupyter, events ) {
      JupyterReact.init( Jupyter, events, 'react.gl', { components, on_update } );
  });
}

module.exports = {
  load_ipython_extension: load_ipython_extension
};
