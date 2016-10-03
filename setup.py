from setuptools import setup
from setuptools.command.develop import develop as _develop
from setuptools.command.install import install as _install
from notebook.nbextensions import install_nbextension
from notebook.services.config import ConfigManager
import os

extension_dir = os.path.join(os.path.dirname(__file__), "jupyter_map_gl", "static")

class develop(_develop):
    def run(self):
        _develop.run(self)
        install_nbextension(extension_dir, symlink=True,
                            overwrite=True, user=False, destination="jupyter_map_gl")
        cm = ConfigManager()
        cm.update('notebook', {"load_extensions": {"jupyter_map_gl/index": True } })

class install(_install):
    def run(self):
        _install.run(self)
        cm = ConfigManager()
        cm.update('notebook', {"load_extensions": {"jupyter_map_gl/index": True } })

setup(name='jupyter-map-gl',
      cmdclass={'develop': develop, 'install': install},
      version='0.2.2',
      description='A wrapper around react-map-gl components for use in jupyter notebooks',
      url='https://bitbucket.com/timbr-io/jupyter-map-gl',
      author='Chris Helm',
      author_email='chelm@timbr.io',
      license='MIT',
      packages=['jupyter_map_gl'],
      zip_safe=False,
      data_files=[
        ('share/jupyter/nbextensions/jupyter_map_gl', [
            'jupyter_map_gl/static/index.js'
        ]),
      ],
      install_requires=[
          "ipython",
          "jupyter-react"
        ]
      )
