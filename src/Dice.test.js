import { renderToStaticMarkup } from 'react-dom/server';
import { dieCard } from './Dice';

// The symbols are written as escapes/entities in src (Node 23.2 build bug); the page must still show the characters.
it('each die colour draws its d12, d8 or d6 shape with facets', () => {
  ['yellow', 'red', 'white', 'green', 'purple', 'blue', 'black'].forEach((c) => {
    const html = renderToStaticMarkup(dieCard(c, 0, () => {}, () => {}));
    expect(html).toContain('class="facet');
    expect(html).toContain('<svg');
  });
});

it('die cards show their symbols and arrow buttons', () => {
  const html = renderToStaticMarkup(dieCard('triumph', 2, () => {}, () => {}));
  expect(html).toContain('★');
  expect(html).toContain('↓');
  expect(html).toContain('↑');
  expect(html).toContain('<span class="n">2</span>');
  expect(renderToStaticMarkup(dieCard('lightside', 0, () => {}, () => {}))).toContain('<i class="pp l"></i>');
});
