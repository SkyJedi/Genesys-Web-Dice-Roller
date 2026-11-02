import React, { Component } from 'react';
import Popup from 'react-popup';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import './index.css';
import './popup.css';
import { reRoll } from './functions/reRoll.js';
import { cleanHtml, escapeHtml } from './functions/safeHtml.js';
import { poolOf, poolText, getCurrentCharacter } from './functions/savedPool.js';



var channel = window.location.pathname.slice(1).toLowerCase();

class Message extends Component {
  constructor() {
    super();
    this.state = {
      message: 0,
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.messageRef.on('value', snap => {
      if (snap.val() !== null) this.setState({message: snap.val()});
      else this.setState({message: 0});
    });
  }

  popupDeleteMessage(key) {
    Popup.create({
    title: 'Delete Message',
    content: 'Are you sure, this will delete this message',
    className: 'messages',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.messageRef.child(key).remove();
              Popup.close();
            }
        }]
    }});
  }

  reRoll(key) {
    let message = Object.assign({}, this.state.message[key]);

    if (Object.keys(message).length > 1) reRoll(message);
  }

  // Right-click (or long-press) a roll: offer to keep its dice pool on the character shown in the Party panel.
  savePool(key, e) {
    const message = this.state.message[key];
    const pool = poolOf(message);
    if (Object.keys(pool).length === 0) return;
    e.preventDefault();
    const who = getCurrentCharacter();
    if (!who) {
      Popup.create({title: 'Save pool', className: 'messages', content: 'Add a character in the Party panel first, then save the pool to them.', buttons: {left: ['cancel']}});
      return;
    }
    Popup.create({
      title: 'Save pool',
      className: 'messages',
      content: 'Save ' + poolText(pool) + ' to ' + who.name + '? It replaces the pool they have saved.',
      buttons: {
        left: ['cancel'],
        right: [{
          text: 'Save',
          className: 'success',
          action: () => {
            const characterRef = firebase.database().ref().child(`${channel}`).child('character');
            characterRef.once('value', snap => {
              const all = snap.val() || {};
              const fbKey = Object.keys(all).find(k => all[k] && all[k].key === who.key);
              if (fbKey === undefined) return;
              characterRef.child(fbKey).child('pool').set(pool);
              this.state.messageRef.push().set({text: escapeHtml(who.name) + ' saved a dice pool: ' + poolText(pool)});
            });
            Popup.close();
          }
        }]
      }
    });
  }

  clear() {
    Popup.create({
    title: 'Clear Messages',
    content: 'Are you sure, this will clear all the messages',
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.messageRef.remove();
              Popup.close();
            }
        }]
    }});
  }

  render() {
    return (
      <div className='panel grow-panel'>
        <h2>Roll log <span className='grow'><button className='btn sm' onClick={this.clear.bind(this)}>Clear</button></span></h2>
        <div className='log' aria-live='polite'>
        {Object.keys(this.state.message).length === 0 && <div className='empty'>No rolls yet. Build a pool and press Roll.</div>}
        {Object.keys(this.state.message).reverse().map((k)=>
          <div className={'entry' + (/^-{3}/.test(this.state.message[k].text) ? ' divider' : '')} key={k}>
          <button className='x' aria-label='Delete message' onClick={this.popupDeleteMessage.bind(this, k)}>&#x2715;</button>
          <div className='body' title='Click to reroll. Right-click to save the pool to the current character.' onClick={this.reRoll.bind(this, k)} onContextMenu={this.savePool.bind(this, k)}dangerouslySetInnerHTML={{ __html: cleanHtml(this.state.message[k].text) }} />
          </div>
        )}
        </div>
      </div>
    );
  }
}
  export default Message;
