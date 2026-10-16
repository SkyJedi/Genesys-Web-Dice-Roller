import { renderToStaticMarkup } from 'react-dom/server';
import { dieCard } from './Dice';

// The symbols are written as escapes/entities in src (Node 23.2 build bug); the page must still show the characters.
it('die cards show their symbols and arrow buttons', () => {
  const html = renderToStaticMarkup(dieCard('triumph', 2, () => {}, () => {}));
  expect(html).toContain('★');
  expect(html).toContain('↓');
  expect(html).toContain('↑');
  expect(html).toContain('<span class="n">2</span>');
  expect(renderToStaticMarkup(dieCard('lightside', 0, () => {}, () => {}))).toContain('○');
});
