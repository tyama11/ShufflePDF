import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { LANGUAGES, pageUrl } from '../build/seo-html.ts';
import { translations } from '../src/translations.ts';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

for (const lang of LANGUAGES) {
  test(`dist contains valid localized HTML for ${lang}`, () => {
    const filePath =
      lang === 'ja' ? path.resolve('dist/index.html') : path.resolve(`dist/${lang}/index.html`);

    assert.ok(fs.existsSync(filePath), `Localized html file exists: ${filePath}`);
    const html = fs.readFileSync(filePath, 'utf-8');

    // <html lang> matches
    const langMatch = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);
    assert.ok(langMatch, `lang attribute in <html> found for ${lang}`);
    assert.equal(langMatch[1], lang, `Expected lang="${lang}", got "${langMatch[1]}"`);

    // <title> equals the escaped translated title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    assert.ok(titleMatch, `<title> found for ${lang}`);
    const expectedTitle = escapeHtml(translations[lang].title);
    assert.equal(titleMatch[1], expectedTitle, `Title should match escaped translated title`);

    // canonical equals pageUrl(lang)
    const canonicalLink = Array.from(html.matchAll(/<link\b([^>]*)>/gi)).find((m) =>
      /(?<![a-zA-Z0-9-])rel=["']canonical["']/i.test(m[1])
    );
    assert.ok(canonicalLink, `canonical <link> found for ${lang}`);
    const canonicalHrefMatch = canonicalLink[1].match(/(?<![a-zA-Z0-9-])href=["']([^"']+)["']/i);
    assert.ok(canonicalHrefMatch, `canonical href found for ${lang}`);
    assert.equal(canonicalHrefMatch[1], pageUrl(lang), `Canonical should equal pageUrl(${lang})`);

    // 5 hreflang alternates
    const alternateLinks = Array.from(html.matchAll(/<link\b([^>]*)>/gi)).filter(
      (m) =>
        /(?<![a-zA-Z0-9-])rel=["']alternate["']/i.test(m[1]) &&
        /(?<![a-zA-Z0-9-])hreflang=["'][^"']+["']/i.test(m[1])
    );
    assert.equal(alternateLinks.length, 5, `Expected exactly 5 hreflang alternates for ${lang}`);

    // JSON-LD parses
    const scriptMatch = html.match(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i
    );
    assert.ok(scriptMatch, `application/ld+json script found for ${lang}`);
    const jsonLd = JSON.parse(scriptMatch[1]);
    assert.equal(jsonLd.url, pageUrl(lang), `JSON-LD url should match pageUrl(${lang})`);
    assert.equal(jsonLd.inLanguage, lang, `JSON-LD inLanguage should match ${lang}`);

    // the h1 contains the translated headline
    const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    assert.ok(h1Match, `<h1> found for ${lang}`);
    const expectedHeadline = escapeHtml(translations[lang].headline);
    assert.ok(
      h1Match[1].includes(expectedHeadline) || h1Match[1].includes(translations[lang].headline),
      `h1 should contain translated headline for ${lang}`
    );

    // the module script src starts with /ShufflePDF/assets/
    const moduleScript = Array.from(html.matchAll(/<script\b([^>]*)>/gi)).find(
      (m) =>
        /(?<![a-zA-Z0-9-])type=["']module["']/i.test(m[1]) &&
        /(?<![a-zA-Z0-9-])src=["'][^"']+["']/i.test(m[1])
    );
    assert.ok(moduleScript, `module script tag found for ${lang}`);
    const scriptSrcMatch = moduleScript[1].match(/(?<![a-zA-Z0-9-])src=["']([^"']+)["']/i);
    assert.ok(scriptSrcMatch, `module script src attribute found for ${lang}`);
    assert.ok(
      scriptSrcMatch[1].startsWith('/ShufflePDF/assets/'),
      `Module script src should start with /ShufflePDF/assets/, got: ${scriptSrcMatch[1]}`
    );

    // the en page's <title>, <h1>, and <main> contain no hiragana or katakana
    if (lang === 'en') {
      const jpRegex = /\p{Script=Hiragana}|\p{Script=Katakana}/u;
      assert.doesNotMatch(titleMatch[1], jpRegex, 'en title should not contain Japanese kana');
      assert.doesNotMatch(h1Match[1], jpRegex, 'en h1 should not contain Japanese kana');

      const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
      assert.ok(mainMatch, '<main> found in en page');
      assert.doesNotMatch(mainMatch[1], jpRegex, 'en main should not contain Japanese kana');
    }
  });
}

test('dist/sitemap.xml contains all 4 page URLs', () => {
  const sitemapPath = path.resolve('dist/sitemap.xml');
  assert.ok(fs.existsSync(sitemapPath), 'dist/sitemap.xml exists');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
  for (const lang of LANGUAGES) {
    const url = pageUrl(lang);
    assert.ok(sitemapContent.includes(url), `dist/sitemap.xml contains ${url}`);
  }
});

test('dist static assets exist', () => {
  const requiredAssets = [
    'dist/og-image.png',
    'dist/favicon.svg',
    'dist/favicon-48x48.png',
    'dist/apple-touch-icon.png',
  ];

  for (const asset of requiredAssets) {
    assert.ok(fs.existsSync(path.resolve(asset)), `${asset} exists`);
  }
});
