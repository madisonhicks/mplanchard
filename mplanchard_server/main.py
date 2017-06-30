"""
This module provides an "app" variable that references an instantiated
Flask application for use in uwsgi application managers like uwsgi-emperor
or gunicorn
"""

from os import environ

from mplanchard_server.app import create_app


app = create_app()


if __name__ == '__main__':
    environ['MP_BLOG_TESTING'] = '1'
    try:
        app.run(debug=True)
    finally:
        del environ['MP_BLOG_TESTING']
