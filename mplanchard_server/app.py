"""
Main app module
"""

from logging import getLogger
from os import path
from uuid import uuid4

from flask import Flask, render_template, request
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from werkzeug.exceptions import Unauthorized

from ._logging import configure_logging
from . import api, flask_config
from .config import ADMIN_TOKEN, DEFAULT_ADMIN_TOKEN, SQLALCHEMY_DB_URL
from .models import Post, Tag


log = getLogger(__name__)


TEMPLATE_DIR = path.realpath(
    path.join(path.dirname(__file__), '../client/build')
)
STATIC_DIR = path.join(TEMPLATE_DIR, 'static')


class FlaskWithDB(Flask):
    """Flask with a DB object"""
    db = None  # type: scoped_session


def get_scoped_session():
    """Return a scoped session"""
    engine = create_engine(SQLALCHEMY_DB_URL)
    session_factory = sessionmaker(bind=engine)
    session_class = scoped_session(session_factory)
    return session_class


class AdminModelView(ModelView):
    """Custom Auth"""

    def is_accessible(self):
        """Check the token"""
        token = request.headers.get('X_AUTH_TOKEN')
        if ADMIN_TOKEN == DEFAULT_ADMIN_TOKEN:
            # ensure that the default admin token can only be used
            # locally during development
            if 'localhost' not in SQLALCHEMY_DB_URL:
                return False
            if 'localhost' not in request.host:
                return False
        return token is not None and token == ADMIN_TOKEN

    def inaccessible_callback(self, name, **kwargs):
        """Raise"""
        raise Unauthorized


def create_app():
    """Instantiate the Flask application"""
    configure_logging()
    log.info('Instantiating application instance')
    app = FlaskWithDB(
        'mplanchard',
        static_folder=STATIC_DIR,
        template_folder=TEMPLATE_DIR
    )
    app.config.from_object(flask_config)
    app.db = get_scoped_session()

    @app.teardown_appcontext
    def remove_session(exception=None):
        """Remove the session from the app"""
        app.db.remove()

    @app.route('/', methods=['GET'])
    def index():
        """Render index template"""
        return render_template('index.html')

    @app.route('/<path:path>', methods=['GET'])
    def any_root(path: str):
        """Return the index for any root path"""
        log.debug('Sending index for request to root path "%s"', path)
        return render_template('index.html')

    api.register_v1(app)
    admin = Admin(app, name='mplanchard_blog', template_mode='bootstrap3')

    app.secret_key = str(uuid4()).encode()
    admin.add_view(AdminModelView(Post, app.db))
    admin.add_view(AdminModelView(Tag, app.db))

    return app
