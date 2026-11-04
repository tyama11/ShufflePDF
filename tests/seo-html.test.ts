import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_URL,
  LANGUAGES,
  pageUrl,
  renderLocalizedHtml,
} from '../build/seo-html.ts';
import type { TranslationRecord } from '../src/types';

const fixtureHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title data-i18n="title">オリジナルタイトル</title>
    <meta name="description" data-i18n="metaDesc" content="オリジナルの説明文">
    <meta property="og:title" data-i18n="title" content="オリジナルのOGタイトル">
    <meta property="og:url" content="https://tyama11.github.io/ShufflePDF/">
    <link rel="canonical" href="https://tyama11.github.io/ShufflePDF/">
    <link rel="alternate" hreflang="x-default" href="https://tyama11.github.io/ShufflePDF/">
</head>
<body>
    <header>
        <h1 data-i18n="headline">見出し</h1>
        <button id="theme-toggle" class="theme-btn" data-i18n="themeToggle" aria-label="テーマ切替">
            <svg class="sun" viewBox="0 0 24 24"><path d="M12 2v2" /></svg>
            <svg class="moon" viewBox="0 0 24 24"><path d="M12 20v2" /></svg>
        </button>
    </header>
    <nav class="lang-nav">
        <a href="/ShufflePDF/" data-lang-link="ja" aria-current="page">日本語</a>
        <a href="/ShufflePDF/en/" data-lang-link="en">English</a>
        <a href="/ShufflePDF/zh/" data-lang-link="zh">中文</a>
        <a href="/ShufflePDF/es/" data-lang-link="es">Español</a>
    </nav>
    <main>
        <span data-i18n="shuffleAllPages">全てのページ</span>
        <span id="lastPageFixLabel" data-i18n-target="lastPageFixLabel">元の最後のページ</span>
        <p data-i18n="unknownKey">変更されないテキスト</p>
        <div class="faq">
            <p data-i18n="faqA1">FAQ回答1</p>
            <p data-i18n="faqA5">FAQ回答5</p>
        </div>
    </main>
    <footer>
        <p data-i18n="footerText1">フッター1</p>
        <p data-i18n="footerText2">フッター2</p>
    </footer>
</body>
</html>`;

const fixtureT: TranslationRecord = {
  title: 'PDF Shuffle & <Tool> "Online"',
  metaDesc: 'Shuffle PDF pages safely with $& token & <privacy> protection',
  keywords: 'pdf, shuffle, test',
  headline: 'PDF Shuffle Tool with $& literal',
  shuffleAllPages: 'Shuffle <All> & "Every" Pages',
  fixFirstPageSimple: 'Fix First Page Only',
  fixCover: 'Fix Cover',
  fixFirstSpread: 'Fix First Spread',
  allSpreads: 'All Spreads',
  fixLastPage: 'Fix Last Page & $& "Escaped"',
  fixLastSpread: 'Fix Last Spread',
  dropHere: 'Drop Here',
  or: 'or',
  chooseFile: 'Choose File',
  loadingText: 'Loading...',
  pageInfoTitle: 'Page Info',
  pageCountText: 'Page Count',
  shuffleBtnText: 'Shuffle',
  downloadBtnText: 'Download',
  featuresTitle: 'Features',
  descriptionText: 'Description',
  featureShuffle: 'Feature Shuffle',
  featureFix: 'Feature Fix',
  featureSpreads: 'Feature Spreads',
  featureAllPages: 'Feature All',
  featureDownload: 'Feature Download',
  featurePrivacy: 'Feature Privacy',
  shareTitle: 'Share',
  shareTwitter: 'Share Twitter',
  copyLink: 'Copy Link',
  copyBtnCopied: 'Copied',
  footerText1: 'Copyright & Copy',
  footerText2: 'Visit <a id="githubLink" href="https://github.com/tyama11/ShufflePDF">GitHub</a> for $& code.',
  statusPdfOnly: 'PDF only',
  statusFileLoaded: 'File loaded',
  statusLoadError: 'Load error',
  statusSelectFirst: 'Select first',
  statusNoPages: 'No pages',
  statusAllFixed: 'All fixed',
  statusShuffled: 'Shuffled',
  statusShuffledWithFixed: 'Shuffled with fixed',
  fixedPart_fixCover: 'Cover',
  fixedPart_fixFirstSpread: 'First spread',
  fixedPart_lastPage: 'Last page',
  fixedPart_lastSpread: 'Last spread',
  statusShuffleError: 'Shuffle error',
  statusShuffleFirst: 'Shuffle first',
  statusDownloaded: 'Downloaded',
  statusDownloadError: 'Download error',
  statusCopySuccess: 'Copied',
  statusCopyError: 'Copy error',
  hashtags: 'hashtags',
  themeToggle: 'Toggle Theme & "Mode"',
  githubAriaLabel: 'GitHub Repo',
  faqTitle: 'FAQ',
  faqQ1: 'Question 1',
  faqA1: 'Yes, it is <b>completely free</b> with <i>no limits</i> & $& code.',
  faqQ2: 'Question 2',
  faqA2: 'Privacy guaranteed.',
  faqQ3: 'Question 3',
  faqA3: 'Answer 3',
  faqQ4: 'Question 4',
  faqA4: 'Answer 4',
  faqQ5: 'Question 5',
  faqA5: 'Yes, spreads are supported.<br>Option 1: <b>Cover fixed</b>.<br>Option 2: <b>Spread fixed</b>.',
};

test('pageUrl generates correct URLs for all languages', () => {
  assert.equal(SITE_URL, 'https://tyama11.github.io/ShufflePDF/');
  assert.deepEqual(LANGUAGES, ['ja', 'en', 'zh', 'es']);
  assert.equal(pageUrl('ja'), 'https://tyama11.github.io/ShufflePDF/');
  assert.equal(pageUrl('en'), 'https://tyama11.github.io/ShufflePDF/en/');
  assert.equal(pageUrl('zh'), 'https://tyama11.github.io/ShufflePDF/zh/');
  assert.equal(pageUrl('es'), 'https://tyama11.github.io/ShufflePDF/es/');
});

test('rule a: sets <html lang="..."> attribute to current lang', () => {
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  assert.match(enRender, /<html\s+[^>]*\blang="en"/);

  const esRender = renderLocalizedHtml(fixtureHtml, 'es', fixtureT);
  assert.match(esRender, /<html\s+[^>]*\blang="es"/);

  const jaRender = renderLocalizedHtml(fixtureHtml, 'ja', fixtureT);
  assert.match(jaRender, /<html\s+[^>]*\blang="ja"/);
});

test('rule b: escaping and attribute values', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  // Escaping in <title>
  assert.match(
    rendered,
    /<title\s+data-i18n="title">PDF Shuffle &amp; &lt;Tool&gt; &quot;Online&quot;<\/title>/
  );

  // Escaping in meta content attribute
  assert.match(
    rendered,
    /<meta\s+name="description"\s+data-i18n="metaDesc"\s+content="Shuffle PDF pages safely with \$&amp; token &amp; &lt;privacy&gt; protection">/
  );
  assert.match(
    rendered,
    /<meta\s+property="og:title"\s+data-i18n="title"\s+content="PDF Shuffle &amp; &lt;Tool&gt; &quot;Online&quot;">/
  );

  // Normal element escaping
  assert.match(
    rendered,
    /<span\s+data-i18n="shuffleAllPages">Shuffle &lt;All&gt; &amp; &quot;Every&quot; Pages<\/span>/
  );
});

test('rule b: a $& value staying literal without regex backreference expansion', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  // headline has $& which must not be replaced with matched tag text
  assert.match(
    rendered,
    /<h1\s+data-i18n="headline">PDF Shuffle Tool with \$&amp; literal<\/h1>/
  );
  assert.doesNotMatch(rendered, /PDF Shuffle Tool with <h1/);
});

test('rule b: raw faqA HTML and footerText2 replacement', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  // faqA1 inner HTML raw
  assert.match(
    rendered,
    /<p\s+data-i18n="faqA1">Yes, it is <b>completely free<\/b> with <i>no limits<\/i> & \$& code\.<\/p>/
  );

  // faqA5 inner HTML raw
  assert.match(
    rendered,
    /<p\s+data-i18n="faqA5">Yes, spreads are supported\.<br>Option 1: <b>Cover fixed<\/b>\.<br>Option 2: <b>Spread fixed<\/b>\.<\/p>/
  );

  // footerText2 inner HTML raw
  assert.match(
    rendered,
    /<p\s+data-i18n="footerText2">Visit <a id="githubLink" href="https:\/\/github\.com\/tyama11\/ShufflePDF">GitHub<\/a> for \$& code\.<\/p>/
  );
});

test('rule b: themeToggle sets aria-label and keeps svg children', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  const buttonMatch = rendered.match(/<button id="theme-toggle"[^>]*>([\s\S]*?)<\/button>/);
  assert.ok(buttonMatch, 'theme-toggle button found');
  assert.match(buttonMatch[0], /aria-label="Toggle Theme &amp; &quot;Mode&quot;"/);
  assert.match(buttonMatch[1], /<svg class="sun"/);
  assert.match(buttonMatch[1], /<svg class="moon"/);
});

test('rule b: unknown key is left alone', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  assert.match(
    rendered,
    /<p\s+data-i18n="unknownKey">変更されないテキスト<\/p>/
  );
});

test('rule c: data-i18n-target="lastPageFixLabel" gets escaped t.fixLastPage and does not conflict with data-i18n', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  assert.match(
    rendered,
    /<span\s+id="lastPageFixLabel"\s+data-i18n-target="lastPageFixLabel">Fix Last Page &amp; \$&amp; &quot;Escaped&quot;<\/span>/
  );
});

test('rule d: links with data-lang-link set aria-current="page" on matching language only', () => {
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  // English link has aria-current="page"
  assert.match(enRender, /<a\s+href="\/ShufflePDF\/en\/"\s+data-lang-link="en"\s+aria-current="page">English<\/a>/);
  // Japanese link no longer has aria-current
  assert.match(enRender, /<a\s+href="\/ShufflePDF\/"\s+data-lang-link="ja">日本語<\/a>/);
  assert.doesNotMatch(enRender, /data-lang-link="ja"[^>]*aria-current/);
  assert.doesNotMatch(enRender, /data-lang-link="zh"[^>]*aria-current/);
  assert.doesNotMatch(enRender, /data-lang-link="es"[^>]*aria-current/);

  const jaRender = renderLocalizedHtml(fixtureHtml, 'ja', fixtureT);
  assert.match(jaRender, /<a\s+href="\/ShufflePDF\/"\s+data-lang-link="ja"\s+aria-current="page">日本語<\/a>/);
  assert.doesNotMatch(jaRender, /data-lang-link="en"[^>]*aria-current/);
});

test('rule e: exactly 5 hreflang alternates and ja canonical has no language segment', () => {
  const jaRender = renderLocalizedHtml(fixtureHtml, 'ja', fixtureT);

  // Ja canonical has no language segment
  assert.match(jaRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/">/);
  assert.doesNotMatch(jaRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/ja\/?">/);

  // Exactly 5 hreflang alternates
  const alternateMatches = jaRender.match(/<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+">/g) || [];
  assert.equal(alternateMatches.length, 5);

  assert.ok(alternateMatches.some((m) => m.includes('hreflang="ja"') && m.includes('href="https://tyama11.github.io/ShufflePDF/"')));
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="en"') && m.includes('href="https://tyama11.github.io/ShufflePDF/en/"')));
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="zh"') && m.includes('href="https://tyama11.github.io/ShufflePDF/zh/"')));
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="es"') && m.includes('href="https://tyama11.github.io/ShufflePDF/es/"')));
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="x-default"') && m.includes('href="https://tyama11.github.io/ShufflePDF/en/"')));

  // En render canonical and alternates
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  assert.match(enRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/en\/">/);
  assert.match(enRender, /<meta\s+property="og:url"\s+content="https:\/\/tyama11\.github\.io\/ShufflePDF\/en\/">/);
  assert.match(enRender, /<meta\s+name="twitter:url"\s+content="https:\/\/tyama11\.github\.io\/ShufflePDF\/en\/">/);
  assert.match(enRender, /<meta\s+property="og:locale"\s+content="en_US">/);
});

test('rule e: JSON-LD parsing with JSON.parse and matching fields', () => {
  const rendered = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);

  const scriptMatch = rendered.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch, 'ld+json script tag found');

  const rawJson = scriptMatch[1];
  // Verify < was escaped as \u003c in raw HTML
  assert.ok(rawJson.includes('\\u003cTool>'));
  assert.ok(!rawJson.includes('<Tool>'));

  const data = JSON.parse(rawJson);
  assert.equal(data['@context'], 'https://schema.org');
  assert.equal(data['@type'], 'WebApplication');
  assert.equal(data.name, fixtureT.title);
  assert.equal(data.url, pageUrl('en'));
  assert.equal(data.description, fixtureT.metaDesc);
  assert.equal(data.inLanguage, 'en');
  assert.equal(data.applicationCategory, 'UtilitiesApplication');
  assert.equal(data.operatingSystem, 'Any');
  assert.equal(data.browserRequirements, 'Requires JavaScript');
  assert.equal(data.isAccessibleForFree, true);
  assert.deepEqual(data.offers, {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  });
  assert.equal(data.aggregateRating, undefined);
});
