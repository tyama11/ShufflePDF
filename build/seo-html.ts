import type { Language, TranslationRecord } from '../src/types';

export const SITE_URL = 'https://tyama11.github.io/ShufflePDF/';

export const LANGUAGES: Language[] = ['ja', 'en', 'zh-CN', 'zh-TW', 'es'];

export function langDir(lang: Language): string {
  return lang === 'ja' ? '' : lang.toLowerCase();
}

export function pageUrl(lang: Language): string {
  return lang === 'ja' ? SITE_URL : `${SITE_URL}${langDir(lang)}/`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const OG_LOCALES: Record<Language, string> = {
  ja: 'ja_JP',
  en: 'en_US',
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  es: 'es_ES',
};

export function renderLocalizedHtml(html: string, lang: Language, t: TranslationRecord): string {
  let result = html;

  // a. Set <html lang="..."> to lang.
  result = result.replace(/<html\b([^>]*)>/i, (_match, attrs = '') => {
    if (/(?<![a-zA-Z0-9-])lang\s*=\s*(["'])[\s\S]*?\1/i.test(attrs)) {
      const newAttrs = attrs.replace(
        /(?<![a-zA-Z0-9-])lang\s*=\s*(["'])[\s\S]*?\1/i,
        () => `lang="${lang}"`
      );
      return `<html${newAttrs}>`;
    }
    return `<html lang="${lang}"${attrs}>`;
  });

  // b. For every opening tag with data-i18n="key" where t[key] exists:
  // First handle <meta> tags
  result = result.replace(
    /<meta\b((?:[^>"']|"[^"]*"|'[^']*')*?(?<![a-zA-Z0-9-])data-i18n(?![a-zA-Z0-9-])\s*=\s*(["'])([^"']+)\2(?:[^>"']|"[^"]*"|'[^']*')*)(\s*\/)?>/gi,
    (match, attrs, _q, key, slash = '') => {
      const val = t[key];
      if (val === undefined) {
        return match;
      }
      const escaped = escapeHtml(val);
      if (/(?<![a-zA-Z0-9-])content\s*=\s*(["'])[\s\S]*?\1/i.test(attrs)) {
        const newAttrs = attrs.replace(
          /(?<![a-zA-Z0-9-])content\s*=\s*(["'])[\s\S]*?\1/i,
          () => `content="${escaped}"`
        );
        return `<meta${newAttrs}${slash}>`;
      }
      return `<meta${attrs} content="${escaped}"${slash}>`;
    }
  );

  // Then handle non-meta elements
  result = result.replace(
    /<(?!meta\b)([a-zA-Z0-9]+)\b((?:[^>"']|"[^"]*"|'[^']*')*?(?<![a-zA-Z0-9-])data-i18n(?![a-zA-Z0-9-])\s*=\s*(["'])([^"']+)\3(?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, _q, key, children) => {
      const val = t[key];
      if (val === undefined) {
        return match;
      }

      if (key === 'themeToggle') {
        const escaped = escapeHtml(val);
        let newAttrs: string;
        if (/(?<![a-zA-Z0-9-])aria-label\s*=\s*(["'])[\s\S]*?\1/i.test(attrs)) {
          newAttrs = attrs.replace(
            /(?<![a-zA-Z0-9-])aria-label\s*=\s*(["'])[\s\S]*?\1/i,
            () => `aria-label="${escaped}"`
          );
        } else {
          newAttrs = `${attrs} aria-label="${escaped}"`;
        }
        return `<${tag}${newAttrs}>${children}</${tag}>`;
      }

      if (key === 'footerText2' || key.startsWith('faqA')) {
        return `<${tag}${attrs}>${val}</${tag}>`;
      }

      return `<${tag}${attrs}>${escapeHtml(val)}</${tag}>`;
    }
  );

  // c. The element with data-i18n-target="lastPageFixLabel" gets the escaped t.fixLastPage as inner content.
  result = result.replace(
    /<([a-zA-Z0-9]+)\b((?:[^>"']|"[^"]*"|'[^']*')*?(?<![a-zA-Z0-9-])data-i18n-target(?![a-zA-Z0-9-])\s*=\s*(["'])lastPageFixLabel\3(?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs) => {
      if (t.fixLastPage === undefined) {
        return match;
      }
      return `<${tag}${attrs}>${escapeHtml(t.fixLastPage)}</${tag}>`;
    }
  );

  // d. Links with attribute data-lang-link="<lang>": the one equal to the current lang gets aria-current="page".
  result = result.replace(
    /<([a-zA-Z0-9]+)\b((?:[^>"']|"[^"]*"|'[^']*')*?(?<![a-zA-Z0-9-])data-lang-link(?![a-zA-Z0-9-])\s*=\s*(["'])([^"']+)\3(?:[^>"']|"[^"]*"|'[^']*')*)>/gi,
    (_match, tag, attrs, _q, linkLang) => {
      if (linkLang === lang) {
        if (/(?<![a-zA-Z0-9-])aria-current\s*=\s*(["'])[\s\S]*?\1/i.test(attrs)) {
          const newAttrs = attrs.replace(
            /(?<![a-zA-Z0-9-])aria-current\s*=\s*(["'])[\s\S]*?\1/i,
            () => 'aria-current="page"'
          );
          return `<${tag}${newAttrs}>`;
        }
        return `<${tag}${attrs} aria-current="page">`;
      }
      const newAttrs = attrs.replace(
        /\s*(?<![a-zA-Z0-9-])aria-current\s*=\s*(["'])[\s\S]*?\1/gi,
        ''
      );
      return `<${tag}${newAttrs}>`;
    }
  );

  // e. Insert before </head>:
  // Remove existing canonical, hreflang alternates, og:url, twitter:url, og:locale, application/ld+json
  result = result.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*\/?>\s*/gi, '');
  result = result.replace(/<link\b[^>]*\bhreflang=["'][^"']*["'][^>]*\/?>\s*/gi, '');
  result = result.replace(/<meta\b[^>]*\bproperty=["']og:url["'][^>]*\/?>\s*/gi, '');
  result = result.replace(/<meta\b[^>]*\b(?:property|name)=["']twitter:url["'][^>]*\/?>\s*/gi, '');
  result = result.replace(/<meta\b[^>]*\bproperty=["']og:locale["'][^>]*\/?>\s*/gi, '');
  result = result.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi,
    ''
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t.title,
    url: pageUrl(lang),
    description: t.metaDesc,
    inLanguage: lang,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  const jsonLdEscaped = JSON.stringify(jsonLd, null, 2).replace(/</g, () => '\\u003c');

  const headElements = [
    `    <link rel="canonical" href="${pageUrl(lang)}">`,
    `    <link rel="alternate" hreflang="ja" href="${pageUrl('ja')}">`,
    `    <link rel="alternate" hreflang="en" href="${pageUrl('en')}">`,
    `    <link rel="alternate" hreflang="zh-CN" href="${pageUrl('zh-CN')}">`,
    `    <link rel="alternate" hreflang="zh-TW" href="${pageUrl('zh-TW')}">`,
    `    <link rel="alternate" hreflang="zh-HK" href="${pageUrl('zh-TW')}">`,
    `    <link rel="alternate" hreflang="zh-SG" href="${pageUrl('zh-CN')}">`,
    `    <link rel="alternate" hreflang="es" href="${pageUrl('es')}">`,
    `    <link rel="alternate" hreflang="x-default" href="${pageUrl('en')}">`,
    `    <meta property="og:url" content="${pageUrl(lang)}">`,
    `    <meta name="twitter:url" content="${pageUrl(lang)}">`,
    `    <meta property="og:locale" content="${OG_LOCALES[lang]}">`,
    `    <script type="application/ld+json">\n${jsonLdEscaped}\n    </script>`,
  ].join('\n');

  if (/<\/head>/i.test(result)) {
    result = result.replace(/<\/head>/i, () => `${headElements}\n</head>`);
  } else {
    result = `${result}\n${headElements}`;
  }

  return result;
}
