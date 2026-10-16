import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
import './popup.css';
var reRoll = require("./functions/reRoll.js").reRoll;
var cleanHtml = require("./functions/safeHtml.js").cleanHtml;



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
          <div className='body' title='Click to reroll' onClick={this.reRoll.bind(this, k)} dangerouslySetInnerHTML={{ __html: cleanHtml(this.state.message[k].text) }} />
          </div>
        )}
        </div>
      </div>
    );
  }
}
  export default Message;
