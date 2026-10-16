import { escapeHtml, cleanHtml } from './functions/safeHtml';

it('typed text is stored as plain text', () => {
  expect(escapeHtml('<b>hi</b> & "you"')).toBe('&lt;b&gt;hi&lt;/b&gt; &amp; &quot;you&quot;');
});

it('stored messages lose scripts, handlers and bad links', () => {
  const out = cleanHtml('<span>bob: <img src=x onerror=alert(1)><script>alert(2)</script>'
    + '<a href="javascript:alert(3)">click</a><iframe src="https://evil"></iframe><div onclick="x()">hey</div></span>');
  expect(out).not.toMatch(/onerror|onclick|script|javascript|iframe|alert\(1\)|<img/);
  expect(out).toContain('click');
  expect(out).toContain('hey');
});

it('the markup the app writes still shows', () => {
  const chat = '<span>bob: <img class=tinydie src=/images/blue.png />  </span>'
    + '<a href="https://example.com/?a=1&amp;b=2" style="font-size: small">https://example.com/?a=1&amp;b=2</a><span> </span>';
  const out = cleanHtml(chat);
  expect(out).toContain('<img class="tinydie" src="/images/blue.png">');
  expect(out).toContain('href="https://example.com/?a=1&amp;b=2"');
  expect(out).toContain('style="font-size: small"');

  const roll = '<span> bob rolled </span><img class=diceface src=/images/dice/blue-s.png /> <img class=diceface src=/images/dice/yellow-!s.png /> <img class=diceface src=/images/dice/blue-.png /> <br><span title=Success>x</span>'
    + "<img src=/images/purple.png alt='' style=max-width:15px />";
  const rolled = cleanHtml(roll);
  expect(rolled).toContain('src="/images/dice/blue-s.png"');
  expect(rolled).toContain('src="/images/dice/yellow-!s.png"');
  expect(rolled).toContain('src="/images/dice/blue-.png"');
  expect(rolled).toContain('<br>');
  expect(rolled).toContain('title="Success"');
  expect(rolled).toContain('style="max-width:15px"');

  expect(cleanHtml('bob 42<p>Minor nick</p>')).toBe('bob 42<p>Minor nick</p>');
});
