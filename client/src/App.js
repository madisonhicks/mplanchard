import React, { Component } from 'react';
import {
  BrowserRouter,
  Link,
  Route
} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
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


class Title extends Component {
  render () {
    return (
      <div style={styles.title}>
        <div style={styles.titleText}>
          <h2>Matthew Planchard</h2>
        </div>
      </div>
    );
  }
}


class Footer extends Component {
  render () {
    return (
      <div style={styles.footer}>
        <p>{copyright_str(year())}</p>
      </div>
    );
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


async function get_posts(limit=0, offset=0) {
  const url = `${CONST.POSTS}?limit=${limit}&offset=${offset}`;
  const resp = await fetch(
    url, {headers: {'Content-Type': 'application/json'}});
  return await resp.json();
}


class Blog extends Component {

  constructor(props) {
    super(props);
    this.state = {'posts': []};
  }

  componentWillMount() {
    get_posts().then(posts => this.setState({'posts': posts.results}));
  }

  render () {
    return (
      <div>
        {
          this.state.posts.map(post => {
            return (
              <div key={post.id} className="ui reading segmentpadding">
                <h1>{post.title}</h1>
                <ReactMarkdown
                  source={post.content}
                  renderers={Object.assign(
                    {},
                    ReactMarkdown.renderers,
                    {CodeBlock: CodeBlock})}/>
              </div>
            )
          })
        }
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


class LinksTableItem extends Component {
  render () {
    return (
      <div style={styles.linksContainerItem}>
        <Link
            to={this.props.path}
            style={styles.linksContainerItemText}>
          {this.props.text}
        </Link>
      </div>
    );
  }
}


class LinksContainer extends Component {
  render () {
    return (
      <div style={styles.linksContainer}>
        <LinksTableItem path="/" text="home"/>
        <LinksTableItem path="/blog" text="blog"/>
        <LinksTableItem path="/projects" text="projects"/>
        <LinksTableItem path="/website" text="website"/>
      </div>
    );
  }
}


class AppPane extends Component {
  render() {
    return (
      <div style={styles.appPane}>
        {/*<Route exact path="/" render={() => <Home {...this.props}/>}/>*/}
        <Route exact path="/" component={Home}/>
        <Route exact path="/blog" component={Blog}/>
        <Route exact path="/projects" component={Projects}/>
        <Route exact path="/website" component={Website}/>
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

const appWidth = '75%';

styles.app = {
  fontFamily: ['Times New Roman', 'serif'],
  fontWeight: 'lighter',
  margin: 'auto',
  width: appWidth,
  boxSizing: 'border-box'
};

styles.appPane = {
  margin: 'auto',
};

styles.title = {
  backgroundColor: 'black',
  height: '60px',
  margin: 'auto',
};

styles.titleText = {
  color: 'white',
  paddingLeft: '1%',
};

styles.footer = {
  color: 'gray',
  fontStyle: 'italic',
  fontSize: 'smaller',
  margin: 'auto',
};

styles.linksContainer = {
  margin: 'auto',
  display: 'flex',
  paddingTop: '5px',
};

styles.linksContainerItem = {
  margin: 'auto',
  textAlign: 'center',
  flex: '1',
};

styles.linksContainerItemText = {
  fontStyle: 'italic',
  textDecoration: 'none',
};

styles.linksContainerItemTextActive = {
  fontStyle: 'italic',
  textDecoration: 'underline',
};


export default App;
