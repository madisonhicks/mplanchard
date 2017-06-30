"""
DB models
"""

from marshmallow import Schema, fields, post_dump
from sqlalchemy import (
    func,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Table,
    Text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from werkzeug.exceptions import BadRequest, InternalServerError


Base = declarative_base()


class BaseSchema(Schema):
    """Do enveloping"""

    __many__ = 'results'

    @post_dump(pass_many=True)
    def envelope(self, data, many):
        """Wrap in the envelope"""
        if many and self.context.get('wrap', True):
            count = len(data)
            total = self.context.get('total', count)
            offset = self.context.get('offset', 0)
            limit = self.context.get('limit', 0)
            data = {
                'count': count,
                'total': total,
                'offset': offset,
                'limit': limit,
                self.__class__.__many__: data
            }
        return data


class Serializable:
    """Declarative base class"""

    class Schema(BaseSchema):
        """A schema for (de)serialization"""

    @classmethod
    def dump_many(cls, query, limit=None, offset=None,
                  *schema_args, **schema_kwargs) -> dict:
        """Dump a bunch of objects"""
        q = query
        total = q.count()

        if limit:
            q = q.limit(limit)
        if offset:
            q = q.offset(offset)

        items = q.all()

        context = {'limit': limit, 'offset': offset, 'total': total}

        sch = cls.Schema(
            *schema_args, context=context, many=True, **schema_kwargs
        )
        data, errors = sch.dump(items)

        if errors:
            raise InternalServerError(errors)
        return data

    def dump(self, *schema_args, **schema_kwargs) -> dict:
        """Dump the object"""
        sch = self.__class__.Schema(*schema_args, **schema_kwargs)
        data, errors = sch.dump(self)
        if errors:
            raise InternalServerError(errors)
        return data

    @classmethod
    def load(cls, to_load, *schema_args, **schema_kwargs):
        """Load a dict into an object"""
        sch = cls.Schema(*schema_args, **schema_kwargs)
        data, errors = sch.load(to_load)
        if errors:
            raise BadRequest(errors)
        inst = cls(**data)
        return inst


PostTagLinks = Table(
    'posttaglinks',
    Base.metadata,
    Column('tag_id', Integer, ForeignKey('tags.id')),
    Column('post_id', Integer, ForeignKey('posts.id')),
)


class Tag(Base, Serializable):
    """A tag denoting the content of a post"""
    __tablename__ = 'tags'

    class Schema(BaseSchema):
        """(De)serialization"""
        __minimal__ = ('id', 'name')
        id = fields.Integer()
        name = fields.String()

    class NestedSchema(Schema):
        id = fields.Integer()
        name = fields.String()

    id = Column(Integer, primary_key=True)
    name = Column(String)
    posts = relationship(
        'Post',
        back_populates='tags',
        secondary=PostTagLinks
    )

    def __str__(self):
        return self.name


class Post(Base, Serializable):
    """A post, containing some textual content"""
    __tablename__ = 'posts'

    class Schema(BaseSchema):
        """(De)serialization"""
        __minimal__ = ('id', 'title')
        id = fields.Integer()
        content = fields.String()
        title = fields.String()
        tags = fields.Nested(
            Tag.NestedSchema(
                only=Tag.Schema.__minimal__,
            ),
            many=True
        )

    id = Column(Integer, primary_key=True)
    content = Column(Text)
    title = Column(String)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now())

    tags = relationship(
        'Tag',
        back_populates='posts',
        secondary=PostTagLinks,
    )

    def __str__(self):
        return self.title
