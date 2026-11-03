import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Pick from './Pick';

const GROUPS = [
  { label: 'Basic', options: [['light', 'Light'], ['dark', 'Dark']] },
  { label: 'Colour themes', options: [['endor', 'Endor (forest)']] },
];

describe('the dropdown', () => {
  let box, root, onChange;
  const button = () => box.querySelector('button');
  const list = () => box.querySelector('[role="listbox"]');
  const options = () => box.querySelectorAll('[role="option"]');
  const key = (el, k) => act(() => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })); });

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    onChange = vi.fn();
    box = document.createElement('div');
    document.body.appendChild(box);
    root = createRoot(box);
    act(() => root.render(<Pick id='pick-theme' label='Theme' title='Colour theme' value='dark' groups={GROUPS} onChange={onChange} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    box.remove();
  });

  it('is plain page elements, no native select', () => {
    expect(box.querySelector('select')).toBeNull();
    expect(button().textContent).toMatch(/^Dark/);
    expect(button().getAttribute('aria-expanded')).toBe('false');
    expect(list()).toBeNull();
  });

  it('opens on click with the groups and the current choice focused', () => {
    act(() => button().click());
    expect(button().getAttribute('aria-expanded')).toBe('true');
    expect([...box.querySelectorAll('.dropdown-group')].map((g) => g.textContent)).toEqual(['Basic', 'Colour themes']);
    expect(options().length).toBe(3);
    expect(document.activeElement).toBe(options()[1]);
    expect(options()[1].getAttribute('aria-selected')).toBe('true');
  });

  it('picks with a click, closes and reports the new value', () => {
    act(() => button().click());
    act(() => options()[2].click());
    expect(onChange).toHaveBeenCalledWith('endor');
    expect(list()).toBeNull();
    expect(button().textContent).toMatch(/^Endor/);
    expect(document.activeElement).toBe(button());
  });

  it('does not report picking the same value again', () => {
    act(() => button().click());
    act(() => options()[1].click());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('works from the keyboard', () => {
    button().focus();
    key(button(), 'ArrowDown');
    expect(document.activeElement).toBe(options()[1]);
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement).toBe(options()[2]);
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement).toBe(options()[2]);
    key(document.activeElement, 'Home');
    expect(document.activeElement).toBe(options()[0]);
    key(document.activeElement, 'Enter');
    expect(onChange).toHaveBeenCalledWith('light');
    expect(list()).toBeNull();
  });

  it('closes on Escape and on a click elsewhere without changing', () => {
    act(() => button().click());
    key(document.activeElement, 'Escape');
    expect(list()).toBeNull();
    expect(document.activeElement).toBe(button());
    act(() => button().click());
    act(() => { document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); });
    expect(list()).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('hands focus back to the button on Tab so Tab moves on from there', () => {
    act(() => button().click());
    key(document.activeElement, 'Tab');
    expect(list()).toBeNull();
    expect(document.activeElement).toBe(button());
  });

  it('keeps the tooltip off the open list', () => {
    expect(box.querySelector('.pick').hasAttribute('title')).toBe(false);
    expect(button().title).toBe('Colour theme');
  });

  it('closes when the button is clicked again', () => {
    act(() => button().click());
    act(() => button().click());
    expect(list()).toBeNull();
  });
});
