const noteNames = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B'
]

// ------------------------------------
// 以下、コード進行だけから
// 最も可能性の高いキーを判定する
// ------------------------------------

/**
 * 音名（シャープ表記）から半音階のインデックス（0-11）を取得する。
 * 例: 'C' -> 0, 'C#' -> 1, 'B' -> 11
 * @param {string} note - 音名 (例: "C", "G#")
 * @returns {number} 半音階インデックス
 */
function noteToChromaticIndex (note) {
  // parseChord内のnormalizeNoteと同様に、フラットをシャープに正規化してからインデックスを取得
  const normalized = note
    .replace(/Db/g, 'C#')
    .replace(/Eb/g, 'D#')
    .replace(/Gb/g, 'F#')
    .replace(/Ab/g, 'G#')
    .replace(/Bb/g, 'A#')
  return noteNames.indexOf(normalized)
}

/**
 * 半音階のインデックスから音名（シャープ表記）を取得する。
 * @param {number} index - 半音階インデックス (0-11)
 * @returns {string} 音名
 */
function chromaticIndexToNote (index) {
  return noteNames[index % 12]
}

/**
 * "C", "Am", "G7", "Cmaj7" のようなコード文字列から { root: string, type: string } オブジェクトを解析する。
 * parseChord関数の内部ロジックを簡略化して、キー判定に必要な情報（ルートとタイプ）のみを抽出します。
 * 既存のparseChord関数と連携させたい場合は、parseChordの結果から必要な情報を抽出するように変更できます。
 * @param {string} chordStr - 解析するコード名
 * @returns {{root: string, type: string} | null} コードのルートとタイプ。解析に失敗した場合はnull。
 */
function parseSingleChordString (chordStr) {
  // parseChord内のnormalizeNoteと同様の処理
  const normalizeNote = note =>
    note
      .replace(/Db/g, 'C#')
      .replace(/Eb/g, 'D#')
      .replace(/Gb/g, 'F#')
      .replace(/Ab/g, 'G#')
      .replace(/Bb/g, 'A#')

  let mainChordPart = chordStr.split('/')[0].trim() // オンコードのベース音はここでは無視

  const match = mainChordPart.match(/^([A-G][b#]?)(.*)$/)
  if (!match) return null

  const root = normalizeNote(match[1])
  let typeSuffix = match[2].trim().toLowerCase()

  // ()内の置換や大文字小文字の正規化はparseChordで既に処理されているが、ここでも簡易的に行う
  typeSuffix = typeSuffix
    .replace(/\(\s*([^)]+)\s*\)/g, '$1')
    .replace(/\s+/g, '')

  let chordType = 'maj' // デフォルトはメジャー

  if (typeSuffix.startsWith('m')) {
    if (typeSuffix.includes('maj7')) {
      // 例: CmM7 (マイナーメジャー7th)
      chordType = 'mMaj7'
    } else if (typeSuffix.includes('7')) {
      // 例: Cm7
      chordType = 'm7'
    } else {
      // 例: Cm
      chordType = 'm'
    }
  } else if (typeSuffix.startsWith('maj7') || typeSuffix.startsWith('m7b5')) {
    // Cmaj7, Cm7b5
    chordType = typeSuffix
  } else if (typeSuffix.startsWith('dim')) {
    // Cdim
    chordType = 'dim'
  } else if (typeSuffix.startsWith('7')) {
    // C7
    chordType = '7'
  } else if (typeSuffix === '') {
    // ルート音のみの場合 (例: "C")
    chordType = 'maj'
  }
  // その他の複雑なテンションコードは、ここでは簡易的に基本タイプに丸めるか、別途定義
  // 例: C9, C11, C13などは '7' に含める、または 'maj', 'm' などに分類する
  // 今回は主要なコードタイプに限定

  return { root: root, type: chordType }
}

/**
 * 指定されたキー（長調または短調）のダイアトニックコード (ルート音, コードタイプ) のリストを返す。
 * @param {string} keyRootNote - キーのルート音 (例: "C", "G#")
 * @param {string} keyType - キーのタイプ ("major" または "minor")
 * @returns {{root: string, type: string}[]} ダイアトニックコードの配列
 */
function getDiatonicChordsForKey (keyRootNote, keyType) {
  const keyRootIndex = noteToChromaticIndex(keyRootNote)
  const diatonicChords = []

  if (keyType === 'major') {
    // 長調のダイアトニックコード: I, ii, iii, IV, V, vi, vii°
    // major scale intervals: 0, 2, 4, 5, 7, 9, 11
    // Corresponding qualities: maj, m, m, maj, 7 (or maj), m, dim (or m7b5)
    const intervalsAndQualities = [
      { interval: 0, type: 'maj' },
      { interval: 0, type: 'maj7' },
      { interval: 2, type: 'm' },
      { interval: 2, type: 'm7' },
      { interval: 4, type: 'm' },
      { interval: 4, type: 'm7' },
      { interval: 5, type: 'maj' },
      { interval: 5, type: 'maj7' },
      { interval: 7, type: 'maj' },
      { interval: 7, type: '7' }, // V and V7
      { interval: 9, type: 'm' },
      { interval: 9, type: 'm7' },
      { interval: 11, type: 'dim' },
      { interval: 11, type: 'm7b5' } // vii° and viim7b5
    ]
    intervalsAndQualities.forEach(item => {
      diatonicChords.push({
        root: chromaticIndexToNote((keyRootIndex + item.interval) % 12),
        type: item.type
      })
    })
  } else if (keyType === 'minor') {
    // 短調のダイアトニックコード (ナチュラルマイナーとハーモニックマイナーの組み合わせ)
    // i, ii°, III, iv, V (maj or 7), VI, VII (maj) or vii° (from harmonic minor)
    const intervalsAndQualities = [
      { interval: 0, type: 'm' },
      { interval: 0, type: 'm7' },
      { interval: 2, type: 'dim' },
      { interval: 2, type: 'm7b5' },
      { interval: 3, type: 'maj' },
      { interval: 3, type: 'maj7' },
      { interval: 5, type: 'm' },
      { interval: 5, type: 'm7' },
      { interval: 7, type: 'm' },
      { interval: 7, type: 'maj' },
      { interval: 7, type: '7' }, // v, V, V7
      { interval: 8, type: 'maj' },
      { interval: 8, type: 'maj7' },
      { interval: 10, type: 'maj' }, // VII (natural minor)
      { interval: 11, type: 'dim' } // vii° (harmonic minor)
    ]
    intervalsAndQualities.forEach(item => {
      diatonicChords.push({
        root: chromaticIndexToNote((keyRootIndex + item.interval) % 12),
        type: item.type
      })
    })
  }

  // 重複を排除 (rootとtypeの両方が同じものを削除)
  const uniqueDiatonicChords = []
  const seen = new Set()
  for (const chord of diatonicChords) {
    const key = `${chord.root}-${chord.type}`
    if (!seen.has(key)) {
      uniqueDiatonicChords.push(chord)
      seen.add(key)
    }
  }
  return uniqueDiatonicChords
}

/**
 * コード進行から最も可能性の高いキーを判定する。
 *
 * @param {string[]} progression - コード進行の文字列配列 (例: ["Cmaj7", "Am7", "Dm7", "G7"])
 * @returns {{keyRoot: string, keyType: string} | null} 判定されたキーのルートとタイプ (例: {keyRoot: "C", keyType: "major"})。判定できない場合はnull。
 */
function detectKey (progression) {
  if (!progression || progression.length === 0) {
    return null
  }

  // コード進行を解析し、{ root: string, type: string } のオブジェクトのリストにする
  const parsedProgression = progression
    .map(chordStr => parseSingleChordString(chordStr))
    .filter(Boolean)

  if (parsedProgression.length === 0) {
    return null
  }

  const allPotentialKeys = []

  // 全ての12の長調と12の短調を候補として評価
  for (const rootNoteCandidate of noteNames) {
    // --- 長調として評価 ---
    let majorKeyScore = 0
    const diatonicChordsMajor = getDiatonicChordsForKey(
      rootNoteCandidate,
      'major'
    )

    parsedProgression.forEach((chordInfo, index) => {
      const { root: chordRoot, type: chordType } = chordInfo

      // コードがダイアトニックコードに含まれていれば基本点を加算
      // find で root と type の両方が一致するものを探す
      if (
        diatonicChordsMajor.some(
          dc => dc.root === chordRoot && dc.type === chordType
        )
      ) {
        majorKeyScore += 1
      }

      // トニック (I) コードであれば高得点
      if (
        chordRoot === rootNoteCandidate &&
        (chordType === 'maj' || chordType === 'maj7')
      ) {
        majorKeyScore += 2
      }

      // ドミナント7th (V7) コードであれば高得点 (キーを強く示唆)
      const vRootIndex = (noteToChromaticIndex(rootNoteCandidate) + 7) % 12
      const vRootNote = chromaticIndexToNote(vRootIndex)
      if (chordRoot === vRootNote && chordType === '7') {
        majorKeyScore += 3
      }

      // 最初のコードと最後のコードがキーのトニックであればボーナス
      if (
        index === 0 &&
        chordRoot === rootNoteCandidate &&
        (chordType === 'maj' || chordType === 'maj7')
      ) {
        majorKeyScore += 1
      }
      if (
        index === parsedProgression.length - 1 &&
        chordRoot === rootNoteCandidate &&
        (chordType === 'maj' || chordType === 'maj7')
      ) {
        majorKeyScore += 1
      }
    })

    allPotentialKeys.push({
      keyRoot: rootNoteCandidate,
      keyType: 'major',
      score: majorKeyScore
    })

    // --- 短調として評価 ---
    let minorKeyScore = 0
    const diatonicChordsMinor = getDiatonicChordsForKey(
      rootNoteCandidate,
      'minor'
    )

    parsedProgression.forEach((chordInfo, index) => {
      const { root: chordRoot, type: chordType } = chordInfo

      // コードがダイアトニックコードに含まれていれば基本点を加算
      if (
        diatonicChordsMinor.some(
          dc => dc.root === chordRoot && dc.type === chordType
        )
      ) {
        minorKeyScore += 1
      }

      // トニック (i) コードであれば高得点
      if (
        chordRoot === rootNoteCandidate &&
        (chordType === 'm' || chordType === 'm7')
      ) {
        minorKeyScore += 2
      }

      // ドミナント7th (V7) コードであれば高得点 (ハーモニックマイナー由来)
      const vRootIndexMinor = (noteToChromaticIndex(rootNoteCandidate) + 7) % 12
      const vRootNoteMinor = chromaticIndexToNote(vRootIndexMinor)
      if (chordRoot === vRootNoteMinor && chordType === '7') {
        minorKeyScore += 3
      }

      // 最初のコードと最後のコードがキーのトニックであればボーナス
      if (
        index === 0 &&
        chordRoot === rootNoteCandidate &&
        (chordType === 'm' || chordType === 'm7')
      ) {
        minorKeyScore += 1
      }
      if (
        index === parsedProgression.length - 1 &&
        chordRoot === rootNoteCandidate &&
        (chordType === 'm' || chordType === 'm7')
      ) {
        minorKeyScore += 1
      }
    })

    allPotentialKeys.push({
      keyRoot: rootNoteCandidate,
      keyType: 'minor',
      score: minorKeyScore
    })
  }

  // スコアが高い順にソート
  allPotentialKeys.sort((a, b) => b.score - a.score)

  if (allPotentialKeys.length > 0) {
    const best = allPotentialKeys[0]
    return { keyRoot: best.keyRoot, keyType: best.keyType }
  }
  return null
}

// --- 使用例 ---
const progression1 = ['C', 'Am', 'Dm', 'G7']
console.log(
  `Progression: ${progression1.join(', ')} -> Detected Key:`,
  detectKey(progression1)
)

const progression2 = ['Am', 'Dm', 'G7', 'C']
console.log(
  `Progression: ${progression2.join(', ')} -> Detected Key:`,
  detectKey(progression2)
)

const progression3 = ['Am', 'G', 'C', 'F'] // A minor or C major
console.log(
  `Progression: ${progression3.join(', ')} -> Detected Key:`,
  detectKey(progression3)
)

const progression4 = ['Dm7', 'G7', 'Cmaj7'] // ii-V-I in C major
console.log(
  `Progression: ${progression4.join(', ')} -> Detected Key:`,
  detectKey(progression4)
)

const progression5 = ['Cm', 'Fm', 'G7', 'Cm'] // i-iv-V7-i in C minor
console.log(
  `Progression: ${progression5.join(', ')} -> Detected Key:`,
  detectKey(progression5)
)

const progression6 = ['Em7b5', 'A7', 'Dm7'] // ii-V-i in D minor
console.log(
  `Progression: ${progression6.join(', ')} -> Detected Key:`,
  detectKey(progression6)
)

// 複雑なコードタイプも試す
const progression7 = ['Cmaj7(#11)', 'F#m7b5', 'B7b9', 'Em7']
console.log(
  `Progression: ${progression7.join(', ')} -> Detected Key:`,
  detectKey(progression7)
)
