import { Range } from './sound.js'

/**
 * コード文字列を解析して、構成音の配列を返します。
 * - "Cmaj7", "G7(b9)", "Am/G" のような一般的なコード表記に対応しています。
 * - "C△7", "C-7" のような別表記も正規化して処理します。
 * - テンションノートや分数コードにも対応しています。
 * - 構成音はシャープ表記で計算された後、一部の音（D#, G#, A#）はフラット表記（Eb, Ab, Bb）に変換されて返されます。
 * @param {string} chordString - 解析するコード名 (例: "Cmaj7", "G7(b9)", "Am/G")
 * @returns {string[] | null} コードの構成音の配列 (例: ["C", "E", "G", "B"])。解析できない場合はnullを返します。
 */
export function parseChord (chordString) {
  if (!chordString || typeof chordString !== 'string') {
    console.error('chordStringが不正です')
    return null
  }

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  const normalizedStr = chordString
    .trim()
    .replace(/ /g, '')
    .replace(/♭/g, 'b')
    .replace(/♯/g, '#')
    .replace(/△/g, 'maj')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/-/g, 'm')
    .replace(/min/g, 'm')
    .replace(/M7/g, 'maj7')
    .replace(/m7\(b5\)/g, 'm7b5')
    .replace(/ø/g, 'm7b5')
    .replace(/o/g, 'dim')

  const normalizeNote = note =>
    note
      .replace(/Db/g, 'C#')
      .replace(/Eb/g, 'D#')
      .replace(/Gb/g, 'F#')
      .replace(/Ab/g, 'G#')
      .replace(/Bb/g, 'A#')

  const tempSet = new Set()

  let [main, bass] = normalizedStr.split('/')
  bass = bass ? normalizeNote(bass) : null
  if (bass) {
    tempSet.add(bass)
  }

  const match = main.match(/^([A-G][b#]?)(.*)$/)
  if (!match) {
    console.error('コードが[A-G][b#]?にマッチしません')
    return null
  }
  const root = normalizeNote(match[1])
  const rootIndex = noteNames.indexOf(root)
  if (rootIndex === -1) {
    console.error(`ルート音が不正です: ${match[1]}`)
    return null
  }

  let type = match[2]

  let coreType = type
  let tensionsArray = []
  const tensionMatch = type.match(/^(.*?)\((.*)\)$/)

  if (tensionMatch) {
    coreType = tensionMatch[1]
    const tensionsString = tensionMatch[2]
    if (tensionsString) {
      tensionsArray = tensionsString
        .split(',')
        .map(t => t.trim())
        .filter(t => t)
    }
  }

  if (coreType === 'M' || coreType === 'maj') {
    coreType = ''
  }

  const chordIntervals = {
    '': [0, 4, 7],
    maj: [0, 4, 7],
    m: [0, 3, 7],
    maj7: [0, 4, 7, 11],
    7: [0, 4, 7, 10],
    m7: [0, 3, 7, 10],
    m7b5: [0, 3, 6, 10],
    6: [0, 4, 7, 9],
    m6: [0, 3, 7, 9],
    69: [0, 4, 7, 9, 14],
    m69: [0, 3, 7, 9, 14],
    dim: [0, 3, 6],
    dim7: [0, 3, 6, 9],
    aug: [0, 4, 8],
    aug7: [0, 4, 8, 10],
    add9: [0, 4, 7, 14],
    madd9: [0, 3, 7, 14],
    sus4: [0, 5, 7],
    sus2: [0, 2, 7],
    mMaj7: [0, 3, 7, 11],
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
    // altered dominants
    '7b5': [0, 4, 6, 10],
    '7#5': [0, 4, 8, 10],
    '7b9#9': [0, 4, 7, 10, 13, 15],
    '7b9b13': [0, 4, 7, 10, 13, 20],
    '7#9b13': [0, 4, 7, 10, 15, 20]
  }

  const intervals = chordIntervals[coreType]
  if (intervals) {
    for (const i of intervals) {
      tempSet.add(noteNames[(rootIndex + i) % 12])
    }
  } else {
    console.error(`chordIntervalsにマッチしません: ${coreType}`)
    return null
  }

  const tensionIntervals = {
    9: 2,
    b9: 1,
    '#9': 3,
    11: 5,
    '#11': 6,
    b5: 6,
    13: 9,
    b13: 8,
    '#5': 8
  }

  if (tensionsArray.length > 0) {
    for (const tension of tensionsArray) {
      const interval = tensionIntervals[tension]
      if (interval !== undefined) {
        tempSet.add(noteNames[(rootIndex + interval) % 12])
      } else {
        console.warn(`不明なテンションです: ${tension}`)
      }
    }
  }

  const notes = Array.from(tempSet)

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
  let lastNoteIndex = Range.findIndex(note => note.endsWith(lowestOctave.toString())) - 1

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

// console.log(parseChord('XYZ'), 'XYZ')
// console.log(parseChord('C/E'), 'C/E')
// console.log(parseChord('C△'), 'C△')
// console.log(parseChord('BbM'), 'BbM')
// console.log(parseChord('F#maj7'), 'F#maj7')
// console.log(parseChord('Cm7'), 'Cm7')
// console.log(parseChord('G7(b9)'), 'G7(b9)')
// console.log(parseChord('Cmaj9'), 'Cmaj9')
// console.log(parseChord('Cmaj7(9)'), 'Cmaj7(9)')
// console.log(parseChord('C69'), 'C69')
// console.log(parseChord('C6(9)'), 'C6(9)')
// console.log(parseChord('Dø'), 'Dø')
// console.log(parseChord('Asus4'), 'Asus4')
// console.log(parseChord('Cmaj9'), 'Cmaj9')
// console.log(parseChord('Cmaj7(9)'), 'Cmaj7(9)')
// console.log(parseChord('C6(9)'), 'C6(9)')
// console.log(parseChord('Cm7(9)'), 'Cm7(9)')
// console.log(parseChord('C7(#9)'), 'C7(#9)')
// console.log(parseChord('C7(9)'), 'C7(9)')
// console.log(parseChord('C7(b9)'), 'C7(b9)')
// console.log(parseChord('C7(#11)'), 'C7(#11)')
// console.log(parseChord('C7(13)'), 'C7(13)')
// console.log(parseChord('C7(b13)'), 'C7(b13)')
