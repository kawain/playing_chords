import { Measure, ChordProgression } from './dataStructure.js'

// 移調計算の基準となる音名配列（シャープ表記）
const NOTE_NAMES_SHARP = [
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

/**
 * 単一の音名（ルート音やベース音）を移調するヘルパー関数
 * @param {string} note - 移調する音名 (例: "C#", "Eb")
 * @param {number} semitones - 移調する半音の数 (正の値で上げ、負の値で下げる)
 * @returns {string} 移調後の音名
 */
function transposeNoteName (note, semitones) {
  // "Db"のようなフラット表記を"C#"のようなシャープ表記に正規化して計算しやすくする
  const normalizedNote = note
    .replace('Db', 'C#')
    .replace('Eb', 'D#')
    .replace('Gb', 'F#')
    .replace('Ab', 'G#')
    .replace('Bb', 'A#')

  const currentIndex = NOTE_NAMES_SHARP.indexOf(normalizedNote)
  if (currentIndex === -1) {
    return note // "C"~"B"以外の文字だった場合はそのまま返す
  }

  // (currentIndex + semitones) が負になっても正しく計算するためのトリック
  const newIndex = (currentIndex + semitones + 12) % 12
  return NOTE_NAMES_SHARP[newIndex]
}

/**
 * ChordProgressionオブジェクトを受け取り、指定された半音数だけ移調した
 * 新しいChordProgressionオブジェクトを返す。
 * @param {ChordProgression} progression - 元となるコード進行オブジェクト
 * @param {number} semitones - 移調する半音の数 (0~11)
 * @returns {ChordProgression} 移調後の新しいコード進行オブジェクト
 */
export function transposeChordProgression (progression, semitones) {
  // 移調の必要がなければ、元のオブジェクトをそのまま返す
  if (semitones === 0) {
    return progression
  }

  const newMeasures = progression.measures.map(measure => {
    const newChords = measure.chords.map(chordStr => {
      if (!chordStr) return '' // 空の文字列はそのまま

      // コード文字列を「ルート音」「コードのクオリティ（maj7など）」「ベース音」に分解する正規表現
      const match = chordStr.match(/^([A-G][b#]?)([^/]*)(?:\/([A-G][b#]?))?$/)

      if (!match) {
        return chordStr // "Cmaj7"のような形式でない場合はそのまま返す
      }

      const root = match[1]
      const quality = match[2]
      const bassNote = match[3]

      const transposedRoot = transposeNoteName(root, semitones)

      if (bassNote) {
        const transposedBass = transposeNoteName(bassNote, semitones)
        return `${transposedRoot}${quality}/${transposedBass}`
      } else {
        return `${transposedRoot}${quality}`
      }
    })

    return new Measure(measure.numerator, measure.denominator, newChords)
  })

  return new ChordProgression(progression.title, progression.tempo, newMeasures)
}
