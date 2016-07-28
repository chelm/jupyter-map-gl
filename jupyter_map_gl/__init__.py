from .glmap import GlMap

def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'static',
        'dest': 'jupyter_map_gl',
        'require': 'jupyter_map_gl/index'
    }]
