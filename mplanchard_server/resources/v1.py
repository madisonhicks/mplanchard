"""
Resources for the v1 API
"""

from flask import current_app as app
from flask import request
from flask_restful import Resource
from werkzeug.exceptions import NotFound, BadRequest

from mplanchard_server.config import DEFAULT_LIMIT, DEFAULT_OFFSET
from mplanchard_server.models import Post
from mplanchard_server.version import __version__, __version_info__


class Version(Resource):
    """The server package version"""

    def get(self) -> dict:
        """Get the server package version"""
        return {
            'string': __version__,
            'major': __version_info__[0],
            'minor': __version_info__[1],
            'patch': __version_info__[2]
        }


class PostResource(Resource):
    """A blog post"""

    def get(self, post_id) -> dict:
        """Get a blog post"""
        post = app.db.query(Post).get(post_id)
        if post is None:
            raise NotFound

        return post.dump()


class PostCollection(Resource):
    """Get all posts"""

    def get(self) -> dict:
        try:
            limit = int(request.args.get('limit', DEFAULT_LIMIT))
            offset = int(request.args.get('offset', DEFAULT_OFFSET))
        except ValueError:
            raise BadRequest('limit and offset must be integers')
        query = app.db.query(Post)
        query = query.order_by(Post.created.desc())
        return Post.dump_many(query, limit=limit, offset=offset)
