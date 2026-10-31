import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../index.css';
import { escapeHtml } from './safeHtml.js';
import { artSrc } from './diceArt.js';
import * as rolldice from './Roll.js';
import * as fortuneFaces from './fortuneFaces.js';
var user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase();

class fortune extends Component {
  constructor(props) {
    super(props);
    this.state = {picked: null};
  }

  pickDie(color, position) {
    let face = fortuneFaces.rolledFace(this.props.rollResults, color, position);
    if (face === undefined) return;
    this.setState({picked: {color: color, position: position, face: face}});
  }

  turn(face) {
    let rollResults = this.props.rollResults, picked = this.state.picked;
    rollResults[picked.color][picked.position] = rolldice.diceFaces[picked.color][face];
    if (rollResults.faces && rollResults.faces[picked.color]) rollResults.faces[picked.color][picked.position] = face;
    rollResults.text = `<span> ${escapeHtml(user)} used Unmatched Fortune </span>`;
    rollResults = rolldice.countSymbols(rollResults, user);
    if (this.props.rebuilt.caption !== '') {
      rollResults.caption = this.props.rebuilt.caption;
      rollResults.text += `<span> ${escapeHtml(this.props.rebuilt.caption)} </span>`;
    }
    firebase.database().ref().child(`${channel}`).child('message').push().set(rollResults);
    this.props.popupClose();
  }

  dieButton(color, value, key, onClick) {
    return <div key={key} className='dice rerollselect' role='button' tabIndex={0} aria-label={`${color} ${value || 'blank'}`}
      style={{backgroundImage: `url(${artSrc(`/images/dice/${color}-${value}.png`)})`}}
      onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }} />;
  }

  render() {
    let rollResults = this.props.rollResults, picked = this.state.picked;
    if (picked === null) return (
      <div>
        <p>Tap the positive die to turn.</p>
        {fortuneFaces.fortuneDice.map((color) => (rollResults[color] || []).map((value, i) =>
          this.dieButton(color, value, color + i, this.pickDie.bind(this, color, i))))}
      </div>
    );
    return (
      <div>
        <p>Turn it to a face next to it.</p>
        {fortuneFaces.fortuneOptions(picked.color, picked.face).map((face) =>
          this.dieButton(picked.color, rolldice.diceFaces[picked.color][face], face, this.turn.bind(this, face)))}
      </div>
    );
  }
}
export default fortune;
