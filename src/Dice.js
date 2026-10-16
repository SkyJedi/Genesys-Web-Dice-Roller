import React, { Component } from 'react';
import * as firebase from 'firebase';
import './index.css';
var crit = require("./functions/Crit.js");
var rolldice = require("./functions/Roll.js");
const dice = require("./functions/misc.js").dice;
const escapeHtml = require("./functions/safeHtml.js").escapeHtml;

var channel = window.location.pathname.slice(1).toLowerCase(),
    user = window.location.search.slice(1),
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];

// Die art per Pattern's mockup: plain SVG shapes in the die colour (CSS .shape.<color>); symbols get a glyph.
const SHAPES = {
  d12: <polygon points='30,3 52,14 57,38 41,56 19,56 3,38 8,14' />,
  d8: <polygon points='30,3 55,30 30,57 5,30' />,
  d6: <rect x='7' y='7' width='46' height='46' rx='8' />,
};
const DIE_INFO = {
  yellow: ['Proficiency', 'd12'], green: ['Ability', 'd8'], blue: ['Boost', 'd6'], red: ['Challenge', 'd12'],
  purple: ['Difficulty', 'd8'], black: ['Setback', 'd6'], white: ['Force', 'd12'],
  success: ['Success', 'S'], advantage: ['Advantage', 'A'], triumph: ['Triumph', '\u2605'], fail: ['Failure', '\u2716'],
  threat: ['Threat', 'T'], despair: ['Despair', '\u2620'], lightside: ['Light side', 'pip l'], darkside: ['Dark side', 'pip n'],
};
// Symbols beyond Latin-1 are written as escapes/entities in the app code (tests aside): Node 23.2 garbles webpack's
// module-concatenation names in a file holding such a character, which breaks `npm run build` on the PC.

// One die card; used by Dice and functions/modifyDicePool so both pools look the same.
export function dieCard(color, count, add, remove) {
  const [name, shape] = DIE_INFO[color];
  return (
    <div key={color} className={'die' + (count ? ' on' : '')}>
      <button className={'face' + (SHAPES[shape] ? '' : ' glyph')} aria-label={`Add ${name}`} onClick={add}>
        {SHAPES[shape] ? <svg viewBox='0 0 60 60' aria-hidden='true' className={'shape ' + color}>{SHAPES[shape]}</svg> : shape.startsWith('pip ') ? <i className={'pp ' + shape.slice(4)} /> : shape}
      </button>
      <div className='ctl'>
        <button aria-label={`Remove ${name}`} onClick={remove}>&darr;</button>
        <span className='n'>{count}</span>
        <button aria-label={`Add ${name}`} onClick={add}>&uarr;</button>
      </div>
      <div className='dname'>{SHAPES[shape] ? `${name} (${color})` : name}</div>
    </div>
  );
}

class Dice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      diceRoll: {},
      messageRef: firebase.database().ref().child(`${channel}`).child('message'),
      showOptions: 'none',
      destinyRef: firebase.database().ref().child(`${channel}`).child('destiny'),
      InitiativeRef: firebase.database().ref().child(`${channel}`).child('Initiative').child('order'),
    };
  }

  componentDidMount() {
    this.reset();
  }

  addDie(diceColor) {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    diceRoll[diceColor] += 1;
    this.setState({diceRoll});
  }

  removeDie(diceColor) {
    if (this.state.diceRoll[diceColor] > 0) {
      let diceRoll = Object.assign({}, this.state.diceRoll);
      diceRoll[diceColor] -= 1;
      this.setState({diceRoll});
    }
  }

  reset() {
    this.setState({diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    diceOrder = ['yellow', 'green', 'blue', 'red', 'purple', 'black', 'white'];
    this.setState({showOptions: 'none'});
    this.refs.caption.value = '';
    this.refs.polyhedral.value = 100;
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

  dropMenu() {
    if (this.state.showOptions !== 'none'){
      this.setState({showOptions: 'none'});
    } else {
      this.setState({showOptions: 'inline-block'});
    }
  }

  critical(critical, stop) {
    stop.preventDefault();
    var critRoll = crit.d100(this.refs.modifier.value);
    var critText = ''
    if (critical === 'critical') {
      critText = crit.crit(critRoll[0]);
    } else {
      critText = crit.shipcrit(critRoll[0]);
    }
    critText = escapeHtml(user) + ' ' + critRoll[1] + `<p>` + critText + `</p>`
    this.state.messageRef.push().set({text: critText});
    this.refs.modifier.value = '';

  }

  roll() {
      let diceRoll = Object.assign({}, this.state.diceRoll);
      let roll = rolldice.roll(diceRoll, this.refs.polyhedral.value, this.refs.caption.value, user);
      if (roll.text !== undefined) this.state.messageRef.push().set(roll);
      if (this.refs.resetCheck.checked === false) this.reset();
     }

  destinyRoll(){
    var destinyResult = rolldice.roll({white:1}, this.refs.polyhedral.value, '', user);
    destinyResult.text += `<br/> Adding to the Destiny Pool`;
    switch(destinyResult.white[0]) {
      case 'l':
        this.state.destinyRef.push().set('lightside');
        break;
      case 'll':
        this.state.destinyRef.push().set('lightside');
        this.state.destinyRef.push().set('lightside');
        break;
      case "n":
        this.state.destinyRef.push().set('darkside');
        break;
      case 'nn':
        this.state.destinyRef.push().set('darkside');
        this.state.destinyRef.push().set('darkside');
        break;
      default:
        break;
    }
    this.state.messageRef.push().set(destinyResult);
    this.refs.caption.value = '';
    this.refs.polyhedral.value = 100;
  }

  initiativeRoll() {
    let diceRoll = Object.assign({}, this.state.diceRoll);
    var initiativeResult = rolldice.roll(diceRoll, this.refs.polyhedral.value, this.refs.caption.value, user);
    if (initiativeResult === 0) return;
    var newInit = {};
    newInit.roll = (initiativeResult.rolledSymbols.s - initiativeResult.rolledSymbols.f).toString() + (initiativeResult.rolledSymbols.a - initiativeResult.rolledSymbols.t).toString() + initiativeResult.rolledSymbols['!'].toString();
    newInit.bonusDie = {blue: 0, black: 0};
    if (this.refs.pcCheck.checked === false) {
      newInit.type = 'pc'
      newInit.roll += '1'
    } else {
      newInit.type = 'npc'
      newInit.roll += '0'
    }
    this.state.InitiativeRef.push().set(newInit);
    if (initiativeResult.text !== undefined) {
      this.state.messageRef.push().set(initiativeResult);
    }
    if (this.refs.resetCheck.checked === false){
      this.setState({diceRoll: {yellow:0, green:0, blue:0, red:0, purple:0, black:0, white:0, polyhedral:0, success:0, advantage:0, triumph:0, fail:0, threat:0, despair:0, lightside:0, darkside:0}});
    }
    this.refs.caption.value = '';
    this.refs.polyhedral.value = 100;
  }

  gleepglop () {
    var Species =
      ["Aleena", "Anx", "Aqualish", "Arcona", "Arkanian Offshoot", "Arkanian", "Barabel", "Bardottan", "Besalisk", "Bith", "Bothan", "Caamasi", "Cathar", "Cerean", "Chadra-Fan", "Chagrian", "Chevin", "Chiss", "Clawdite", "Corellian Human", "Dashade", "Defel", "Devaronian", "Drall", "Dressellian", "Droid", "Dug", "Duros", "Elom", "Elomin", "Ewok", "Falleen", "Farghul", "Gamorrean", "Gand", "Gank", "Givin", "Gossam", "Gotal", "Gran", "Gungan", "Herglic", "Human", "Hutt", "Iktotchi", "Ishi Tib", "Ithorian", "Jawa", "Kalleran", "Kel Dor", "Klatooinian", "Kubaz", "Kyuzo", "Lannik", "Lepi", "Mandalorian Human", "Mirialan", "Mon Calamari", "Mustafarian", "Muun", "Nagai", "Nautolan", "Neimoidian", "Nikto", "Noghri", "Ortolan", "Pantoran", "Pau'an", "Polis Massan", "Quarren", "Quermian", "Rodian", "Ryn", "Sakiyan", "Sathari", "Selkath", "Selonian", "Shistavanen", "Sluissi", "Snivvian", "Squib", "Sullustan", "Talz", "Thakwaash", "Togorian", "Togruta", "Toydarians", "Trandoshan", "Twi'lek", "Ubese", "Ugnaught", "Verpine", "Weequay", "Whiphid", "Wookiee", "Xexto", "Zabrak", "Zeltron", "Zygerrian"];
    this.state.messageRef.push().set({text: "A wild " + Species[dice(Species.length)-1] + " appears!"});
}

  render() {
    return (
      <div className='panel' aria-label='Dice pool'>
      <h2>Dice pool
        <span className='grow'><button ref='extras' className='btn sm' aria-expanded={diceOrder.length > 7} onClick={this.expandExtras.bind(this)}>Symbols</button></span>
      </h2>
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
        <input className='field' ref='caption' name='caption' placeholder='Caption (optional)' aria-label='Caption' />
        <button ref='reset' className='btn' onClick={this.reset.bind(this)}>Reset</button>
        <label className='switch'><input type='checkbox' ref='resetCheck'/><span className='track'></span>Save pool</label>
        <button ref='specialRollsDropDown' className='btn' aria-expanded={this.state.showOptions !== 'none'} onClick={this.dropMenu.bind(this)}>Special rolls &#x25BE;</button>
      </div>
      <div className={'special' + (this.state.showOptions !== 'none' ? ' open' : '')}>
        <form className='row'>
          <button onClick={this.critical.bind(this, 'critical')} className='btn'>Critical</button>
          <button onClick={this.critical.bind(this, 'shipcrit')} className='btn'>Ship Critical</button>
          <input className='field' ref='modifier' name='modifier' placeholder='modifier' aria-label='Critical modifier' />
        </form>
        <button ref='gleepglop' className='btn' onClick={this.gleepglop.bind(this)}>Gleep Glop</button>
        <button ref='destinyRoll' className='btn' onClick={this.destinyRoll.bind(this)}>Roll Destiny</button>
        <span className='break'></span>
        <button ref='initiativeResult.rolledSymbols' className='btn' onClick={this.initiativeRoll.bind(this)}>Roll Initiative</button>
        <span>PC</span>
        <label className='switch'><input type='checkbox' ref='pcCheck' aria-label='NPC'/><span className='track'></span>NPC</label>
      </div>
    </div>
    );
  }
}
  export default Dice;
