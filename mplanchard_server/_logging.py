"""
This module configures the package's logging configuration
"""


import logging
from os import getenv
from sys import stdout


def configure_logging():
    """Configure stdout logging"""
    pkg_log = logging.getLogger('mplanchard_server')
    handler = logging.StreamHandler(stdout)
    formatter = logging.Formatter(
        '%(asctime)s - %(levelName)s - %(module)s: %(message)s')
    handler.setLevel(getenv('LOG_LEVEL', 'INFO').upper())
    handler.setFormatter(formatter)
    pkg_log.handlers = [handler]
