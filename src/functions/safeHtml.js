// Chat and the roll log are stored as HTML in Firebase, which anyone in a channel can write to.
// escapeHtml() turns typed text into plain text before it is stored; cleanHtml() runs on every
// stored message before it is shown, keeping only the markup the app itself writes.
const artSrc = require('./diceArt.js').artSrc;

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const allowedTags = ['SPAN', 'BR', 'B', 'P', 'A', 'IMG'];
const droppedTags = ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT'];
const safeStyle = /^\s*((max-width|width|height|font-size)\s*:\s*(\d+px|small)\s*;?\s*)+$/i;

function cleanAttributes(el) {
  const tag = el.tagName;
  Array.from(el.attributes).forEach((attr) => {
    const name = attr.name.toLowerCase();
    const value = attr.value;
    let keep = false;
    if (name === 'title' || name === 'alt') keep = true;
    else if (name === 'class') keep = /^[a-z0-9 -]*$/i.test(value);
    else if (name === 'style') keep = safeStyle.test(value);
    else if (name === 'src') keep = tag === 'IMG' && /^\/images\/[a-z0-9/_!-]+\.png$/i.test(value);
    else if (name === 'href') keep = tag === 'A' && /^https?:\/\//i.test(value);
    if (!keep) el.removeAttribute(attr.name);
    else if (name === 'src') el.setAttribute('src', artSrc(value));
  });
}

function cleanNode(node) {
  Array.from(node.childNodes).forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) return;
    if (child.nodeType !== Node.ELEMENT_NODE) {
      node.removeChild(child);
      return;
    }
    if (droppedTags.includes(child.tagName)) {
      node.removeChild(child);
      return;
    }
    cleanNode(child);
    if (allowedTags.includes(child.tagName)) {
      cleanAttributes(child);
      if (child.tagName === 'IMG' && !child.hasAttribute('src')) node.removeChild(child);
    } else {
      // Not ours: keep what it says, drop the tag.
      while (child.firstChild) node.insertBefore(child.firstChild, child);
      node.removeChild(child);
    }
  });
}

function cleanHtml(html) {
  if (typeof html !== 'string' || html === '') return '';
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  cleanNode(doc.body);
  return doc.body.innerHTML;
}

module.exports = {
  escapeHtml: escapeHtml,
  cleanHtml: cleanHtml,
};
