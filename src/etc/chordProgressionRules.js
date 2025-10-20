import {
  Measure,
  ChordProgression,
  Note,
  Track,
  MusicData,
  PlayableSequence
} from './dataStructure.js'
import { parseChord, assignOctavesToChordNotes } from './parseChord.js'
import { Range } from './sound.js'

/**
 * JSON文字列をChordProgressionオブジェクトに変換する
 * この関数は簡単にChordProgressionオブジェクトを作成するための一時的なものです
 * @param {string} jsonText - JSON形式の文字列
 * @returns {ChordProgression} ChordProgressionオブジェクト
 */
function parseChordProgression (jsonText) {
  try {
    const data = JSON.parse(jsonText)

    // バリデーション
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('Invalid or missing title')
    }

    if (!data.tempo || typeof data.tempo !== 'number' || data.tempo <= 0) {
      throw new Error('Invalid or missing tempo')
    }

    if (!Array.isArray(data.measures)) {
      throw new Error('Measures must be an array')
    }

    // Measureオブジェクトの配列を作成
    const measures = data.measures.map((measureData, index) => {
      if (
        !measureData.numerator ||
        typeof measureData.numerator !== 'number' ||
        measureData.numerator <= 0
      ) {
        throw new Error(`Invalid numerator in measure ${index + 1}`)
      }

      if (
        !measureData.denominator ||
        typeof measureData.denominator !== 'number' ||
        measureData.denominator <= 0
      ) {
        throw new Error(`Invalid denominator in measure ${index + 1}`)
      }

      if (!Array.isArray(measureData.chords)) {
        throw new Error(`Chords must be an array in measure ${index + 1}`)
      }

      return new Measure(
        measureData.numerator,
        measureData.denominator,
        measureData.chords
      )
    })

    // ChordProgressionオブジェクトを作成
    return new ChordProgression(data.title, data.tempo, measures)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format')
    }
    throw error
  }
}

const jsonText = `{
  "title": "My New Progression",
  "tempo": 120,
  "measures": [
    {
      "numerator": 4,
      "denominator": 4,
      "chords": ["C", "", "", ""]
    },
    {
      "numerator": 4,
      "denominator": 4,
      "chords": ["Am", "", "", ""]
    },
    {
      "numerator": 4,
      "denominator": 4,
      "chords": ["Dm", "", "", ""]
    },
    {
      "numerator": 4,
      "denominator": 4,
      "chords": ["G7", "", "", ""]
    }
  ]
}`

// let chordProgression = null

// try {
//   chordProgression = parseChordProgression(jsonText)
//   //   console.log(chordProgression)
// } catch (error) {
//   console.error('Error parsing chord progression:', error.message)
// }

//
// ここからchordProgressionをもとにしてPlayableSequenceを決められたルールでつくる
//

/**
 * カウントイン用のMusicDataを生成する
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {MusicData | null}
 */
function createCountInData (progression, beatDuration) {
  if (progression.measures.length === 0) {
    return null
  }
  const firstMeasure = progression.measures[0]
  const countInNumerator = firstMeasure.numerator
  const countInDuration = countInNumerator * beatDuration
  const countInNotes = Array.from(
    { length: countInNumerator },
    (_, i) => new Note(i * beatDuration, beatDuration, null)
  )
  const countInTrack = new Track('finger', countInNotes)
  return new MusicData(progression.tempo, countInDuration, [countInTrack])
}

/**
 * ハイハットのトラックを生成する
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createHihatTrack (progression, beatDuration) {
  const notes = []
  let currentTime = 0
  for (const measure of progression.measures) {
    for (let i = 0; i < measure.numerator; i++) {
      notes.push(new Note(currentTime + i * beatDuration, beatDuration, null))
    }
    currentTime += measure.numerator * beatDuration
  }
  return new Track('hihat', notes)
}

/**
 * バスドラムのトラックを生成する
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createBassDrumTrack (progression, beatDuration) {
  const notes = []
  let currentTime = 0
  for (const measure of progression.measures) {
    notes.push(new Note(currentTime, beatDuration, null))
    currentTime += measure.numerator * beatDuration
  }
  return new Track('bass-drum', notes)
}

/**
 * スネアドラムのトラックを生成する
 * - 奇数拍子: 各小節の最後の拍で1回叩く。
 * - 偶数拍子: 基本は最後の拍で1回叩く。
 *   - 例外: 4の倍数番目の小節では、最後の拍を長さ2/3と1/3の2つの音に分割して叩く。
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createSnareDrumTrack (progression, beatDuration) {
  const notes = []
  let currentTime = 0

  progression.measures.forEach((measure, index) => {
    const numerator = measure.numerator
    const measureNumber = index + 1 // 1から始まる小節番号
    const lastBeatStartTime = currentTime + (numerator - 1) * beatDuration

    // 拍子が偶数か奇数かで処理を分岐
    if (numerator % 2 === 0) {
      // 偶数拍子の場合
      // 4の倍数番目の小節かどうかをチェック
      if (measureNumber % 4 === 0) {
        // 例外パターン: 最後の拍を2/3と1/3に分割
        const duration1 = beatDuration * (2 / 3)
        const duration2 = beatDuration * (1 / 3)
        const startTime2 = lastBeatStartTime + duration1

        notes.push(new Note(lastBeatStartTime, duration1, null))
        notes.push(new Note(startTime2, duration2, null))
      } else {
        // 基本パターン: 最後の拍で1回
        notes.push(new Note(lastBeatStartTime, beatDuration, null))
      }
    } else {
      // 奇数拍子の場合
      // 基本パターン: 最後の拍で1回
      notes.push(new Note(lastBeatStartTime, beatDuration, null))
    }

    // 次の小節の開始時間に移動
    currentTime += numerator * beatDuration
  })

  return new Track('snare-drum', notes)
}

/**
 * シンバルのトラックを生成する
 * - 拍子が偶数なら、偶数拍で鳴らす (例: 4/4 -> 2, 4拍目)
 * - 拍子が奇数なら、1拍目と最後の拍で鳴らす (例: 3/4 -> 1, 3拍目)
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createCymbalTrack (progression, beatDuration) {
  const notes = []
  let currentTime = 0
  for (const measure of progression.measures) {
    const numerator = measure.numerator

    if (numerator % 2 === 0) {
      // 偶数拍子の場合 (2拍目, 4拍目, ...)
      // インデックスは0から始まるので、i=1, 3, 5... でNoteを追加
      for (let i = 1; i < numerator; i += 2) {
        notes.push(new Note(currentTime + i * beatDuration, beatDuration, null))
      }
    } else {
      // 奇数拍子の場合
      // 1拍目
      notes.push(new Note(currentTime, beatDuration, null))
      // 最後の拍 (numeratorが1より大きい場合のみ)
      if (numerator > 1) {
        notes.push(
          new Note(
            currentTime + (numerator - 1) * beatDuration,
            beatDuration,
            null
          )
        )
      }
    }

    currentTime += numerator * beatDuration
  }
  return new Track('cymbal', notes)
}

/**
 * ピアノのトラックを生成する
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createPianoTrack (progression, beatDuration) {
  const notes = []
  let currentTime = 0
  for (const measure of progression.measures) {
    for (let i = 0; i < measure.chords.length; i++) {
      const chordStr = measure.chords[i]
      if (chordStr) {
        const rawNotes = parseChord(chordStr)
        if (rawNotes) {
          const pitches = assignOctavesToChordNotes(rawNotes, 3)
          pitches.forEach(pitch =>
            notes.push(
              new Note(currentTime + i * beatDuration, beatDuration, pitch)
            )
          )
        }
      }
    }
    currentTime += measure.numerator * beatDuration
  }
  return new Track('piano', notes)
}

// --- ベースライン生成のためのヘルパー関数群 ---

/**
 * "C4" のような音名からRange配列のインデックスを取得する
 */
function getNoteIndex (noteWithOctave) {
  return Range.indexOf(noteWithOctave)
}

/**
 * 直前の音を基準に、指定された音名（オクターブなし）に最も近いオクターブ付きの音名を探す
 * @param {string | null} lastNoteWithOctave - 直前に演奏した音 (例: "G2")。初回はnull。
 * @param {string} targetNoteName - 次に鳴らしたい音名 (例: "C")
 * @returns {string} 最も近いオクターブ付きの音名 (例: "C3")
 */
function findClosestNote (lastNoteWithOctave, targetNoteName) {
  // 曲の最初の音の場合、E1-Eb2の範囲で適切なオクターブを探す
  if (!lastNoteWithOctave) {
    for (let octave = 1; octave <= 2; octave++) {
      const note = `${targetNoteName}${octave}`
      const index = getNoteIndex(note)
      if (index >= getNoteIndex('E1') && index <= getNoteIndex('D#2')) {
        return note
      }
    }
    return `${targetNoteName}1` // デフォルトフォールバック
  }

  const lastNoteIndex = getNoteIndex(lastNoteWithOctave)
  let bestMatch = ''
  let minDistance = Infinity

  // Range配列全体を探索して最も近い音を見つける
  for (let i = 0; i < Range.length; i++) {
    const currentNote = Range[i]
    if (currentNote.slice(0, -1) === targetNoteName) {
      const distance = Math.abs(i - lastNoteIndex)
      if (distance < minDistance) {
        minDistance = distance
        bestMatch = currentNote
      }
    }
  }
  return bestMatch
}

/**
 * ベースの音域（Eb1 〜 E3）を逸脱しないように音を補正する
 * - Eb1 を下回る場合は、下回らなくなるまで1オクターブ上げる
 * - F3 を上回る場合は、上回らなくなるまで1オクターブ下げる
 * @param {string} noteWithOctave 補正する音名 (例: "G3")
 * @returns {string} 補正後の音名 (例: "G2")
 */
function enforceBassPitchRange (noteWithOctave) {
  const minPitchIndex = getNoteIndex('D#1') // Eb1
  const maxPitchIndex = getNoteIndex('F3')
  let noteIndex = getNoteIndex(noteWithOctave)

  // 最低音より低い場合、オクターブを上げる
  while (noteIndex < minPitchIndex) {
    noteIndex += 12
  }

  // 最高音より高い場合、オクターブを下げる
  while (noteIndex >= maxPitchIndex) {
    noteIndex -= 12
  }

  return Range[noteIndex]
}

/**
 * アプローチノートの音名（オクターブなし）を決定する
 */
function getApproachNoteName (
  lastNoteOfPattern,
  nextChordRootName,
  currentChordFifth
) {
  const lastNoteIndex = getNoteIndex(lastNoteOfPattern)

  // 半音上の音を探す
  const sharpNoteIndex = lastNoteIndex + 1
  if (
    sharpNoteIndex < Range.length &&
    Range[sharpNoteIndex].slice(0, -1) === nextChordRootName
  ) {
    return Range[sharpNoteIndex].slice(0, -1)
  }

  // 半音下の音を探す
  const flatNoteIndex = lastNoteIndex - 1
  if (
    flatNoteIndex >= 0 &&
    Range[flatNoteIndex].slice(0, -1) === nextChordRootName
  ) {
    return Range[flatNoteIndex].slice(0, -1)
  }

  // クロマチック・アプローチできない場合は5thを返す
  return currentChordFifth
}

/**
 * ベースのトラックを生成する
 * @param {ChordProgression} progression
 * @param {number} beatDuration
 * @returns {Track}
 */
function createBassTrack (progression, beatDuration) {
  const bassNotes = []
  if (progression.measures.length === 0) {
    return new Track('bass', bassNotes)
  }

  // 1. コード進行をフラット化（コードと持続拍数のリストに変換）
  const flatChordList = []
  let currentChordName = progression.measures[0]?.chords[0] || null
  let durationCount = 0
  const allChords = progression.measures.flatMap(m => m.chords)

  for (const chord of allChords) {
    const name = chord || currentChordName
    if (name !== currentChordName && currentChordName !== null) {
      flatChordList.push({ name: currentChordName, duration: durationCount })
      durationCount = 0
    }
    currentChordName = name
    durationCount++
  }
  if (currentChordName) {
    flatChordList.push({ name: currentChordName, duration: durationCount })
  }

  // 2. フラット化したリストを元にNoteを生成
  let currentTime = 0
  let lastPlayedNote = null

  for (let i = 0; i < flatChordList.length; i++) {
    const item = flatChordList[i]
    const N = item.duration

    const parsedNotes = parseChord(item.name)
    if (!parsedNotes) continue

    const rootName = parsedNotes[0]
    const thirdName = parsedNotes.length > 1 ? parsedNotes[1] : rootName
    const fifthName = parsedNotes.length > 2 ? parsedNotes[2] : rootName

    let noteNamesToPlay = []

    // アプローチノートを決定
    let approachNoteName = fifthName // デフォルト
    const nextChord = flatChordList[i + 1]
    if (nextChord) {
      const nextParsed = parseChord(nextChord.name)
      if (nextParsed) {
        const tempLastNote = findClosestNote(lastPlayedNote || 'A2', fifthName) // 仮の最終音で計算
        approachNoteName = getApproachNoteName(
          tempLastNote,
          nextParsed[0],
          fifthName
        )
      }
    }

    // Nに応じたパターンを生成
    if (N === 1) noteNamesToPlay.push(rootName)
    else if (N === 2) noteNamesToPlay.push(rootName, approachNoteName)
    else if (N === 3)
      noteNamesToPlay.push(rootName, thirdName, approachNoteName)
    else if (N === 4)
      noteNamesToPlay.push(rootName, thirdName, fifthName, approachNoteName)
    else if (N === 5)
      noteNamesToPlay.push(
        rootName,
        thirdName,
        fifthName,
        fifthName,
        approachNoteName
      )
    else {
      // N >= 6
      noteNamesToPlay.push(rootName)
      const pattern = [rootName, thirdName, fifthName, fifthName]
      for (let j = 0; j < N - 2; j++) {
        noteNamesToPlay.push(pattern[j % 4])
      }
      noteNamesToPlay.push(approachNoteName)
    }

    // 3. 音名リストにオクターブを割り当て、Noteオブジェクトを生成
    for (let k = 0; k < noteNamesToPlay.length; k++) {
      const noteName = noteNamesToPlay[k]
      let noteWithOctave = findClosestNote(lastPlayedNote, noteName)

      const isLowerFifthPattern =
        (N === 5 && k === 3) ||
        (N >= 6 && k > 0 && k < N - 1 && (k - 1) % 4 === 3)
      if (noteName === fifthName && isLowerFifthPattern) {
        const currentIndex = getNoteIndex(noteWithOctave)
        if (currentIndex >= 12) {
          noteWithOctave = Range[currentIndex - 12]
        }
      }

      noteWithOctave = enforceBassPitchRange(noteWithOctave)

      bassNotes.push(new Note(currentTime, beatDuration, noteWithOctave))
      lastPlayedNote = noteWithOctave
      currentTime += beatDuration
    }
  }
  return new Track('bass', bassNotes)
}

/**
 * ChordProgressionオブジェクトからPlayableSequenceオブジェクトを生成する
 * @param {ChordProgression} progression - 元となるChordProgressionオブジェクト
 * @returns {PlayableSequence} 生成されたPlayableSequenceオブジェクト
 */
export function createPlayableSequence (progression) {
  const tempo = progression.tempo
  const beatDuration = 60 / tempo

  // 各ヘルパー関数を呼び出してトラックを生成
  const countInData = createCountInData(progression, beatDuration)

  const mainLoopTracks = [
    createHihatTrack(progression, beatDuration),
    createPianoTrack(progression, beatDuration),
    createBassDrumTrack(progression, beatDuration),
    createSnareDrumTrack(progression, beatDuration),
    createCymbalTrack(progression, beatDuration),
    createBassTrack(progression, beatDuration)
  ]

  // メインループの総再生時間を計算
  let mainLoopDuration = 0
  for (const measure of progression.measures) {
    mainLoopDuration += measure.numerator * beatDuration
  }

  const mainLoopData = new MusicData(tempo, mainLoopDuration, mainLoopTracks)

  return new PlayableSequence(mainLoopData, countInData)
}

// --- 実行と結果の表示 ---
// if (chordProgression) {
//   const playableSequence = createPlayableSequence(chordProgression)

//   // console.logだけだとオブジェクトの中身が見えにくいのでJSONに変換して表示
//   // console.log(JSON.stringify(playableSequence, null, 2))
// }
