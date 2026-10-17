import React, { Component } from 'react';
import './index.css';
import Feedback from './Feedback';

class Channel extends Component {

  setChannel(stop) {
    stop.preventDefault();
    var channel = this.refs.channel.value.replace(/\W/g, '').toLowerCase();
;
    var user = this.refs.user.value.replace(/\W/g, '');
    this.props.setFormChan(channel, user);
  }

  render() {
    return (
      <div className='entry-page'>
      <main className='card'>
      <img className='logo' src={`/favicon.png`} alt='' />
      <h1>D1-C3</h1>
      <p className='tag'>Dice roller and table assistant for Genesys</p>
      <form onSubmit={this.setChannel.bind(this)}>
        <label htmlFor='channel'>Channel name</label>
        <input id='channel' ref="channel" name="channel" placeholder="Channel Name" autoComplete='off' />
        <label htmlFor='user'>Your name</label>
        <input id='user' ref="user" name="user" placeholder="User Name" autoComplete='off' />
        <button>Enter</button>
      </form>
        <p className='foot'>
          Created by SkyJedi<br/>
          An assistant (dice roller, chat, Story Point tracker, character tracker, initiative tracker) for Fantasy Flight Games, Genesys
        </p>
        <Feedback getUser={() => this.refs.user.value.trim()} />
      </main>
      </div>
    );
  }
}
  export default Channel;
