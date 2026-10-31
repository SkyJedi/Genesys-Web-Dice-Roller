import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Popup from 'react-popup';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import Channel from './Channel';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Dice and Chat read their channel from the address when they load, so set it before importing them.
window.history.pushState({}, '', '/testchannel?Luke');
const { default: Dice } = await import('./Dice');
const { default: Chat } = await import('./Chat');

// Stays offline: writes queue locally and nothing reaches a real database.
firebase.initializeApp({ databaseURL: 'https://dice-test.firebaseio.com' });
firebase.database().goOffline();

describe('React 19 and firebase compat', () => {
  let box, root;

  beforeEach(() => {
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
  });

  afterEach(() => {
    act(() => root.unmount());
    box.remove();
  });

  test('channel form reads its fields', () => {
    const setFormChan = vi.fn();
    act(() => root.render(<Channel setFormChan={setFormChan} />));
    box.querySelector('#channel').value = 'My Table';
    box.querySelector('#user').value = 'Luke';
    act(() => box.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(setFormChan).toHaveBeenCalledWith('mytable', 'Luke');
  });

  test('dice reset clears the fields it holds', () => {
    act(() => root.render(<Dice />));
    const caption = box.querySelector('input[name=caption]');
    const sides = box.querySelector('input[aria-label="Polyhedral die sides"]');
    caption.value = 'attack';
    sides.value = '20';
    const reset = [...box.querySelectorAll('button')].find(b => b.textContent === 'Reset');
    act(() => reset.click());
    expect(caption.value).toBe('');
    expect(sides.value).toBe('100');
  });

  test('chat sends through firebase and clears the input', () => {
    act(() => root.render(<Chat />));
    const input = box.querySelector('input[aria-label="Chat message"]');
    input.value = 'hello';
    act(() => box.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    expect(input.value).toBe('');
  });

  test('react-popup still shows a popup', () => {
    act(() => root.render(<Popup />));
    act(() => { Popup.create({ title: 'Check', content: 'still works', buttons: { right: ['ok'] } }); });
    expect(box.textContent).toContain('still works');
    expect(box.textContent).toContain('Check');
    act(() => { Popup.close(); });
  });
});
