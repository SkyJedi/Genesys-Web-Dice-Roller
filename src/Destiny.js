import React, { Component } from 'react';
import * as firebase from 'firebase';
import Popup from 'react-popup';
import './index.css';

const escapeHtml = require("./functions/safeHtml.js").escapeHtml;

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1);


class Destiny extends Component {

  constructor(props) {
    super(props);
    this.state = {
      destinyPoint: {},
      destinyRef: firebase.database().ref().child(`${channel}`).child('destiny'),
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    this.state.destinyRef.on('value', snap => {
      if (snap.val() != null) {
      this.setState({
        destinyPoint: snap.val()
        });
      } else {
        this.setState({
          destinyPoint: 0
          });
      }
    });
  }

  destinyAdd() {
    this.state.destinyRef.push().set('lightside');
    this.state.messageRef.push().set({text: `${escapeHtml(user)} added a light side point.`});
  }
  destinyRemove() {
    if (this.state.destinyPoint !== 0) {
      this.state.destinyRef.child(Object.keys(this.state.destinyPoint)[Object.keys(this.state.destinyPoint).length-1]).remove();
      this.state.messageRef.push().set({text: `${escapeHtml(user)} removed a destiny point.`});
    }
  }
  flip (v, k) {
    if (v === 'lightside') {
      this.state.destinyRef.child(k).set('darkside');
      this.state.messageRef.push().set({text: `${escapeHtml(user)} used a light side point.`})
    } else {
      this.state.destinyRef.child(k).set('lightside');
      this.state.messageRef.push().set({text: `${escapeHtml(user)} used a dark side point.`})
    }
  }

  destinyReset() {
    Popup.create({
    title: 'Reset Destiny',
    content: 'Would you like to reset Destiny?',
    className: 'alert',
    buttons: {
        left: ['cancel'],
        right: [{
            text: 'RESET',
            className: 'danger',
            action: () => {
              this.state.destinyRef.remove();
              this.state.messageRef.push().set({text: `${escapeHtml(user)} resets the destiny pool.`});
              Popup.close();
            }
        }],
    }});
  }



  render() {
    return (
      <div className='panel' aria-label='Destiny pool'>
        <h2>Destiny pool
          <span className='grow'>
            <button className='btn sm' title='Add Destiny Point' aria-label='Add Destiny Point' onClick={this.destinyAdd.bind(this)}>+</button>
            <button className='btn sm' title='Remove Destiny Point' aria-label='Remove Destiny Point' onClick={this.destinyRemove.bind(this)}>&minus;</button>
            <button className='btn sm' title='Reset Destiny' onClick={this.destinyReset.bind(this)}>Reset</button>
          </span>
        </h2>
        <div className='row'>
          {Object.keys(this.state.destinyPoint).length === 0 && <span className='empty'>No destiny points yet</span>}
          {Object.entries(this.state.destinyPoint).map(([k,v])=>
            <button key={k} className={'token ' + (v === 'lightside' ? 'light' : 'dark')} title='Click to flip Destiny Point'
              aria-label={(v === 'lightside' ? 'Light' : 'Dark') + ' side point, click to flip'} onClick={this.flip.bind(this, v, k)}>
              {v === 'lightside' ? '\u25CB' : '\u25CF'}
            </button>
          )}
        </div>
      </div>
    );
  }
}

export default Destiny;
