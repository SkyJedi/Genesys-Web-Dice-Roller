import React, { Component } from 'react';
import * as firebase from 'firebase';
import '../index.css';
import { dieCard } from '../Dice';
const dice = require("./misc.js").dice;
var rolldice = require("./Roll.js"),
    user = window.location.search.slice(1),
    channel = window.location.pathname.slice(1).toLowerCase(),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

class modifyDicePool extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0},
      modifiedRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
    };
  }

  componentDidMount() {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    let rebuilt = this.props.rebuilt;
    Object.keys(rebuilt.diceRoll).forEach((color)=>{
      diceRoll[color] = rebuilt.diceRoll[color]
    })
    this.setState({diceRoll});
    this.refs.caption.value = rebuilt.caption;
    this.refs.polyhedral.value = rebuilt.polyhedral;
  }

  addDie(diceColor) {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
    modifiedRoll[diceColor] += 1;
    diceRoll[diceColor] += 1;
    this.setState({modifiedRoll});
    this.setState({diceRoll});
  }

  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      let diceRoll = Object.assign({}, this.state.diceRoll);
      diceRoll[diceColor] -= 1;
      this.setState({diceRoll});
    }
    let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
    modifiedRoll[diceColor] -= 1;
    this.setState({modifiedRoll});
  }

  expandExtras() {
    if (diceOrder.length < 8) {
      diceOrder.push('success', 'advantage', 'triumph', 'fail', 'threat', 'despair', 'lightside', 'darkside');
      this.setState({diceRoll:{yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    } else {
      this.setState({diceRoll:{yellow:this.state.diceRoll['yellow'], green:this.state.diceRoll['green'], blue:this.state.diceRoll['blue'], red:this.state.diceRoll['red'], purple:this.state.diceRoll['purple'], black:this.state.diceRoll['black'], white:this.state.diceRoll['white'], polyhedral:this.state.diceRoll['polyhedral'], success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
      diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
    }
  }

  roll() {
      let modifiedRoll = Object.assign({}, this.state.modifiedRoll);
      let rollResults = this.props.rollResults
      Object.keys(modifiedRoll).forEach((color)=>{
        if (modifiedRoll[color] < 0) rollResults = this.deleteDie(modifiedRoll, color, rollResults);
        if (modifiedRoll[color] > 0) rollResults = this.newDie(modifiedRoll, color, rollResults);
      })
      rollResults.text = `<span> ${user} modified dice pool </span>`;
      rollResults = rolldice.countSymbols(rollResults, user);
      if (modifiedRoll['polyhedral'] > 0) rollResults = rolldice.rollPolyhedral(rollResults, modifiedRoll, this.refs.polyhedral.value);
      if (this.refs.caption.value !== '') {
        rollResults.caption = this.refs.caption.value;
        rollResults.text += `<span> ${this.refs.caption.value} </span>`;
      }
      if (rollResults.text !== undefined) this.state.messageRef.push().set(rollResults);
      this.props.popupClose();
     }

  newDie(modifiedRoll, color, rollResults) {
    let diceRoll = {};
    diceRoll[color] = modifiedRoll[color];
    if (rollResults[color] === undefined) rollResults[color]=[];
    rollResults[color] = rollResults[color].concat(rolldice.rollDicePool(diceRoll)[color]);
    return rollResults;
  }

  deleteDie(modifiedRoll, color, rollResults) {
    if (modifiedRoll[color]+rollResults[color].length===0) delete rollResults[color];
    else {
      for(var i=0; i>modifiedRoll[color]; i--) {
        rollResults[color].splice(dice(rollResults[color].length)-1, 1)
      }
    }
    return rollResults;
  }

  render() {
    return (
      <div>
      <div className='row' style={{marginBottom: '8px'}}>
        <button ref='extras' className='btn sm' aria-expanded={diceOrder.length > 7} onClick={this.expandExtras.bind(this)}>Symbols</button>
      </div>
      <div className='pool'>
        {diceOrder.slice(0, 7).map((diceColor) => dieCard(diceColor, this.state.diceRoll[diceColor], this.addDie.bind(this, diceColor), this.removeDie.bind(this, diceColor)))}
        <div className={'die' + (this.state.diceRoll.polyhedral ? ' on' : '')}>
          <input className='face' ref='polyhedral' defaultValue='100' aria-label='Polyhedral die sides' />
          <div className='ctl'>
            <button aria-label='Remove polyhedral die' onClick={this.removeDie.bind(this, 'polyhedral')}>&darr;</button>
            <span className='n'>{this.state.diceRoll.polyhedral}</span>
            <button aria-label='Add polyhedral die' onClick={this.addDie.bind(this, 'polyhedral')}>&uarr;</button>
          </div>
          <div className='dname'>Polyhedral (D-sides)</div>
        </div>
        {diceOrder.slice(7).map((diceColor) => dieCard(diceColor, this.state.diceRoll[diceColor], this.addDie.bind(this, diceColor), this.removeDie.bind(this, diceColor)))}
      </div>
      <div className='actions'>
        <button ref='roll' className='btn primary roll' onClick={this.roll.bind(this)}>Roll</button>
        <input className='field' ref='caption' name='caption' placeholder='Caption (optional)' aria-label='Caption' style={{gridColumn: '1 / -1'}}/>
      </div>
    </div>
    );
  }
}
export default modifyDicePool;
