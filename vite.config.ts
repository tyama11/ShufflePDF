import { defineConfig, type Plugin } from 'vite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { translations } from './src/translations';
import { LANGUAGES, langDir, pageUrl, renderLocalizedHtml, renderRedirectHtml } from './build/seo-html';

function localizedHtmlPlugin(): Plugin {
  let resolvedOutDir = 'dist';

  return {
    name: 'localized-html-plugin',
    apply: 'build',
    configResolved(config) {
      resolvedOutDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const indexPath = path.resolve(resolvedOutDir, 'index.html');
      const templateHtml = await fs.promises.readFile(indexPath, 'utf-8');

      const enHtml = renderLocalizedHtml(templateHtml, 'en', translations.en);
      await fs.promises.writeFile(indexPath, enHtml, 'utf-8');

      for (const lang of LANGUAGES) {
        if (lang === 'en') {
          continue;
        }
        const dir = path.resolve(resolvedOutDir, langDir(lang));
        await fs.promises.mkdir(dir, { recursive: true });
        const localizedHtml = renderLocalizedHtml(templateHtml, lang, translations[lang]);
        await fs.promises.writeFile(path.resolve(dir, 'index.html'), localizedHtml, 'utf-8');
      }

      const enDir = path.resolve(resolvedOutDir, 'en');
      await fs.promises.mkdir(enDir, { recursive: true });
      await fs.promises.writeFile(
        path.resolve(enDir, 'index.html'),
        renderRedirectHtml(pageUrl('en')),
        'utf-8'
      );
    },
  };
}

export default defineConfig({
  base: '/ShufflePDF/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  plugins: [localizedHtmlPlugin()],
});
