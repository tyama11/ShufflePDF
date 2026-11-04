import { defineConfig, type Plugin } from 'vite';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { translations } from './src/translations';
import { renderLocalizedHtml } from './build/seo-html';

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

      const jaHtml = renderLocalizedHtml(templateHtml, 'ja', translations.ja);
      await fs.promises.writeFile(indexPath, jaHtml, 'utf-8');

      const otherLangs: ('en' | 'zh' | 'es')[] = ['en', 'zh', 'es'];
      for (const lang of otherLangs) {
        const langDir = path.resolve(resolvedOutDir, lang);
        await fs.promises.mkdir(langDir, { recursive: true });
        const localizedHtml = renderLocalizedHtml(templateHtml, lang, translations[lang]);
        await fs.promises.writeFile(path.resolve(langDir, 'index.html'), localizedHtml, 'utf-8');
      }
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
