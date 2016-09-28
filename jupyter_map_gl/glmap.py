from jupyter_react import Component

class GlMap(Component):
    module = 'GlMap'

    def __init__(self, **kwargs):
        super(GlMap, self).__init__(target_name='react.gl', props=kwargs.get('props', {}))
        self.on_msg(self._handle_msg)

    def add_feature(self, feature):
        self.send({ "method": "update", "props": {"feature": feature}})

    def _handle_msg(self, msg):
        print msg
