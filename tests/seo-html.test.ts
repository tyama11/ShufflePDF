import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SITE_URL,
  LANGUAGES,
  langDir,
  pageUrl,
  renderLocalizedHtml,
  renderRedirectHtml,
  ROOT_FORWARD_SCRIPT,
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
        <a href="/ShufflePDF/zh-cn/" data-lang-link="zh-CN">简体中文</a>
        <a href="/ShufflePDF/zh-tw/" data-lang-link="zh-TW">繁體中文</a>
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

test('langDir returns empty string for en and lowercase otherwise', () => {
  assert.equal(langDir('en'), '');
  assert.equal(langDir('ja'), 'ja');
  assert.equal(langDir('zh-CN'), 'zh-cn');
  assert.equal(langDir('zh-TW'), 'zh-tw');
  assert.equal(langDir('es'), 'es');
});

test('pageUrl generates correct URLs for all languages', () => {
  assert.equal(SITE_URL, 'https://tyama11.github.io/ShufflePDF/');
  assert.deepEqual(LANGUAGES, ['ja', 'en', 'zh-CN', 'zh-TW', 'es']);
  assert.equal(pageUrl('en'), 'https://tyama11.github.io/ShufflePDF/');
  assert.equal(pageUrl('ja'), 'https://tyama11.github.io/ShufflePDF/ja/');
  assert.equal(pageUrl('zh-CN'), 'https://tyama11.github.io/ShufflePDF/zh-cn/');
  assert.equal(pageUrl('zh-TW'), 'https://tyama11.github.io/ShufflePDF/zh-tw/');
  assert.equal(pageUrl('es'), 'https://tyama11.github.io/ShufflePDF/es/');
});

test('rule a: sets <html lang="..."> attribute to current lang', () => {
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  assert.match(enRender, /<html\s+[^>]*\blang="en"/);

  const esRender = renderLocalizedHtml(fixtureHtml, 'es', fixtureT);
  assert.match(esRender, /<html\s+[^>]*\blang="es"/);

  const zhTwRender = renderLocalizedHtml(fixtureHtml, 'zh-TW', fixtureT);
  assert.match(zhTwRender, /<html\s+[^>]*\blang="zh-TW"/);

  const zhCnRender = renderLocalizedHtml(fixtureHtml, 'zh-CN', fixtureT);
  assert.match(zhCnRender, /<html\s+[^>]*\blang="zh-CN"/);

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
  assert.doesNotMatch(enRender, /data-lang-link="zh-CN"[^>]*aria-current/);
  assert.doesNotMatch(enRender, /data-lang-link="zh-TW"[^>]*aria-current/);
  assert.doesNotMatch(enRender, /data-lang-link="es"[^>]*aria-current/);

  const zhTwRender = renderLocalizedHtml(fixtureHtml, 'zh-TW', fixtureT);
  assert.match(zhTwRender, /<a\s+href="\/ShufflePDF\/zh-tw\/"\s+data-lang-link="zh-TW"\s+aria-current="page">繁體中文<\/a>/);
  assert.doesNotMatch(zhTwRender, /data-lang-link="ja"[^>]*aria-current/);
  assert.doesNotMatch(zhTwRender, /data-lang-link="en"[^>]*aria-current/);
  assert.doesNotMatch(zhTwRender, /data-lang-link="zh-CN"[^>]*aria-current/);
  assert.doesNotMatch(zhTwRender, /data-lang-link="es"[^>]*aria-current/);

  const jaRender = renderLocalizedHtml(fixtureHtml, 'ja', fixtureT);
  assert.match(jaRender, /<a\s+href="\/ShufflePDF\/"\s+data-lang-link="ja"\s+aria-current="page">日本語<\/a>/);
  assert.doesNotMatch(jaRender, /data-lang-link="en"[^>]*aria-current/);
});

test('rule e: exactly 8 hreflang alternates and en canonical has no language segment', () => {
  const jaRender = renderLocalizedHtml(fixtureHtml, 'ja', fixtureT);

  // Ja canonical has /ja/ segment
  assert.match(jaRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/ja\/">/);

  // Exactly 8 hreflang alternates in order
  const alternateMatches = jaRender.match(/<link\s+rel="alternate"\s+hreflang="[^"]+"\s+href="[^"]+">/g) || [];
  assert.equal(alternateMatches.length, 8);

  assert.equal(
    alternateMatches[0],
    '<link rel="alternate" hreflang="ja" href="https://tyama11.github.io/ShufflePDF/ja/">'
  );
  assert.equal(
    alternateMatches[1],
    '<link rel="alternate" hreflang="en" href="https://tyama11.github.io/ShufflePDF/">'
  );
  assert.equal(
    alternateMatches[2],
    '<link rel="alternate" hreflang="zh-CN" href="https://tyama11.github.io/ShufflePDF/zh-cn/">'
  );
  assert.equal(
    alternateMatches[3],
    '<link rel="alternate" hreflang="zh-TW" href="https://tyama11.github.io/ShufflePDF/zh-tw/">'
  );
  assert.equal(
    alternateMatches[4],
    '<link rel="alternate" hreflang="zh-HK" href="https://tyama11.github.io/ShufflePDF/zh-tw/">'
  );
  assert.equal(
    alternateMatches[5],
    '<link rel="alternate" hreflang="zh-SG" href="https://tyama11.github.io/ShufflePDF/zh-cn/">'
  );
  assert.equal(
    alternateMatches[6],
    '<link rel="alternate" hreflang="es" href="https://tyama11.github.io/ShufflePDF/es/">'
  );
  assert.equal(
    alternateMatches[7],
    '<link rel="alternate" hreflang="x-default" href="https://tyama11.github.io/ShufflePDF/">'
  );

  // zh-HK points to .../zh-tw/ and zh-SG to .../zh-cn/
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="zh-HK"') && m.includes('href="https://tyama11.github.io/ShufflePDF/zh-tw/"')));
  assert.ok(alternateMatches.some((m) => m.includes('hreflang="zh-SG"') && m.includes('href="https://tyama11.github.io/ShufflePDF/zh-cn/"')));

  // En render canonical and alternates
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  assert.match(enRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/">/);
  assert.match(enRender, /<meta\s+property="og:url"\s+content="https:\/\/tyama11\.github\.io\/ShufflePDF\/">/);
  assert.match(enRender, /<meta\s+name="twitter:url"\s+content="https:\/\/tyama11\.github\.io\/ShufflePDF\/">/);
  assert.match(enRender, /<meta\s+property="og:locale"\s+content="en_US">/);

  // zh-TW render canonical, og:url, og:locale
  const zhTwRender = renderLocalizedHtml(fixtureHtml, 'zh-TW', fixtureT);
  assert.match(zhTwRender, /<link\s+rel="canonical"\s+href="https:\/\/tyama11\.github\.io\/ShufflePDF\/zh-tw\/">/);
  assert.match(zhTwRender, /<meta\s+property="og:url"\s+content="https:\/\/tyama11\.github\.io\/ShufflePDF\/zh-tw\/">/);
  assert.match(zhTwRender, /<meta\s+property="og:locale"\s+content="zh_TW">/);
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

test('og-image-ja.png on ja and not on en', () => {
  const htmlWithOg = fixtureHtml.replace(
    '</head>',
    '    <meta property="og:image" content="https://tyama11.github.io/ShufflePDF/og-image.png">\n</head>'
  );

  const jaRender = renderLocalizedHtml(htmlWithOg, 'ja', fixtureT);
  assert.ok(
    jaRender.includes('https://tyama11.github.io/ShufflePDF/og-image-ja.png'),
    'ja should use og-image-ja.png'
  );
  assert.ok(
    !jaRender.includes('https://tyama11.github.io/ShufflePDF/og-image.png'),
    'ja should not contain og-image.png'
  );

  const enRender = renderLocalizedHtml(htmlWithOg, 'en', fixtureT);
  assert.ok(
    enRender.includes('https://tyama11.github.io/ShufflePDF/og-image.png'),
    'en should keep og-image.png'
  );
  assert.ok(
    !enRender.includes('https://tyama11.github.io/ShufflePDF/og-image-ja.png'),
    'en should not contain og-image-ja.png'
  );
});

test('forward script present only on en and placed right after <head>', () => {
  const enRender = renderLocalizedHtml(fixtureHtml, 'en', fixtureT);
  const expectedTag = `<head><script>${ROOT_FORWARD_SCRIPT}</script>`;
  assert.ok(enRender.includes(expectedTag), 'en page should have forward script right after <head>');

  for (const lang of LANGUAGES) {
    if (lang === 'en') continue;
    const localized = renderLocalizedHtml(fixtureHtml, lang, fixtureT);
    assert.ok(
      !localized.includes(ROOT_FORWARD_SCRIPT),
      `Non-en page (${lang}) should not include ROOT_FORWARD_SCRIPT`
    );
  }
});

test('ROOT_FORWARD_SCRIPT behavior test table', () => {
  function runScript(options: {
    browserLanguages?: string[];
    browserLanguage?: string;
    saved?: string | null;
    throwOnSaved?: boolean;
    search?: string;
  }): string[] {
    const replaceCalls: string[] = [];
    const locationStub = {
      search: options.search ?? '',
      replace(url: string) {
        replaceCalls.push(url);
      },
    };

    const localStorageStub = {
      getItem(): string | null {
        if (options.throwOnSaved) {
          throw new Error('localStorage disabled');
        }
        return options.saved ?? null;
      },
    };

    const navigatorStub = {
      languages: options.browserLanguages,
      language: options.browserLanguage,
    };

    const fn = new Function('location', 'localStorage', 'navigator', 'URLSearchParams', ROOT_FORWARD_SCRIPT);
    fn(locationStub, localStorageStub, navigatorStub, URLSearchParams);
    return replaceCalls;
  }

  // 1. browser ja-JP, no saved, no query -> forwards to /ShufflePDF/ja/
  assert.deepEqual(
    runScript({ browserLanguage: 'ja-JP' }),
    ['/ShufflePDF/ja/'],
    'browser ja-JP, no saved, no query -> forwards'
  );

  // 2. browser en-US, no saved -> no forward
  assert.deepEqual(
    runScript({ browserLanguage: 'en-US' }),
    [],
    'browser en-US, no saved -> no forward'
  );

  // 3. browser ja-JP, saved 'en' -> no forward
  assert.deepEqual(
    runScript({ browserLanguage: 'ja-JP', saved: 'en' }),
    [],
    'browser ja-JP, saved en -> no forward'
  );

  // 4. browser ja-JP, saved 'zh-CN' -> no forward
  assert.deepEqual(
    runScript({ browserLanguage: 'ja-JP', saved: 'zh-CN' }),
    [],
    'browser ja-JP, saved zh-CN -> no forward'
  );

  // 5. browser en-US, saved 'ja' -> forwards
  assert.deepEqual(
    runScript({ browserLanguage: 'en-US', saved: 'ja' }),
    ['/ShufflePDF/ja/'],
    'browser en-US, saved ja -> forwards'
  );

  // 6. browser ja-JP, search '?lang=en' -> no forward
  assert.deepEqual(
    runScript({ browserLanguage: 'ja-JP', search: '?lang=en' }),
    [],
    'browser ja-JP, search ?lang=en -> no forward'
  );

  // 7. localStorage.getItem throws, browser ja-JP -> forwards
  assert.deepEqual(
    runScript({ browserLanguage: 'ja-JP', throwOnSaved: true }),
    ['/ShufflePDF/ja/'],
    'localStorage.getItem throws, browser ja-JP -> forwards'
  );

  // 8. navigator.languages ['en-US','ja'] with navigator.language 'ja' -> no forward (first language wins)
  assert.deepEqual(
    runScript({
      browserLanguages: ['en-US', 'ja'],
      browserLanguage: 'ja',
    }),
    [],
    "navigator.languages ['en-US','ja'] with navigator.language 'ja' -> no forward (first language wins)"
  );
});

test('renderRedirectHtml contains canonical, the meta refresh, and location.replace with the target', () => {
  const target = 'https://tyama11.github.io/ShufflePDF/';
  const html = renderRedirectHtml(target);

  assert.ok(html.includes('<html lang="en">'), 'has <html lang="en">');
  assert.ok(html.includes('<meta charset="UTF-8">'), 'has charset meta');
  assert.ok(html.includes('<title>PDF Page Shuffle</title>'), 'has title');
  assert.ok(
    html.includes(`<link rel="canonical" href="${target}">`),
    'has link canonical with target'
  );
  assert.ok(
    html.includes(`<meta http-equiv="refresh" content="0; url=${target}">`),
    'has meta refresh with target'
  );
  assert.ok(
    html.includes(`location.replace(${JSON.stringify(target)})`),
    'has location.replace with JSON-encoded target'
  );
  assert.ok(
    html.includes(`<a href="${target}">`),
    'has body link with target'
  );
});
