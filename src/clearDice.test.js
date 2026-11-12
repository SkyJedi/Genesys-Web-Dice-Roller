import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Popup from 'react-popup';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// These components read their channel from the address when they load, so set it before importing them.
window.history.pushState({}, '', '/testchannel?Luke');
const { default: Character } = await import('./Character');
const { default: Initiative } = await import('./Initiative');

// Stays offline: nothing reaches a real database.
firebase.initializeApp({ databaseURL: 'https://dice-test.firebaseio.com' });
firebase.database().goOffline();

const click = name => {
  const b = [...document.querySelectorAll('button')].find(x => x.textContent === name);
  act(() => b.click());
};

describe('Clear dice', () => {
  let box, root;

  beforeEach(() => {
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
    act(() => root.render(<Popup />));
  });

  afterEach(() => {
    act(() => { Popup.close(); });
    act(() => root.unmount());
    box.remove();
  });

  test('character popup has a Clear button that empties that character\'s dice', () => {
    let inst;
    const set = vi.fn();
    const chars = {
      a: { name: 'Ann', key: 'A', init: '', dice: { blue: '<img/>', black: '<img/>', upgrade: '', downgrade: '<img/>' } },
      b: { name: 'Bob', key: 'B', init: '', dice: { blue: '<img/>', black: '', upgrade: '', downgrade: '' } },
    };
    const host = document.createElement('div');
    document.body.appendChild(host);
    const r2 = createRoot(host);
    act(() => r2.render(<Character ref={el => { inst = el; }} />));
    inst.state.characterRef.set = set;
    act(() => inst.setState({ character: chars }));
    act(() => inst.addBonusDice('a'));
    click('Clear');
    expect(set).toHaveBeenCalledTimes(1);
    const saved = set.mock.calls[0][0];
    expect(saved.a.dice).toEqual({ blue: '', black: '', upgrade: '', downgrade: '' });
    expect(saved.b.dice.blue).toBe('<img/>');
    act(() => r2.unmount());
    host.remove();
  });

  test('initiative popup has Clear dice that zeroes the slot\'s dice', () => {
    let inst;
    const update = vi.fn();
    const host = document.createElement('div');
    document.body.appendChild(host);
    const r2 = createRoot(host);
    act(() => r2.render(<Initiative ref={el => { inst = el; }} />));
    inst.state.InitiativeRef.child = () => ({ update });
    act(() => inst.popupModifyInitiativeSlot({ key: 'k1', type: 'pc', bonusDie: ['blue', 'black'] }, 'current'));
    click('Clear dice');
    expect(update).toHaveBeenCalledWith({ bonusDie: { blue: 0, black: 0, upgrade: 0, downgrade: 0 } });
    act(() => r2.unmount());
    host.remove();
  });
});
