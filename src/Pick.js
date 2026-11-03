import React, { useState, useRef, useEffect } from 'react';

// A dropdown made of plain page elements. The browser's own <select> opens its list in a separate native
// window, which OBS's browser source never draws, so a click there seemed to do nothing.
// groups: [{label, options: [[value, name], ...]}]; a group without a label shows no heading.
function Pick({ id, label, title, value, groups, onChange }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(value); // like the old select's defaultValue: read once
  const [active, setActive] = useState(0);
  const box = useRef(null);
  const button = useRef(null);
  const items = useRef([]);
  const options = groups.flatMap((g) => g.options);
  const at = Math.max(0, options.findIndex((o) => o[0] === current));

  // A click or touch anywhere else closes the list.
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('touchstart', away);
    };
  }, [open]);

  useEffect(() => {
    if (open && items.current[active]) items.current[active].focus();
  }, [open, active]);

  function show() {
    setActive(at);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    if (button.current) button.current.focus();
  }

  function choose(i) {
    const v = options[i][0];
    close();
    if (v !== current) {
      setCurrent(v);
      onChange(v);
    }
  }

  function buttonKey(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      show();
    }
  }

  function listKey(e) {
    const last = options.length - 1;
    if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, last));
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0));
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(last);
    else if (e.key === 'Enter' || e.key === ' ') choose(active);
    else if (e.key === 'Escape') close();
    else if (e.key === 'Tab') {
      // focus the button first, so the browser's Tab moves on from it, not from an option that is going away
      close();
      return;
    } else return;
    e.preventDefault();
  }

  let n = 0;
  return (
    <div className='pick' ref={box}>
      <span id={id + '-label'} title={title}>{label}</span>
      <div className={'dropdown' + (open ? ' open' : '')}>
        <button type='button' id={id} ref={button} className='field' title={title} aria-haspopup='listbox' aria-expanded={open}
          aria-labelledby={id + '-label ' + id} onClick={() => (open ? close() : show())} onKeyDown={buttonKey}>
          {options[at][1]} <span aria-hidden='true'>&#x25BE;</span>
        </button>
        {open && (
          <div className='dropdown-list' role='listbox' aria-labelledby={id + '-label'} onKeyDown={listKey}>
            {groups.map((g, gi) => (
              <div key={gi} role='group' aria-labelledby={g.label ? `${id}-g${gi}` : undefined}>
                {g.label && <div className='dropdown-group' id={`${id}-g${gi}`} role='presentation'>{g.label}</div>}
                {g.options.map(([v, name]) => {
                  const i = n++;
                  return (
                    <div key={v} role='option' tabIndex={-1} aria-selected={v === current} data-value={v}
                      ref={(el) => { items.current[i] = el; }} onClick={() => choose(i)}>{name}</div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Pick;
