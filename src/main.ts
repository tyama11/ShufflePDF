import './style.css';
import { PDFDocument } from 'pdf-lib';
import { AppState, ShuffleOptions } from './types';
import { translations, getUserLanguage } from './translations';
import { initTheme } from './theme';
import { determinePageUnits, shuffleArray } from './shuffle';

document.addEventListener('DOMContentLoaded', () => {
  // --- 状態管理 ---
  const state: AppState = {
    originalPdfBytes: null,
    shuffledPdfBytes: null,
    originalFileName: '',
    userLang: getUserLanguage(),
  };

  // --- DOM要素のキャッシュ ---
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const exclusiveSwitches = document.querySelectorAll<HTMLInputElement>('.exclusive-switch');
  const shuffleAllPages = document.getElementById('shuffleAllPages') as HTMLInputElement | null;
  const fixFirstPageSimple = document.getElementById(
    'fixFirstPageSimple'
  ) as HTMLInputElement | null;
  const fixCover = document.getElementById('fixCover') as HTMLInputElement | null;
  const fixFirstSpread = document.getElementById('fixFirstSpread') as HTMLInputElement | null;
  const allSpreads = document.getElementById('allSpreads') as HTMLInputElement | null;
  const preserveLastPage = document.getElementById('preserveLastPage') as HTMLInputElement | null;
  const lastPageFixLabel = document.getElementById('lastPageFixLabel');
  const chooseFileBtn = document.getElementById('chooseFileBtn') as HTMLButtonElement | null;
  const shuffleBtn = document.getElementById('shuffleBtn') as HTMLButtonElement | null;
  const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement | null;
  const shareTwitterBtn = document.getElementById('shareTwitterBtn') as HTMLButtonElement | null;
  const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement | null;
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  const pageInfo = document.getElementById('pageInfo');
  const pageCountEl = document.getElementById('pageCount');
  const githubLink = document.getElementById('githubLink');

  // --- テーマ初期化 ---
  initTheme(themeToggle);

  // --- UI更新ヘルパー ---
  function showStatus(
    key: string,
    type: 'info' | 'success' | 'error',
    replacements: Record<string, string | number> = {}
  ): void {
    if (!status) return;
    let message = translations[state.userLang][key] || key;
    for (const placeholder in replacements) {
      message = message.replace(`\${${placeholder}}`, String(replacements[placeholder]));
    }
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
  }

  function hideStatus(): void {
    if (status) {
      status.style.display = 'none';
    }
  }

  function showLoading(show = true): void {
    if (loading) {
      loading.style.display = show ? 'block' : 'none';
    }
  }

  function updateLastPageFixLabel(): void {
    if (!lastPageFixLabel) return;
    const isSpreadMode =
      Boolean(fixCover?.checked) ||
      Boolean(fixFirstSpread?.checked) ||
      Boolean(allSpreads?.checked);
    lastPageFixLabel.textContent = isSpreadMode
      ? translations[state.userLang].fixLastSpread
      : translations[state.userLang].fixLastPage;
  }

  // --- 国際化 (i18n) ---
  function applyTranslations(): void {
    html.lang = state.userLang;
    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      const translation = translations[state.userLang]?.[key];
      if (translation) {
        if (el.tagName.toLowerCase() === 'meta') {
          el.setAttribute('content', translation);
        } else if (el.tagName.toLowerCase() === 'title') {
          el.textContent = translation;
        } else if (key === 'themeToggle') {
          el.setAttribute('aria-label', translation);
        } else if (key === 'footerText2' || key.startsWith('faqA')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    if (githubLink) {
      githubLink.setAttribute('aria-label', translations[state.userLang].githubAriaLabel);
    }
  }

  // --- シャッフルオプション取得 ---
  function getShuffleOptions(): ShuffleOptions {
    return {
      shuffleAllPages: Boolean(shuffleAllPages?.checked),
      fixFirstPageSimple: Boolean(fixFirstPageSimple?.checked),
      fixCover: Boolean(fixCover?.checked),
      fixFirstSpread: Boolean(fixFirstSpread?.checked),
      allSpreads: Boolean(allSpreads?.checked),
      preserveLast: Boolean(preserveLastPage?.checked),
    };
  }

  function createStatusMessage(
    results: {
      shuffledUnitsCount: number;
      fixedPrefixUnits: number[][];
      fixedSuffixUnits: number[][];
    },
    options: ShuffleOptions
  ): void {
    const { shuffledUnitsCount, fixedPrefixUnits, fixedSuffixUnits } = results;

    if (shuffledUnitsCount === 0 && (fixedPrefixUnits.length > 0 || fixedSuffixUnits.length > 0)) {
      showStatus('statusAllFixed', 'info');
      return;
    }

    if (shuffledUnitsCount > 0) {
      const fixedPageParts: string[] = [];
      if (options.fixFirstPageSimple || options.fixCover) {
        fixedPageParts.push(translations[state.userLang].fixedPart_fixCover);
      } else if (options.fixFirstSpread) {
        fixedPageParts.push(translations[state.userLang].fixedPart_fixFirstSpread);
      }

      if (options.preserveLast) {
        const lastUnit = fixedSuffixUnits[0] || [];
        const lastKey = lastUnit.length > 1 ? 'fixedPart_lastSpread' : 'fixedPart_lastPage';
        fixedPageParts.push(translations[state.userLang][lastKey]);
      }

      if (fixedPageParts.length > 0) {
        const conjunctions: Record<string, string> = {
          ja: 'と',
          en: ' and ',
          zh: '和',
          es: ' y ',
        };
        const fixedPages = fixedPageParts.join(conjunctions[state.userLang] || ' and ');
        showStatus('statusShuffledWithFixed', 'success', {
          shuffledCount: shuffledUnitsCount,
          fixedPages,
        });
      } else {
        showStatus('statusShuffled', 'success', { shuffledCount: shuffledUnitsCount });
      }
    }
  }

  // --- PDF ファイルハンドラ ---
  async function handleFile(file: File): Promise<void> {
    if (file.type !== 'application/pdf') {
      showStatus('statusPdfOnly', 'error');
      return;
    }

    state.originalFileName = file.name;
    showLoading(true);
    hideStatus();

    try {
      const arrayBuffer = await file.arrayBuffer();
      state.originalPdfBytes = new Uint8Array(arrayBuffer);

      const pdfDoc = await PDFDocument.load(state.originalPdfBytes);
      const pageCount = pdfDoc.getPageCount();

      if (pageCountEl) {
        pageCountEl.textContent = translations[state.userLang].pageCountText.replace(
          '${pageCount}',
          String(pageCount)
        );
      }
      if (pageInfo) pageInfo.style.display = 'block';
      if (shuffleBtn) shuffleBtn.disabled = false;
      if (downloadBtn) downloadBtn.style.display = 'none';
      state.shuffledPdfBytes = null;

      showStatus('statusFileLoaded', 'success', { fileName: file.name });
    } catch (error) {
      console.error('PDF読み込みエラー:', error);
      showStatus('statusLoadError', 'error');
    } finally {
      showLoading(false);
    }
  }

  // --- PDF シャッフル処理 ---
  async function shufflePDF(): Promise<void> {
    if (!state.originalPdfBytes) {
      showStatus('statusSelectFirst', 'error');
      return;
    }

    showLoading(true);
    if (shuffleBtn) shuffleBtn.disabled = true;
    hideStatus();

    try {
      const originalDoc = await PDFDocument.load(state.originalPdfBytes);
      const pageCount = originalDoc.getPageCount();

      if (pageCount === 0) {
        showStatus('statusNoPages', 'error');
        return;
      }

      const options = getShuffleOptions();
      const { fixedPrefixUnits, shuffleUnits, fixedSuffixUnits } = determinePageUnits(
        pageCount,
        options
      );

      // シャッフル実行
      if (shuffleUnits.length > 1) {
        shuffleArray(shuffleUnits);
      }

      const finalOrder = [
        ...fixedPrefixUnits.flat(),
        ...shuffleUnits.flat(),
        ...fixedSuffixUnits.flat(),
      ];

      // 新しいPDFを生成
      const newDoc = await PDFDocument.create();
      if (finalOrder.length > 0) {
        const copiedPages = await newDoc.copyPages(originalDoc, finalOrder);
        copiedPages.forEach((page) => newDoc.addPage(page));
      }

      state.shuffledPdfBytes = await newDoc.save();

      // UI更新
      createStatusMessage(
        {
          shuffledUnitsCount: shuffleUnits.length,
          fixedPrefixUnits,
          fixedSuffixUnits,
        },
        options
      );

      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.style.display = 'inline-block';
      }
    } catch (error) {
      console.error('シャッフルエラー:', error);
      showStatus('statusShuffleError', 'error');
    } finally {
      showLoading(false);
      if (shuffleBtn) shuffleBtn.disabled = false;
    }
  }

  // --- PDF ダウンロード ---
  function downloadShuffledPDF(): void {
    if (!state.shuffledPdfBytes) {
      showStatus('statusShuffleFirst', 'error');
      return;
    }

    try {
      const blob = new Blob([state.shuffledPdfBytes.buffer as ArrayBuffer], {
        type: 'application/pdf',
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      const baseName = state.originalFileName.replace(/\.pdf$/i, '');
      a.download = `${baseName}_shuffled.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showStatus('statusDownloaded', 'success');
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      showStatus('statusDownloadError', 'error');
    }
  }

  // --- 共有機能 ---
  function shareToTwitter(): void {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(translations[state.userLang].metaDesc);
    const hashtags = encodeURIComponent(translations[state.userLang].hashtags);

    const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=${hashtags}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  function showCopySuccess(): void {
    if (!copyBtn) return;
    const originalContent = copyBtn.innerHTML;

    copyBtn.classList.add('copied');
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
      </svg>
      <span>${translations[state.userLang].copyBtnCopied}</span>
    `;
    showStatus('statusCopySuccess', 'success');

    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.innerHTML = originalContent;
    }, 2000);
  }

  function fallbackCopyTextToClipboard(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopySuccess();
      } else {
        showStatus('statusCopyError', 'error');
      }
    } catch (err) {
      console.error('Fallback clipboard copy failed:', err);
      showStatus('statusCopyError', 'error');
    }

    document.body.removeChild(textArea);
  }

  async function copyLink(): Promise<void> {
    const url = window.location.href;

    try {
      if (!navigator.clipboard || !window.isSecureContext) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(url);
      showCopySuccess();
    } catch (err) {
      console.error('Clipboard API failed, falling back.', err);
      fallbackCopyTextToClipboard(url);
    }
  }

  // --- イベントリスナー設定 ---
  function setupEventListeners(): void {
    exclusiveSwitches.forEach((switchEl) => {
      switchEl.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          exclusiveSwitches.forEach((otherSwitch) => {
            if (otherSwitch !== target) {
              otherSwitch.checked = false;
            }
          });
        }
        updateLastPageFixLabel();
      });
    });

    chooseFileBtn?.addEventListener('click', () => fileInput?.click());
    shuffleBtn?.addEventListener('click', shufflePDF);
    downloadBtn?.addEventListener('click', downloadShuffledPDF);
    shareTwitterBtn?.addEventListener('click', shareToTwitter);
    copyBtn?.addEventListener('click', copyLink);

    uploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('dragover');
    });

    uploadArea?.addEventListener('dragleave', () => {
      uploadArea.classList.remove('dragover');
    });

    uploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('dragover');
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        handleFile(target.files[0]);
      }
    });
  }

  // --- 初期化実行 ---
  setupEventListeners();
  applyTranslations();
  updateLastPageFixLabel();
});
