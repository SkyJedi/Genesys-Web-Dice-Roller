import React, { Component } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import '../index.css';
import { escapeHtml } from './safeHtml.js';
import { artSrc } from './diceArt.js';
import * as rolldice from './Roll.js';
var user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase(),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white', 'success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside'];

class selectReRoll extends Component {
  fields = {};

  constructor(props) {
    super(props);
    this.state = {
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      displayFaces: [],
      displayRepeat: {},
      reRoll: {},
    };
  }

  componentDidMount() {
    let rollResults = this.props.rollResults;
    let rebuilt = this.props.rebuilt;
    let displayFaces = [];
    let displayRepeat = {};
    this.fields.caption.value = rebuilt.caption;

    diceOrder.forEach((color)=>{
      if (rollResults[color] === undefined) return;
      for (var i=0; i<rollResults[color].length; i++){
        let key = color + ',' + i
        displayRepeat[key] = 'none'
        if (color === 'yellow' || color === 'green' ||  color === 'blue' ||  color === 'red' ||  color === 'purple' ||  color === 'black' || color === 'white') displayFaces.push({color: color, position: i,  path: `/images/dice/${color}-${rollResults[color][i]}.png`, key: color + ',' + i});
        else displayFaces.push({color: color, position: i,  path: `/images/${color}.png`, key: color + ',' + i});
      }
    })
    this.setState({displayFaces});
    this.setState({displayRepeat});
  }

  roll() {
      let rollResults = this.props.rollResults;
      let reRoll = Object.assign({}, this.state.reRoll);
      Object.keys(reRoll).forEach((key)=>{
        let diceRoll = {};
        diceRoll[reRoll[key].color] = 1;
        let color = reRoll[key].color, rerolled = rolldice.rollDicePool(diceRoll);
        rollResults[color].splice(reRoll[key].position, 1, rerolled[color][0]);
        if (rollResults.faces && rollResults.faces[color] && rerolled.faces) rollResults.faces[color].splice(reRoll[key].position, 1, rerolled.faces[color][0]);
      })
      rollResults.text = `<span> ${escapeHtml(user)} rerolled selected dice </span>`;
      rollResults = rolldice.countSymbols(rollResults, user);
      if (this.fields.caption.value !== '') {
        rollResults.caption = this.fields.caption.value;
        rollResults.text += `<span> ${escapeHtml(this.fields.caption.value)} </span>`;
      }
      if (rollResults.text !== undefined) this.state.messageRef.push().set(rollResults);
      this.props.popupClose();
     }


  selectDice(file) {
    let displayRepeat = Object.assign({}, this.state.displayRepeat);
    let reRoll = Object.assign({}, this.state.reRoll);
    if (displayRepeat[file.key] === 'block') {
      displayRepeat[file.key] = 'none';
      delete reRoll[file.key];
    }
    else {
      displayRepeat[file.key] = 'block';
      reRoll[file.key] = file;
    }
    this.setState({displayRepeat});
    this.setState({reRoll});
  }

  render() {
    return (
      <div>
        <p>Tap the dice to roll again.</p>
        {this.state.displayFaces.map((file)=>
          <div key={file.key} className='dice rerollselect' style={{backgroundImage: `url(${artSrc(file.path)})`}} onClick={this.selectDice.bind(this, file)}><img className='dice repeatselect' src={'/images/repeat.png'} alt='' style={{display: this.state.displayRepeat[file.key]}} /></div>
        )}
        <div className='row' style={{marginTop: '10px'}}>
          <input className='field' ref={el => { this.fields.caption = el; }} name='caption' placeholder='Caption' aria-label='Caption' style={{flex: 1, width: 'auto'}}/>
          <button className='btn primary' onClick={this.roll.bind(this)}>Roll</button>
        </div>
      </div>

    );
  }
}
export default selectReRoll;
