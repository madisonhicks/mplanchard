"""
setup module for ihiji_schemas
"""

from os.path import dirname, join, realpath
from setuptools import setup, find_packages


NAME = 'mplanchard_server'
URL = 'https://github.com/mplanchard/mplanchard'
AUTHOR = 'Matthew Planchard'
EMAIL = 'msplanchard@gmail.com'

SHORT_DESC = 'A personal website for learning & experimentation'
LONG_DESC = (
    'This is just a small personal project for learning & experimentation.'
)
KEYWORDS = [
    'website',
    'react',
    'flask',
    'personal',
    'non-production'
]

PACKAGE_DEPENDENCIES = [
]
SETUP_DEPENDENCIES = [
]
TEST_DEPENDENCIES = [
]
EXTRAS_DEPENDENCIES = {}

ENTRY_POINTS = {}

with open('requirements.txt') as reqfile:
    for ln in reqfile.readlines():
        if not ln.startswith('#'):
            PACKAGE_DEPENDENCIES.append(ln.strip())

# See https://pypi.python.org/pypi?%3Aaction=list_classifiers for all
# available setup classifiers
CLASSIFIERS = [
    'Development Status :: 3 - Alpha',
    # 'Development Status :: 5 - Production/Stable',
    'Environment :: Web Environment',
    'Framework :: Flask',
    'Intended Audience :: End Users/Desktop',
    # 'Intended Audience :: Developers'
    # 'License :: Other/Proprietary License',
    # 'License :: OSI Approved :: GNU General Public License v3 (GPLv3)',
    'License :: OSI Approved :: MIT License',
    'Natural Language :: English',
    'Operating System :: POSIX :: Linux',
    'Programming Language :: Python',
    'Programming Language :: Python :: 3 :: Only',
]


__version__ = '0.0.0'

cwd = dirname(realpath(__file__))

with open(join(cwd, '{0}/version.py'.format(NAME))) as version_file:
    for line in version_file:
        # This will populate the __version__ and __version_info__ variables
        if line.startswith('__'):
            exec(line)

setup(
    name=NAME,
    version=__version__,
    description=SHORT_DESC,
    long_description=LONG_DESC,
    url=URL,
    author=AUTHOR,
    author_email=EMAIL,
    classifiers=CLASSIFIERS,
    keywords=KEYWORDS,
    packages=find_packages(exclude=['*.tests', '*.tests.*']),
    install_requires=PACKAGE_DEPENDENCIES,
    setup_requires=SETUP_DEPENDENCIES,
    tests_require=TEST_DEPENDENCIES,
    extras_require=EXTRAS_DEPENDENCIES,
)
