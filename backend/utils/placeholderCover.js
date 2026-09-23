const sharp = require("sharp");

// Deterministic pastel color per category, so covers are visually
// distinguishable even as plain placeholders.
const CATEGORY_COLORS = {
  Fiction: "#6C7DBD",
  "Non-Fiction": "#4C9F70",
  Academic: "#C0703A",
  Comics: "#B24C8F",
};

/**
 * Escapes characters that are meaningful in XML/SVG text nodes (&, <, >,
 * quotes) so titles/authors like "Kurose & Ross" don't break SVG parsing.
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds a simple PNG cover (title + author on a colored background) as a
 * Buffer, entirely in-memory - no external image files needed.
 */
async function generatePlaceholderCover({ title, author, category }) {
  const bg = CATEGORY_COLORS[category] || "#556080";
  const wrap = (text, max) => (text.length > max ? text.slice(0, max - 1) + "…" : text);
  const safeTitle = escapeXml(wrap(title, 22));
  const safeAuthor = escapeXml(wrap(author, 30));

  const svg = `
    <svg width="400" height="560" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bg}"/>
      <rect x="16" y="16" width="368" height="528" fill="none" stroke="#ffffff55" stroke-width="2"/>
      <text x="200" y="250" font-size="26" font-family="sans-serif" fill="#fff"
            text-anchor="middle" font-weight="bold">${safeTitle}</text>
      <text x="200" y="290" font-size="16" font-family="sans-serif" fill="#ffffffcc"
            text-anchor="middle">${safeAuthor}</text>
    </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

module.exports = { generatePlaceholderCover };