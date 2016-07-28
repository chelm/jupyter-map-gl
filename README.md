Jupyter Map GL 

A little ReactJS component wrapper around https://github.com/uber/react-map-gl for use within a jupyter notebook. 

Showcases the use of: https://github.com/timbr-io/jupyter-react-js and https://github.com/timbr-io/jupyter-react. 

Example usage 

```python

from jupyter_map_gl import GlMap
from IPython.display import display

glmap = GlMap(props={'width':900, 
                 'height': 500,
                 'geojson': geojson, 
                 'mapboxApiAccessToken': 'YOUR_MB_TOKEN'
                })
display(glmap)
```
