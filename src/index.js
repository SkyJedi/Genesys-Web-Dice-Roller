import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Popup from 'react-popup';
import Destiny from './Destiny';
import Channel from './Channel';
import Message from './Message';
import Dice from './Dice';
import Chat from './Chat';
import Character from './Character';
import TopBar from './TopBar';
import Initiative from './Initiative.js'
import Feedback from './Feedback';
import './index.css';
import * as firebase from 'firebase';
import config from './config';
import { theme, applyTheme } from './functions/theme';
applyTheme(theme());
firebase.initializeApp(config.config);

if (window.location.pathname !== '/') {
  var channel = window.location.pathname.slice(1).toLowerCase();
}

function setChanName(chanName, userName) {
  window.location = `/${chanName}?${userName}`;
}

function setChanPage () {
  ReactDOM.render(
    <Channel setFormChan={setChanName} />,
    document.getElementById('root')
  );
}

const TABS = [['col-dice', '\u{1F3B2} Dice'], ['col-log', '\u{1F4DC} Log'], ['col-party', '\u{1F9D1}\u200D\u{1F680} Party'], ['col-chat', '\u{1F4AC} Chat']];

// Desktop (>960px) shows all four columns; below that CSS shows only the .show column, picked by the tab bar.
class Table extends Component {
  constructor() {
    super();
    this.state = {tab: 'col-dice'};
  }

  // Toolbar link: show the Chat column, open the feedback box there and bring it into view.
  showFeedback = () => {
    this.setState({tab: 'col-chat'}, () => {
      const box = document.querySelector('.feedback-panel details');
      if (!box) return;
      box.open = true;
      box.scrollIntoView({behavior: 'smooth', block: 'center'});
      const text = box.querySelector('textarea');
      if (text) text.focus();
    });
  }

  col(id, label, children) {
    return <section className={'col' + (this.state.tab === id ? ' show' : '')} id={id} aria-label={label}>{children}</section>;
  }

  render() {
    return (
      <div className='app'>
        <TopBar onFeedback={this.showFeedback} />
        <div className='main'>
          {this.col('col-dice', 'Dice', [<Destiny key='d' />, <Initiative key='i' />, <Dice key='p' />])}
          {this.col('col-log', 'Roll log', <Message />)}
          {this.col('col-party', 'Party', <Character />)}
          {this.col('col-chat', 'Chat', [<Chat key='c' />,
            <div key='f' className='panel feedback-panel'><Feedback getUser={() => window.location.search.slice(1)} /></div>])}
        </div>
        <nav className='tabbar' role='tablist' aria-label='Sections'>
          {TABS.map(([id, label]) =>
            <button key={id} role='tab' aria-selected={this.state.tab === id} onClick={() => this.setState({tab: id})}>{label}</button>
          )}
        </nav>
      </div>
    );
  }
}

function startUp () {
  var webApp = <Table />;


  ReactDOM.render(
    webApp,
    document.getElementById('root')
  );

  ReactDOM.render(
    <Popup />,
    document.getElementById('popupContainer')
  );
};

// After the Table class is defined (classes are not hoisted).
if (channel !== undefined) {
  startUp();
} else {
  setChanPage();
}
