import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Feedback, { feedbackFields, feedbackUrl } from './Feedback';

describe('the pop-up', () => {
  let box, root, onClose;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    onClose = jest.fn();
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
    act(() => root.render(<Feedback getUser={() => 'Luke'} onClose={onClose} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    box.remove();
  });

  it('opens as a dialog with the text box focused', () => {
    expect(box.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.activeElement).toBe(box.querySelector('textarea'));
  });

  it('closes on the Close button and on Escape, not on a click outside', () => {
    act(() => box.querySelector('.feedback-backdrop').click());
    expect(onClose).not.toHaveBeenCalled();
    act(() => box.querySelector('.btn').click());
    expect(onClose).toHaveBeenCalledTimes(1);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('keeps Tab inside the pop-up', () => {
    const items = box.querySelectorAll('button');
    items[items.length - 1].focus();
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })); });
    expect(document.activeElement).toBe(items[0]);
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true })); });
    expect(document.activeElement).toBe(items[items.length - 1]);
    document.activeElement.blur();
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', cancelable: true })); });
    expect(document.activeElement).toBe(items[0]);
  });

  it('gives focus back to the button that opened it', () => {
    act(() => root.unmount());
    const opener = document.createElement('button');
    document.body.appendChild(opener);
    opener.focus();
    root = createRoot(box);
    act(() => root.render(<Feedback getUser={() => 'Luke'} onClose={onClose} />));
    expect(document.activeElement).toBe(box.querySelector('textarea'));
    act(() => root.render(null));
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('posts the text once and thanks the user', async () => {
    global.fetch = jest.fn(() => Promise.resolve());
    box.querySelector('textarea').value = ' Nice ';
    await act(async () => {
      box.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][1].body.get('entry.1440311554')).toBe('Nice');
    expect(box.textContent).toMatch(/Thanks/);
  });

  it('stays open while sending', async () => {
    global.fetch = jest.fn(() => new Promise(() => {}));
    box.querySelector('textarea').value = 'Nice';
    await act(async () => {
      box.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); });
    expect(box.querySelector('.btn').disabled).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('offers the form link when the post fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('offline')));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    box.querySelector('textarea').value = 'Nice';
    await act(async () => {
      box.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(box.querySelector('.feedback-note a').href).toMatch(/viewform/);
    console.error.mockRestore();
  });
});

it('fills the same form fields the bots use', () => {
  const params = feedbackFields({ user: 'Luke', feedback: 'Great & fast', email: 'a@b.c' });
  expect(params.get('entry.1736849516')).toBe('D1-C3 (dice site)');
  expect(params.get('entry.1282692316')).toBe('dice.skyjedi.com');
  expect(params.get('entry.1722619971')).toBe('Luke');
  expect(params.get('entry.1440311554')).toBe('Great & fast');
  expect(params.get('entry.1213316943')).toBe('a@b.c');
});

it('leaves a blank email out and names a missing user', () => {
  const params = feedbackFields({ user: '', feedback: 'x', email: '' });
  expect(params.get('entry.1722619971')).toBe('Not given');
  expect(params.has('entry.1213316943')).toBe(false);
});

it('builds a pre-filled fallback link without the feedback text', () => {
  const url = feedbackUrl({ user: 'Luke', feedback: 'secret', email: '' });
  expect(url).toMatch(/viewform\?usp=pp_url&/);
  expect(url).not.toMatch(/secret/);
});
