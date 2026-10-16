import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';
import Popup from 'react-popup';
import './popup.css';
import { escapeHtml, cleanHtml } from './functions/safeHtml';
var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);

class Chat extends Component {
  constructor() {
    super();
    this.state = {
      chat: {},
      chatRef: firebase.database().ref().child(`${channel}`).child('chat'),
    };
  }

  componentDidMount() {
    this.state.chatRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        chat: snap.val()
        });
      } else {
        this.setState({
          chat: 0
          });
      }
    });
  }

  sendchat(stop) {
    stop.preventDefault();
    let chat = this.imgCheck(escapeHtml(this.refs.chatInput.value));
    chat = this.urlCheck(chat);
    chat = `<span>${escapeHtml(user)}: `+ chat + `</span>`
    this.state.chatRef.push().set(chat);
    this.refs.chatInput.value = '';
  }

  imgCheck(chat) {
    chat = chat.split(' ');
    for (var i=0; i<chat.length; i++) {
        if (/^\[[a-z0-9-]+\]$/i.test(chat[i])) {
          chat[i] = chat[i].slice(1).slice(0, -1).toLowerCase();
          chat[i] = `<img class=tinydie src=/images/${chat[i]}.png /> `;
        }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  urlCheck(chat) {
    chat = chat.split(' ');
    for (var i=0; i<chat.length; i++) {
        if (/^https?:\/\//i.test(chat[i])) {
          chat[i] = `</span><a href="${chat[i]}" style="font-size: small">${chat[i]}</a><span>`;
        }
    }
    let final = ''
    chat.forEach((param) => {
      final += param + ' ';
    })
    return final;
  }

  popupDeleteMessage(key) {
    Popup.create({
    title: 'Delete Message',
    content: 'Are you sure, this will delete this message',
    className: 'chat',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.chatRef.child(key).remove();
              Popup.close();
            }
        }]
    }});
  }

  clear() {
    Popup.create({
    title: 'Clear Chat',
    content: 'Are you sure, this will clear all the chat',
    className: 'chat',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.state.chatRef.remove();
              Popup.close();
            }
        }]
    }});
  }

  render() {
    return (
      <div className='panel grow-panel'>
        <h2>Chat <span className='grow'><button className='btn sm' onClick={this.clear.bind(this)}>Clear</button></span></h2>
        <form className='chatform' ref='chatForm' onSubmit={this.sendchat.bind(this)}>
        <input className='field' ref='chatInput' required placeholder='Say something&hellip; [blue] shows a die' aria-label='Chat message'/>
        <button ref='send' className='btn primary'>Send</button>
        </form>
        <div>
          {Object.keys(this.state.chat).length === 0 && <div className='empty'>No chat yet.</div>}
          {Object.entries(this.state.chat).reverse().map(([k,v])=>
            <div className='msg' key={k}>
            <button className='x' aria-label='Delete chat message' onClick={this.popupDeleteMessage.bind(this, k)}>&#x2715;</button>
            <div dangerouslySetInnerHTML={{ __html: cleanHtml(v) }} />
            </div>
          )}
        </div>
      </div>
    );
  }
}
  export default Chat;
