import { parseChord } from './parseChord.js'

export const root = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
export const quality = ['maj7', '7', 'm7', 'm7b5', '6', 'm6', 'dim7', 'aug7', 'mMaj7']
const fretboardNotes = [
  ['F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D'],
  ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A'],
  ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F'],
  ['Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C'],
  ['Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G'],
  ['F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#', 'D']
]

const MajorScale = [0, 2, 4, 5, 7, 9, 11]
const MelodicMinorScale = [0, 2, 3, 5, 7, 9, 11]
const HarmonicMinorScale = [0, 2, 3, 5, 7, 8, 11]

export const scales = {
  // Major Scale Modes
  'メジャー、アイオニアン': { base: MajorScale, start: 0 },
  'ドリアン（メジャー2音目〜）': { base: MajorScale, start: 1 },
  'フリジアン（メジャー3音目〜）': { base: MajorScale, start: 2 },
  'リディアン（メジャー4音目〜）': { base: MajorScale, start: 3 },
  'ミクソリディアン（メジャー5音目〜）': { base: MajorScale, start: 4 },
  'ナチュラル・マイナー、エオリアン（メジャー6音目〜）': { base: MajorScale, start: 5 },
  'ロクリアン（メジャー7音目〜）': { base: MajorScale, start: 6 },

  // Melodic Minor Scale Modes
  'メロディック・マイナー': { base: MelodicMinorScale, start: 0 },
  'ドリアン♭2（メロディック・マイナー2音目〜）': { base: MelodicMinorScale, start: 1 },
  'リディアン・オーグメント（メロディック・マイナー3音目〜）': { base: MelodicMinorScale, start: 2 },
  'リディアン・ドミナント（メロディック・マイナー4音目〜）': { base: MelodicMinorScale, start: 3 },
  'ミクソリディアン♭6（メロディック・マイナー5音目〜）': { base: MelodicMinorScale, start: 4 },
  'ロクリアン♮2（メロディック・マイナー6音目〜）': { base: MelodicMinorScale, start: 5 },
  'オルタード（メロディック・マイナー7音目〜）': { base: MelodicMinorScale, start: 6 },

  // Harmonic Minor Scale Modes
  'ハーモニック・マイナー': { base: HarmonicMinorScale, start: 0 },
  'ロクリアン♮6（ハーモニック・マイナー2音目〜）': { base: HarmonicMinorScale, start: 1 },
  'アイオニアン#5（ハーモニック・マイナー3音目〜）': { base: HarmonicMinorScale, start: 2 },
  'ドリアン#4（ハーモニック・マイナー4音目〜）': { base: HarmonicMinorScale, start: 3 },
  'フリジアン・ドミナント（ハーモニック・マイナー5音目〜）': { base: HarmonicMinorScale, start: 4 },
  'リディアン#2（ハーモニック・マイナー6音目〜）': { base: HarmonicMinorScale, start: 5 },
  'ウルトラ・ロクリアン（ハーモニック・マイナー7音目〜）': { base: HarmonicMinorScale, start: 6 },

  // Other Scales (モードに属さないもの)
  ホールトーン: { base: [0, 2, 4, 6, 8, 10], start: 0 },
  ディミニッシュト: { base: [0, 2, 3, 5, 6, 8, 9, 11], start: 0 },
  'マイナー・ペンタトニック': { base: [0, 3, 5, 7, 10], start: 0 },
  'メジャー・ペンタトニック': { base: [0, 2, 4, 7, 9], start: 0 },
  'メジャー・ブルース': { base: [0, 2, 3, 4, 7, 9], start: 0 },
  'マイナー・ブルース': { base: [0, 3, 5, 6, 7, 10], start: 0 }
}

export function getChordToneObjs (chord) {
  let sixth = false
  if (chord.endsWith('6')) {
    sixth = true
  }
  const chordNotes = parseChord(chord)
  const chordToneObjs = []
  for (let i = 0; i < chordNotes.length; i++) {
    for (let s = 0; s < fretboardNotes.length; s++) {
      for (let f = 0; f < fretboardNotes[s].length; f++) {
        if (chordNotes[i] === fretboardNotes[s][f]) {
          const obj = {
            stringIndex: s,
            fretboardCxIndex: f
          }
          if (i === 0) {
            // root
            obj.noteName = 'R'
            obj.circleColor = 'red'
            obj.textColor = 'white'
          } else if (i === 1) {
            // 3rd
            obj.noteName = '3'
            obj.circleColor = 'black'
            obj.textColor = 'white'
          } else if (i === 2) {
            // 5th
            obj.noteName = '5'
            obj.circleColor = 'black'
            obj.textColor = 'white'
          } else if (i === 3) {
            // 7th
            if (sixth) {
              obj.noteName = '6'
            } else {
              obj.noteName = '7'
            }
            obj.circleColor = 'black'
            obj.textColor = 'white'
          }
          chordToneObjs.push(obj)
        }
      }
    }
  }

  return chordToneObjs
}

/**
 * 指定されたルート音とスケール名から、フレットボード上に描画するための
 * スケール構成音オブジェクトの配列を生成します。(新しいデータ構造に対応)
 * @param {string} selectedRoot - 選択されたルート音 (例: 'C', 'E')
 * @param {string} selectedScale - 選択されたスケール名 (例: 'ドリアン（メジャー2音目〜）')
 * @returns {Array<object>} フレットボードに描画するための情報の配列
 */
export function getScaleToneObjs (selectedRoot, selectedScale) {
  const scaleDefinition = scales[selectedScale]
  if (!scaleDefinition) {
    console.error('指定されたスケール定義が見つかりません:', selectedScale)
    return []
  }

  const baseScale = scaleDefinition.base
  const startIndex = scaleDefinition.start

  let scaleIntervals

  if (startIndex === 0) {
    scaleIntervals = baseScale
  } else {
    // startが0以外の場合、モード（旋法）の計算を行う
    // a) baseスケールをstartIndexの位置で回転させる
    // 例: MajorScale [0, 2, 4, 5, 7, 9, 11] を start: 1 (ドリアン) で回転
    // -> [2, 4, 5, 7, 9, 11, 0]
    const rotatedScale = baseScale.slice(startIndex).concat(baseScale.slice(0, startIndex))

    // b) 回転させたスケールの最初の音が0になるように正規化する
    // これにより、新しいルートからの音程に変換される
    // 例: [2, 4, 5, 7, 9, 11, 0] の最初の音は 2 なので、全要素から 2 を引く
    //    (負になった場合は12を足してオクターブ内に収める)
    // -> [0, 2, 3, 5, 7, 9, 10] (これがドリアンスケールの音程)
    const normalizationValue = rotatedScale[0]
    scaleIntervals = rotatedScale.map(interval => (interval - normalizationValue + 12) % 12)
  }

  const rootIndex = root.indexOf(selectedRoot)
  if (rootIndex === -1) {
    console.error('指定されたルート音が見つかりません:', selectedRoot)
    return []
  }

  const chromaticScaleFromRoot = root.slice(rootIndex).concat(root.slice(0, rootIndex))

  const scaleNotes = scaleIntervals.map(interval => chromaticScaleFromRoot[interval])

  const scaleToneObjs = []

  for (let s = 0; s < fretboardNotes.length; s++) {
    // s = string index
    for (let f = 0; f < fretboardNotes[s].length; f++) {
      // f = fret index
      const currentNoteOnFretboard = fretboardNotes[s][f]

      if (scaleNotes.includes(currentNoteOnFretboard)) {
        const obj = {
          stringIndex: s,
          fretboardCxIndex: f
        }

        if (currentNoteOnFretboard === selectedRoot) {
          obj.noteName = 'R'
          obj.circleColor = 'red'
          obj.textColor = 'white'
        } else {
          obj.noteName = ''
          obj.circleColor = 'black'
          obj.textColor = ''
        }

        scaleToneObjs.push(obj)
      }
    }
  }

  return scaleToneObjs
}
