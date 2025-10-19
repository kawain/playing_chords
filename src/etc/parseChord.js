import { Range } from './sound.js'

/**
 * 音楽コード名から構成音（低音から高音）を返す関数。
 *
 * 引数 chordStr は、Windowsのメモ帳でも文字化けしない ASCII 表記で記述します。
 * シャープは「#」、フラットは「b」を使い、特殊記号（△, Φ など）は使用しません。
 *
 * 【書き方のルール】
 *
 * 1. ルート音は A〜G のいずれかを使用し、# や b を付けて半音を表します。
 *    例:  C, C#, Db, D, Eb, F#, G#, A#, Bb など
 *
 * 2. コードタイプ（構成）は英字・数字・記号で記述します。
 *    主な対応例：
 *      - C        → メジャー（C, E, G）
 *      - Cm       → マイナー（C, D#, G）
 *      - C7       → ドミナント7th
 *      - Cmaj7    → メジャー7th
 *      - Cm7      → マイナー7th
 *      - Cm7b5    → ハーフディミニッシュ
 *      - Cdim     → ディミニッシュ
 *      - Caug     → オーグメント（C, E, G#）
 *      - Csus2    → サス2
 *      - Csus4    → サス4
 *      - Cadd9    → アドナイン（C, E, G, D）
 *      - C6, Cm6  → シックス
 *      - C9, Cm9, Cmaj9 → ナインス
 *      - C11, Cm11, Cmaj11 → イレブンス
 *      - C13, Cm13, Cmaj13 → サーティーンサス
 *      - C7b9, C7#9, C7b5, C7#5, C7b13, C7#9b13 → オルタードテンション
 *
 * 3. テンションなどの修飾は () で囲ってもOKです。
 *    例: C7(#9), C7(b9,b13), Ab7(#5)
 *
 * 4. オンコード（スラッシュコード）に対応しています。
 *    「C/E」 のように書くと、E をベースにしたコードとして処理されます。
 *    （結果の配列ではベース音が最初の要素になります）
 *
 * 5. 出力はシャープ表記（C#など）で統一されます。
 *    フラット表記（Dbなど）を使いたい場合は、後で変換してください。
 *
 * 6. 未対応または未知のコードタイプが指定された場合は、デフォルトでメジャートライアド（C, E, G）として処理されます。
 *
 * 例:
 *   parseChord("Cmaj7")     → ["C", "E", "G", "B"]
 *   parseChord("Cm7b5")     → ["C", "D#", "F#", "A#"]
 *   parseChord("Ab7(#9)")   → ["G#", "C", "D#", "F#", "A#"]
 *   parseChord("C/E")       → ["E", "G", "C"]
 * @param {string} chordStr - 解析するコード名 (例: "Cmaj7", "Am7/G")
 * @returns {string[] | null} コードの構成音の配列 (例: ["C", "E", "G", "B"])。解析に失敗した場合はnullを返します。
 */
export function parseChord (chordStr) {
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

  const normalizeNote = note =>
    note
      .replace(/Db/g, 'C#')
      .replace(/Eb/g, 'D#')
      .replace(/Gb/g, 'F#')
      .replace(/Ab/g, 'G#')
      .replace(/Bb/g, 'A#')

  // コード構成の定義（半音単位）
  const chordFormulas = {
    '': [0, 4, 7], // major
    m: [0, 3, 7], // minor
    dim: [0, 3, 6], // diminished
    aug: [0, 4, 8], // augmented
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],

    // 6, 7, maj7 系
    6: [0, 4, 7, 9],
    m6: [0, 3, 7, 9],
    7: [0, 4, 7, 10],
    m7: [0, 3, 7, 10],
    maj7: [0, 4, 7, 11],
    mMaj7: [0, 3, 7, 11],
    dim7: [0, 3, 6, 9],
    m7b5: [0, 3, 6, 10],

    // 9系
    9: [0, 4, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14],
    m9: [0, 3, 7, 10, 14],
    '7b9': [0, 4, 7, 10, 13],
    '7#9': [0, 4, 7, 10, 15],

    // 11系
    11: [0, 4, 7, 10, 14, 17],
    m11: [0, 3, 7, 10, 14, 17],
    maj11: [0, 4, 7, 11, 14, 17],

    // 13系
    13: [0, 4, 7, 10, 14, 17, 21],
    m13: [0, 3, 7, 10, 14, 17, 21],
    maj13: [0, 4, 7, 11, 14, 17, 21],

    // add 系
    add9: [0, 4, 7, 14],
    madd9: [0, 3, 7, 14],

    // altered dominants
    '7b5': [0, 4, 6, 10],
    '7#5': [0, 4, 8, 10],
    '7b9#9': [0, 4, 7, 10, 13, 15],
    '7b9b13': [0, 4, 7, 10, 13, 20],
    '7#9b13': [0, 4, 7, 10, 15, 20]
  }

  // スラッシュコード対応
  let [main, bass] = chordStr.split('/')
  main = main.trim()
  bass = bass ? normalizeNote(bass.trim()) : null

  // root と type 抽出
  const match = main.match(/^([A-G][b#]?)(.*)$/)
  if (!match) return null

  const root = normalizeNote(match[1])
  let type = match[2].trim()

  // CM7 のような大文字のMをmajに置換
  type = type.replace(/M/g, 'maj')

  // ()内の置換
  type = type
    .replace(/\(\s*([^)]+)\s*\)/g, '$1')
    .replace(/\s+/g, '')
    .toLowerCase()

  // 大文字小文字を正規化
  type = type
    .replace(/^m(?!aj)/, 'm') // m7, m9など
    .replace(/maj/, 'maj')
    .replace(/dim/, 'dim')
    .replace(/aug|\+/, 'aug')

  // 一致するコード構造を探す（長い方優先）
  let formula = null
  for (const key of Object.keys(chordFormulas).sort(
    (a, b) => b.length - a.length
  )) {
    if (type === key) {
      formula = chordFormulas[key]
      break
    }
  }

  // 未定義コード → major triad
  if (!formula) formula = chordFormulas['']

  const rootIndex = noteNames.indexOf(root)
  if (rootIndex < 0) return null

  // 構成音算出
  const notes = formula.map(i => noteNames[(rootIndex + i) % 12])

  // スラッシュコードならベースを最初に
  if (bass) {
    if (!notes.includes(bass)) notes.unshift(bass)
    else notes.splice(notes.indexOf(bass), 1) && notes.unshift(bass)
  }

  // 配列の要素が'D#'なら'Eb'、'G#'なら'Ab'、'A#'なら'Bb'に置換する
  notes.forEach((note, index) => {
    if (note === 'D#') notes[index] = 'Eb'
    else if (note === 'G#') notes[index] = 'Ab'
    else if (note === 'A#') notes[index] = 'Bb'
  })

  return notes
}

/**
 * コードの構成音の配列（オクターブなし）に、適切なオクターブを割り当てて返します。
 * 音は常に上方向に積まれていきます。
 * @param {string[]} rawNotes - オクターブなしの構成音の配列 (例: ["C", "E", "G"])
 * @param {number} [lowestOctave=3] - 最初の音が配置される最低のオクターブ
 * @returns {string[]} オクターブ付きの音名の配列 (例: ["C3", "E3", "G3"])
 */
export function assignOctavesToChordNotes (rawNotes, lowestOctave = 3) {
  if (rawNotes.length === 0) return []

  const notesWithOctaves = []
  // 検索を開始するインデックスを決定
  // lowestOctaveの最初の音（例: C3）を探し、そこから検索を開始する
  let lastNoteIndex =
    Range.findIndex(note => note.endsWith(lowestOctave.toString())) - 1

  for (const rawNote of rawNotes) {
    // 前の音のインデックスより後から、次の音を探す
    const foundIndex = Range.findIndex(
      (note, index) => index > lastNoteIndex && note.slice(0, -1) === rawNote
    )
    const foundNote = Range[foundIndex]
    notesWithOctaves.push(foundNote)
    lastNoteIndex = foundIndex
  }
  return notesWithOctaves
}

// let notes = parseChord('Cmaj7')
// console.log(notes)
// console.log(assignOctavesToChordNotes(notes))
