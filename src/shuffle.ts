import { ShuffleOptions, ShuffleUnitsResult } from './types';

/**
 * Fisher-Yates アルゴリズムを用いて配列をインプレースでシャッフルします。
 */
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

/**
 * シャッフルオプションに基づいて、固定ユニットとシャッフル対象ユニットを決定します。
 */
export function determinePageUnits(pageCount: number, options: ShuffleOptions): ShuffleUnitsResult {
  const pageIndices = Array.from({ length: pageCount }, (_, i) => i);
  const fixedPrefixUnits: number[][] = [];
  const fixedSuffixUnits: number[][] = [];

  // 1. 先頭の固定ユニットを分離
  if (options.fixFirstPageSimple && pageIndices.length > 0) {
    const first = pageIndices.shift();
    if (first !== undefined) fixedPrefixUnits.push([first]);
  } else if (options.fixCover && pageIndices.length > 0) {
    const first = pageIndices.shift();
    if (first !== undefined) fixedPrefixUnits.push([first]);
  } else if (options.fixFirstSpread && pageIndices.length > 1) {
    const first = pageIndices.shift();
    const second = pageIndices.shift();
    if (first !== undefined && second !== undefined) {
      fixedPrefixUnits.push([first, second]);
    }
  }

  // 2. シャッフル対象をユニット化
  const isSpreadMode = options.fixCover || options.fixFirstSpread || options.allSpreads;
  const shuffleUnits: number[][] = [];
  if (isSpreadMode) {
    // 見開きモード
    for (let i = 0; i < pageIndices.length; i += 2) {
      if (i + 1 < pageIndices.length) {
        shuffleUnits.push([pageIndices[i], pageIndices[i + 1]]);
      } else {
        shuffleUnits.push([pageIndices[i]]);
      }
    }
  } else {
    // ページ単位シャッフル
    for (const index of pageIndices) {
      shuffleUnits.push([index]);
    }
  }

  // 3. 末尾の固定ユニットを分離
  if (options.preserveLast && shuffleUnits.length > 0) {
    const lastUnit = shuffleUnits.pop();
    if (lastUnit) {
      fixedSuffixUnits.unshift(lastUnit);
    }
  }

  return { fixedPrefixUnits, shuffleUnits, fixedSuffixUnits };
}
