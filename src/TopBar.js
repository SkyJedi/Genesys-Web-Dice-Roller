import React, { Component } from 'react';
import Popup from 'react-popup';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './index.css';
import './popup.css';
import { diceArt, setDiceArt } from './functions/diceArt';
import { THEMES, theme, setTheme } from './functions/theme';
import Pick from './Pick';

const SYSTEMS = [{ options: [['genesys', 'Genesys'], ['swrpg', 'SWRPG']] }];
const THEME_GROUPS = ['Basic', 'Colour themes'].map((label) => ({
  label,
  options: THEMES.filter((t) => t[2] === label).map(([id, name]) => [id, name]),
}));

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);

class TopBar extends Component {

constructor() {
  super();
  this.state = {
    databaseRef: firebase.database().ref(),
  };
}

signOut() {
  window.location = `/`;
}

popupDeleteChannel() {
  Popup.create({
  title: 'Delete Channel',
  content: 'Are you sure, this will delete all Data in ' + channel,
  className: 'alert',
  buttons: {
      left: ['cancel'],
      right: [{
          text: 'DELETE',
          className: 'danger',
          action: () => {
            firebase.database().ref().child(`${channel}`).remove();
            this.signOut();
            Popup.close();
          }
      }]
  }});
}

newSession() {
  firebase.database().ref().child(`${channel}`).child('destiny').remove();
  firebase.database().ref().child(`${channel}`).child('chat').push().set(`<span>----------------------------------------------</span>`)
  firebase.database().ref().child(`${channel}`).child('message').push().set({text: '--------------------------------------------------------------------'})

}

toggleMenu() {
  this.setState({menu: !this.state.menu});
}

render() {
  return (
    <header className='topbar'>
      <span className='brand'>D1-C3</span>
      <span className='who'>Channel <b>{channel}</b> · playing as <b>{user}</b></span>
      <Pick id='pick-system' label='System' title='Which game system the dice pictures follow' value={diceArt()}
        groups={SYSTEMS} onChange={setDiceArt} />
      <Pick id='pick-theme' label='Theme' title='Colour theme' value={theme()} groups={THEME_GROUPS} onChange={setTheme} />
      <div className={'menu' + (this.state.menu ? ' open' : '')}>
        <button className='btn' aria-haspopup='true' aria-expanded={!!this.state.menu} onClick={this.toggleMenu.bind(this)}>Session &#x25BE;</button>
        <div className='menu-list' role='menu' onClick={this.toggleMenu.bind(this)}>
          <button role='menuitem' onClick={this.newSession.bind(this)}>New Session</button>
          <button role='menuitem' className='danger' onClick={this.popupDeleteChannel.bind(this)}>Delete Channel&hellip;</button>
        </div>
      </div>
      <button className='btn' onClick={this.props.onFeedback}>Feedback</button>
      <button className='btn' onClick={this.signOut.bind(this)}>Logout</button>
    </header>
  );
}
}
export default TopBar;
