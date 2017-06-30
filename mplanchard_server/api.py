"""
The v1 API
"""

from logging import getLogger

from flask import Blueprint, Flask
from flask_restful import Api

from mplanchard_server.resources import v1


log = getLogger(__name__)


def register_v1(app: Flask):
    """Add the V1 API to the passed application"""
    log.debug('Adding v1 API to %s', app)

    blueprint = Blueprint('api.v1', app.import_name, url_prefix='/api/v1')

    api = Api(blueprint)
    api.add_resource(v1.Version, '/version')
    api.add_resource(v1.PostResource, '/posts/<int:post_id>')
    api.add_resource(v1.PostCollection, '/posts')

    app.register_blueprint(blueprint)
