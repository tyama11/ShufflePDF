export type Language = 'ja' | 'en' | 'zh' | 'es';

export interface TranslationRecord {
  title: string;
  metaDesc: string;
  keywords: string;
  headline: string;
  shuffleAllPages: string;
  fixFirstPageSimple: string;
  fixCover: string;
  fixFirstSpread: string;
  allSpreads: string;
  fixLastPage: string;
  fixLastSpread: string;
  dropHere: string;
  or: string;
  chooseFile: string;
  loadingText: string;
  pageInfoTitle: string;
  pageCountText: string;
  shuffleBtnText: string;
  downloadBtnText: string;
  featuresTitle: string;
  descriptionText: string;
  featureShuffle: string;
  featureFix: string;
  featureSpreads: string;
  featureAllPages: string;
  featureDownload: string;
  featurePrivacy: string;
  shareTitle: string;
  shareTwitter: string;
  copyLink: string;
  copyBtnCopied: string;
  footerText1: string;
  footerText2: string;
  statusPdfOnly: string;
  statusFileLoaded: string;
  statusLoadError: string;
  statusSelectFirst: string;
  statusNoPages: string;
  statusAllFixed: string;
  statusShuffled: string;
  statusShuffledWithFixed: string;
  fixedPart_fixCover: string;
  fixedPart_fixFirstSpread: string;
  fixedPart_lastPage: string;
  fixedPart_lastSpread: string;
  statusShuffleError: string;
  statusShuffleFirst: string;
  statusDownloaded: string;
  statusDownloadError: string;
  statusCopySuccess: string;
  statusCopyError: string;
  hashtags: string;
  themeToggle: string;
  githubAriaLabel: string;
  faqTitle: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
  faqQ4: string;
  faqA4: string;
  faqQ5: string;
  faqA5: string;
  [key: string]: string;
}

export type TranslationKey = keyof TranslationRecord;

export interface ShuffleOptions {
  shuffleAllPages: boolean;
  fixFirstPageSimple: boolean;
  fixCover: boolean;
  fixFirstSpread: boolean;
  allSpreads: boolean;
  preserveLast: boolean;
}

export interface ShuffleUnitsResult {
  fixedPrefixUnits: number[][];
  shuffleUnits: number[][];
  fixedSuffixUnits: number[][];
}

export interface AppState {
  originalPdfBytes: Uint8Array | null;
  shuffledPdfBytes: Uint8Array | null;
  originalFileName: string;
  userLang: Language;
}
