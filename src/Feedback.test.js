import { feedbackFields, feedbackUrl } from './Feedback';

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
