"""
Flask configuration
"""

from os import getenv


DEBUG = getenv('FLASK_DEBUG', False)
SESSION_TYPE = 'filesystem'  # only for admin interface
