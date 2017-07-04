import React, { Component } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';

import home from './md/home.md';
import projects from './md/projects.md';
import website_content_url from './md/website.md';

const hljs = window.hljs;


const CONST = {
  AUTHOR: 'Matthew Planchard',
  FIRST_YEAR_PUBLISHED: 2017,
  API: "/api/v1",
  POSTS: "/api/v1/posts",
  TAGS: "/api/v1/tags",
};


function year() {
  const dateObj = new Date();
  return dateObj.getFullYear();
}

function copyright_str(current_year) {
  let year_str;
  if (current_year !== CONST.FIRST_YEAR_PUBLISHED) {
    year_str = `${CONST.FIRST_YEAR_PUBLISHED} - ${current_year}`
  }
  else {
    year_str = `${CONST.FIRST_YEAR_PUBLISHED}`
  }
  return `© Copyright ${year_str}, ${CONST.AUTHOR}`
}


class CodeBlock extends React.Component{
    componentDidMount () {
        this.highlightCode();
    }

    componentDidUpdate () {
        this.highlightCode();
    }

    highlightCode  () {
        hljs.highlightBlock(this.refs.code);
    }

    render() {
        return (
            <pre>
              <code className={this.props.language} ref="code">
                {this.props.literal}
              </code>
            </pre>
        );
    }
}


function Title() {
  return (
    <div style={styles.title}>
      <h2 style={styles.titleText}>Matthew Planchard</h2>
    </div>
  );
}


function Footer() {
  return (
    <div style={styles.footer}>
      <p>{copyright_str(year())}</p>
    </div>
  );
}

function TwitterShareLink(props) {
  let url = 'https://twitter.com/intent/tweet';
  const text = encodeURIComponent(props.text);
  const via = 'mplanchard';

  url += `?text=${text}`;
  url += `&via=${via}`;
  url += `&url=${props.url}`;
  return (
    <div style={styles.shareLinkContainer}>
      <a href={url} style={styles.shareLinkText}>Share on Twitter</a>
    </div>
  )
}

class CopyUrlLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: props.url,
      copied: false,
    };
  }

  render() {
    if (!this.state.copied) {
      return (
        <div style={styles.shareLinkContainer}>
          <CopyToClipboard
            text={this.state.url}
            onCopy={() => this.setState({'copied': true})}>
              <span style={styles.shareLinkText}>Copy Link to Clipboard</span>
          </CopyToClipboard>
        </div>
      );
    }
    else {
      return (
        <div
            style={styles.shareLinkContainer}
            onClick={() => this.setState({'copied': false})}>
          <span style={styles.shareLinkText}>Copied!</span>
        </div>
      );
    }
  }
}


class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {'content': ''}
  }

  componentWillMount() {
    fetch(home)
      .then(response => response.text())
      .then(text => this.setState({'content': text}))
  }

  render () {
    return (
      <ReactMarkdown source={this.state.content}/>
    );
  }
}


async function getBlogPosts(limit=0, offset=0) {
  const url = `${CONST.POSTS}?limit=${limit}&offset=${offset}`;
  const resp = await fetch(
    url, {headers: {'Content-Type': 'application/json'}});
  return await resp.json();
}

async function getBlogPost(id) {
  const url = `${CONST.POSTS}/${id}`;
  const resp = await fetch(
    url, {headers: {'Content-Type': 'application/json'}});
  return await resp.json();
}


function PostShareButtons(props) {
  const share_url = process.env.PUBLIC_URL + `/blog/${props.post.id}`;
  return (
    <div style={styles.shareButtonContainer}>
      {/*<div style={styles.shareLinkContainer}>*/}
        {/*<span style={Object.assign({})}>(</span>*/}
      {/*</div>*/}
      <TwitterShareLink url={share_url} text={props.post.title}/>
      <CopyUrlLink url={share_url}/>
      {/*<span style={Object.assign({})}>)</span>*/}
    </div>
  )
}


class Post extends Component {
  constructor(props) {
    super(props);

    let post;
    let id;

    if ('post' in props) {
      post = props.post;
    } else {
      post = {'content': ''};
    }

    if ('id' in props) {
      id = props.id;
    } else {
      id = ('id' in props.match.params) ? parseInt(props.match.params.id, 10) : -1;
    }

    this.state = {
      'post': post, 'id': id, 'originalProps': Object.assign({}, props)
    };
  }

  componentWillMount() {
    if (!('post' in this.state.originalProps)) {
      getBlogPost(this.state.id).then(post => this.setState({'post': post}));
    }
  }

  render () {
    return (
      <div className="ui reading segmentpadding">
        <span style={styles.postTitleText}>{this.state.post.title}</span>
        <PostShareButtons post={this.state.post}/>
        <ReactMarkdown
          source={this.state.post.content}
          renderers={Object.assign(
            {},
            ReactMarkdown.renderers,
            {CodeBlock: CodeBlock})}/>
      </div>
    )
  }
}


class Blog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      'posts': [],
      'offset': 0,
      'limit': 1,
      'hasMore': true,
      'id': ('id' in props.match.params) ?
        parseInt(props.match.params.id, 10) : -1,
    };
    this.getPrevious = this.getPrevious.bind(this);
    this.getNext = this.getNext.bind(this);
  }

  getPosts(limit, offset) {
    getBlogPosts(limit, offset).then(posts => this.setState({
      'posts': posts.results,
      'hasMore': (posts.total > (posts.offset + posts.limit)),
      'id': posts.results[0].id,
    }));
  }

  getNext() {
    if (this.state.offset === 0) {}
    else {
      this.getPosts(this.state.limit, this.state.offset - 1);
      this.setState({'offset': this.state.offset - 1});
    }
  }

  getPrevious() {
    if (!this.state.hasMore) {}
    else {
      this.getPosts(this.state.limit, this.state.offset + 1);
      this.setState({'offset': this.state.offset + 1});
    }
  }

  componentWillMount() {
    this.getPosts(this.state.limit, this.state.offset)
  }

  render () {
    return (
      <div>

        {this.state.posts.map(post =>
          <Post key={post.id} post={post} id={post.id}/>)}

        <div style={styles.blogNavigationContainer}>
          <div style={styles.blogNavigationButtonContainer}
               onClick={this.getPrevious}>
            <p>Previous</p>
          </div>
          <div style={styles.blogNavigationButtonContainer}
               onClick={this.getNext}>
            <p>Next</p>
          </div>
        </div>

      </div>
    );
  }
}


class Projects extends Component {
  constructor(props) {
    super(props);
    this.state = {'content': ''}
  }

  componentWillMount() {
    fetch(projects)
      .then(response => response.text())
      .then(text => this.setState({'content': text}))
  }

  render () {
    return (
      <ReactMarkdown source={this.state.content}/>
    );
  }
}


class Website extends Component {
  constructor(props) {
    super(props);
    this.state = {'content': ''}
  }

  componentWillMount() {
    fetch(website_content_url)
      .then(response => response.text())
      .then(text => this.setState({'content': text}))
  }

  render () {
    return (
      <ReactMarkdown source={this.state.content}/>
    );
  }
}


function LinksTableItem(props) {
  let itemStyle;

  if (props.lastItem === 'true' || props.flexDirection === 'column') {
    itemStyle = Object.assign({}, styles.linksContainerItem);
    itemStyle.borderRight = '0px none'
  } else {
    itemStyle = styles.linksContainerItem;
  }

  return (
    <div style={itemStyle}>
      <Link
        to={props.path}
        style={styles.linksContainerItemText}>
        {props.text}
      </Link>
    </div>
  );
}


class LinksContainer extends Component {
  constructor (props) {
    super(props);
    this.state = {'currentWidth': -1};
    this.updateDimensions = this.updateDimensions.bind(this);
  }
  updateDimensions () {
    let update = {'currentWidth': window.innerWidth};
    this.setState(update);
  }
  componentWillMount () {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.updateDimensions);
  }
  render () {
    const style = Object.assign({}, styles.linksContainer);
    style.flexDirection = (this.state.currentWidth < 400) ? 'column' : 'row';
    return (
      <div style={style}>
        <LinksTableItem direction={style.flexDirection} path="/" text="home"/>
        <LinksTableItem direction={style.flexDirection} path="/blog" text="blog"/>
        <LinksTableItem direction={style.flexDirection} path="/projects" text="projects"/>
        <LinksTableItem direction={style.flexDirection} lastItem='true' path="/website" text="website"/>
      </div>
    );
  }
}


class AppPane extends Component {
  render() {
    return (
      <div style={styles.appPane}>
        <Route exact path="/" component={Home}/>
        <Route exact path="/blog" component={Blog}/>
        <Route exact path="/projects" component={Projects}/>
        <Route exact path="/website" component={Website}/>
        <Route path="/blog/:id" component={Post}/>
      </div>
    )
  }
}



class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div style={styles.app}>
            <Title/>
            <LinksContainer/>
            <AppPane/>
            <Footer/>
        </div>
      </BrowserRouter>
    );
  }
}


const styles = {};

styles.app = {
  fontFamily: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
  margin: 'auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(12, 1fr)',
  border: '1px solid white',
};

styles.appPane = {
  gridColumn: '1 / span 12',
  borderBottom: '10px solid',
  borderLeft: '10px solid',
  borderRight: '10px solid',
  padding: '0.5em'
};

styles.title = {
  backgroundColor: 'black',
  gridColumn: '1 / span 12',
  display: 'flex',
  alignItems: 'center',
};

styles.titleText = {
  fontFamily: ['monaco', 'Consolas', 'Lucida Console', 'monospace'],
  fontSize: '1.5em',
  color: 'white',
  paddingLeft: '0.5em',
};

styles.footer = {
  color: 'gray',
  padding: '0.5em',
  fontStyle: 'italic',
  fontSize: 'smaller',
  gridColumn: '1 / span 12',
  borderBottom: '10px solid black',
  borderLeft: '10px solid black',
  borderRight: '10px solid black',
  textAlign: 'center',
};

styles.linksContainer = {
  fontFamily: ['monaco', 'Consolas', 'Lucida Console', 'monospace'],
  paddingTop: '1em',
  paddingBottom: '1em',
  gridColumn: '1 / span 12',
  display: 'flex',
  flexDirection: (window.innerWidth < 400) ? 'column' : 'row',
  flexWrap: 'wrap',
  borderBottom: '10px solid',
  borderLeft: '10px solid',
  borderRight: '10px solid',
};

styles.linksContainerItem = {
  textAlign: 'center',
  flex: '1',
  paddingLeft: '1em',
  paddingRight: '1em',
  borderRight: '1px solid black',
};

styles.linksContainerItemText = {
  fontStyle: 'italic',
  textDecoration: 'none',
  color: 'black',
};

styles.linksContainerItemTextActive = {
  fontStyle: 'italic',
  textDecoration: 'underline',
};

styles.blogNavigationContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
};

styles.blogNavigationButtonContainer = {
  flex: '1',
  textAlign: 'center',
  cursor: 'pointer',
};

styles.shareButtonContainer = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'top',
};

styles.shareLinkText = {
  fontStyle: 'italic',
  fontSize: '10pt',
  textDecoration: 'underline',
  color: 'black',
  cursor: 'pointer',
};

styles.shareLinkContainer = {
  paddingRight: '0.5em',
};

styles.tweetButtonContainer = {
  paddingRight: '0.5em'
};

styles.copyLinkContainer = {
  paddingRight: '0.5em'
};

styles.postTitleText = {
  fontSize: '4.5em',
  color: '#458b74',
  fontWeight: 'lighter',
};


// color: '#2f58aa',
// color palette: http://www.color-hex.com/color-palette/41407

export default App;
