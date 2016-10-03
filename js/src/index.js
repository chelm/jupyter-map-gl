import JupyterReact from 'jupyter-react-js';
import components from 'jupyter-glmap-components'; 
import react from 'react';
import reactDom from 'react-dom';

// An option component update method passed to every component
// when an update message is received over the comm, 
// components will dispatch an event to every other component 
const on_update = ( module, props ) => {
  components.dispatcher.dispatch({
    actionType: module.toLowerCase() + '_update',
    data: props 
  });
}

function load_ipython_extension () {
  requirejs([
      "base/js/namespace",
      "base/js/events",
  ], function( Jupyter, events ) {
      JupyterReact.init( Jupyter, events, 'react.gl', { components, on_update, save: false, react, reactDom } );
  });
}

module.exports = {
  load_ipython_extension: load_ipython_extension
};
