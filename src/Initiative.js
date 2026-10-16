import React, { Component } from 'react';
import Popup from 'react-popup';
import * as firebase from 'firebase';
import './index.css';
const dice = require("./functions/misc.js").dice;

var channel = window.location.pathname.slice(1).toLowerCase();

class Initiative extends Component {
  constructor() {
    super();
    this.state = {
      slideout: 'none',
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
      Initiative: [],
      InitiativePastRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('past'),
      InitiativePast: [],
      position: {},
      positionRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('position'),
      character: {},
      characterRef: firebase.database().ref().child(`${channel}`).child('character'),
    };
  }

  componentDidMount() {
    this.state.InitiativeRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        for(var i=0; i<Object.keys(temp.bonusDie).length; i++) {
          var colorDie = Object.keys(temp.bonusDie)[i];
          for(var j=0; j<temp.bonusDie[colorDie]; j++) {
            tempBonus.push(`${colorDie}`);
          }}
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        this.setState({Initiative: final});
      } else {
        this.setState({Initiative: 0});
      }
    });

    this.state.InitiativePastRef.orderByChild('roll').on('value', snap => {
      let final = [];
      snap.forEach(function(child) {
        let tempBonus = [];
        let temp = child.val();
        temp['key'] = child.key;
        for(var i=0; i<Object.keys(temp.bonusDie).length; i++) {
          var colorDie = Object.keys(temp.bonusDie)[i];
          for(var j=0; j<temp.bonusDie[colorDie]; j++) {
            tempBonus.push(`${colorDie}`);
          }}
        temp.bonusDie = tempBonus;
        final.push(temp);
      });
      final.reverse();
      if (final != null) {
        this.setState({InitiativePast: final});
      } else {
        this.setState({InitiativePast: 0});
      }
    });

    this.state.positionRef.on('value', snap => {
      if (snap.val() != null) {
        this.setState({position: snap.val()});
      } else {
        this.setState({position: {round: 1,turn: 1}});
      }
    });

    this.state.characterRef.on('value', snap => {
      if (snap.val() !== null) {
        this.setState({character: snap.val()});
      } else {
        this.setState({character: {}});
      }
    });

  }

slideOut() {
  if (this.state.slideout !== 'none'){
    this.setState({slideout: 'none'});
  } else {
    this.setState({slideout: 'block'});
  }
}

InitiativeAdd() {
  let i=0;
  let Initiative = Object.assign({}, this.state.Initiative);

  if (Object.keys(Initiative).length > 0) {
    i = ((+Initiative[0].roll)-10).toString()
  } else {
    i = 0;
  }
  this.state.InitiativeRef.push().set({type: 'pc', roll: i, bonusDie: {blue: 0, black: 0}});
}

InitiativeRemove() {
  if (this.state.Initiative.length !== 0) {
    this.state.InitiativeRef.child((this.state.Initiative[this.state.Initiative.length-1]).key).remove();
  }
}

InitiativePrevious() {
  let position = Object.assign({}, this.state.position);
  let Initiative = this.state.Initiative;
  let InitiativePast = this.state.InitiativePast;
  if (position.turn === 1 && position.round === 1) {
    return;
  }
  if (position.turn - 1 < 1) {
    position.turn = this.state.Initiative.length + this.state.InitiativePast.length;
    position.round--;
    InitiativePast = Initiative;
    Initiative = [InitiativePast.pop()];
  } else {
    position.turn--;
    Initiative.unshift(InitiativePast.pop());
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(this.objectify(Initiative));
  this.state.InitiativePastRef.set(this.objectify(InitiativePast));
}

InitiativeNext() {
  if (this.state.Initiative.length + this.state.InitiativePast.length === 0) {
    return;
  }
  let position = Object.assign({}, this.state.position);
  let Initiative = this.state.Initiative;
  let InitiativePast = this.state.InitiativePast;
  Initiative[0].bonusDie = [];
  if (position.turn >= this.state.Initiative.length + this.state.InitiativePast.length) {
    position.turn = 1;
    position.round++;
    InitiativePast.push(Initiative.shift());
    Initiative = InitiativePast;
    InitiativePast = 0;
    this.clearMarks();
  } else {
    position.turn++;
    InitiativePast.push(Initiative.shift());
  }
  this.state.positionRef.set(position);
  this.state.InitiativeRef.set(this.objectify(Initiative));
  this.state.InitiativePastRef.set(this.objectify(InitiativePast));
}

objectify(array) {
  if (array === 0) {return 0;}
  let object = {};
  array.forEach(function(slot) {
    let key = slot.key;
    delete slot.key;
    let tempbonusDie = {blue: 0, black:0, upgrade:0, downgrade:0}
    for(var i=0; i<slot.bonusDie.length; i++) {
      tempbonusDie[slot.bonusDie[i]]++;
    }
    slot.bonusDie = tempbonusDie;
    object[key] = slot;
  });
  return object;
}

flip (slot, time) {
  if (time === 'current') {
    if (slot.type === 'pc') {
      this.state.InitiativeRef.child(slot.key).update({'type': 'npc'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

    } else {
      this.state.InitiativeRef.child(slot.key).update({'type': 'pc'});
      this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll+1).toString()});

    }
  } else {
      if (slot.type === 'pc') {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'npc'});
        this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll-1).toString()});

      } else {
        this.state.InitiativePastRef.child(slot.key).update({'type': 'pc'});
        this.state.InitiativeRef.child(slot.key).update({'roll': (+slot.roll+1).toString()});

      }
  }
}

Remove (slot, time) {
  if (time === 'current') {
      this.state.InitiativeRef.child(slot.key).remove();
  } else {
      this.state.InitiativePastRef.child(slot.key).remove();
  }
}

addBonusDice(slot, time, color) {
  let tempbonusDie = {blue:0, black:0, upgrade:0, downgrade:0}

  for(var i=0; i<slot.bonusDie.length; i++) {
    tempbonusDie[slot.bonusDie[i]]++;
  }
  if (time === 'current') {
    tempbonusDie[color]++;
    this.state.InitiativeRef.child(slot.key).update({'bonusDie': tempbonusDie});

  }
  if (time === 'past') {
    tempbonusDie[color]++;
    this.state.InitiativePastRef.child(slot.key).update({'bonusDie': tempbonusDie});

  }
}

Reset() {
  firebase.database().ref().child(`${channel}`).child('Initiative').remove();
}

clearMarks() {
  if (Object.keys(this.state.character).length !== 0) {
    let character = Object.assign({}, this.state.character);
    Object.keys(character).forEach((key)=>
      character[key].init = '',
    );
  this.state.characterRef.set(character);
  }
}

popupModifyInitiativeSlot(slot, time) {
  Popup.create({
  title: 'Modify Initiative Slot',
  content: 'What would like to do to this Initiative Slot?',
  className: 'initiative',
  buttons: {
      left: [{
          text: 'Bonus',
          className: 'bonus',
          action: () => {
            this.addBonusDice(slot, time, 'blue');
            Popup.close();
          }
        }, {
          text: 'Setback',
          className: 'setback',
          action: () => {
            this.addBonusDice(slot, time, 'black');
            Popup.close();
          }
        }, {
            text: 'DELETE',
            className: 'danger',
            action: () => {
              this.Remove(slot,time);
              Popup.close();
            }
        }],
      right: [{
            text: 'Upgrade',
            className: 'upgrade',
            action: () => {
              this.addBonusDice(slot, time, 'upgrade');
              Popup.close();
            }
        }, {
            text: 'Downgrade',
            className: 'downgrade',
            action: () => {
              this.addBonusDice(slot, time, 'downgrade');
              Popup.close();
            }
        },  {
          text: 'Flip',
          action: () => {
            this.flip(slot,time);
            Popup.close();
          }
      }]
  }});
}

popupReset() {
  Popup.create({
  title: 'Reset Initiative',
  content: 'Would you like to reset Initiative?',
  className: 'alert',
  buttons: {
      left: ['cancel'],
      right: [{
          text: 'RESET',
          className: 'danger',
          action: () => {
            this.Reset();
            Popup.close();
          }
      }],
  }});
}

genKey() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for( var i=0; i < 15; i++ )
      text += possible.charAt(dice(possible.length)-1);
  return text;
}

  render() {
    return (
      <div className='panel' aria-label='Initiative tracker'>
        <h2>Initiative
          <span className='grow'>
            <button title='Click to Show/Hide Initiative Tracker' type="button" className='btn sm' aria-expanded={this.state.slideout !== 'none'} onClick={this.slideOut.bind(this)}>{this.state.slideout !== 'none' ? 'Hide' : 'Show'}</button>
          </span>
        </h2>
        <div style={{display: this.state.slideout}}>
          <div className='row' style={{marginBottom: '10px'}}>
            <button title='Previous Initiative Slot' aria-label='Previous Initiative Slot' onClick={this.InitiativePrevious.bind(this)} className='btn sm'>&larr;</button>
            <button title='Next Initiative Slot' aria-label='Next Initiative Slot' onClick={this.InitiativeNext.bind(this)} className='btn sm'>&rarr;</button>
            <button title='Add Initiative Slot' aria-label='Add Initiative Slot' onClick={this.InitiativeAdd.bind(this)} className='btn sm'>+</button>
            <button title='Remove Initiative Slot' aria-label='Remove Initiative Slot' onClick={this.InitiativeRemove.bind(this)} className='btn sm'>&minus;</button>
            <button title='Reset Initiative' type="button" className='btn sm' onClick={this.popupReset.bind(this)}>Reset</button>
            <span className='round'>Round {this.state.position.round} · Turn {this.state.position.turn}</span>
          </div>
          <div className='row' style={{paddingTop: '8px'}}>
            {this.state.Initiative.map((slot)=>
              <div className='initslot' key={slot.key}>
                <span className='bonus'>
                {slot.bonusDie.reverse().map((type)=>
                  <i className={'pip ' + type} title={type} key={this.genKey()} />
                )}
                </span>
                <button title='Click to Modify Initiative Slot' className={'token ' + slot.type} onClick={this.popupModifyInitiativeSlot.bind(this, slot, 'current')}>{slot.type === 'pc' ? 'PC' : 'NPC'}</button>
              </div>
            )}
            {this.state.Initiative.length + this.state.InitiativePast.length === 0
              ? <span className='empty'>No initiative slots yet</span>
              : <span className='repeat' aria-label='Round repeats'>&#x21BB;</span>}
            {this.state.InitiativePast.map((slot)=>
              <div className='initslot' key={slot.key}>
                <span className='bonus'>
                {slot.bonusDie.reverse().map((type)=>
                  <i className={'pip ' + type} title={type} key={this.genKey()} />
                )}
                </span>
                <button title='Click to Modify Initiative Slot' className={'token past ' + slot.type} onClick={this.popupModifyInitiativeSlot.bind(this, slot, 'past')}>{slot.type === 'pc' ? 'PC' : 'NPC'}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
  export default Initiative;
