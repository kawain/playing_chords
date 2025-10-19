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

let chordProgression = null

try {
  chordProgression = parseChordProgression(jsonText)
  //   console.log(chordProgression)
} catch (error) {
  console.error('Error parsing chord progression:', error.message)
}

//
// ここからchordProgressionをもとにしてPlayableSequenceを決められたルールでつくる
//

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
 * ベースの最低音（Eb1）を下回らないように音を補正する
 */
function enforceMinimumPitch (noteWithOctave) {
  const minPitchIndex = getNoteIndex('D#1') // Eb1 = D#1
  let noteIndex = getNoteIndex(noteWithOctave)

  while (noteIndex < minPitchIndex) {
    noteIndex += 12 // 1オクターブ上げる
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
 * ChordProgressionオブジェクトからPlayableSequenceオブジェクトを生成する
 * @param {ChordProgression} progression - 元となるChordProgressionオブジェクト
 * @returns {PlayableSequence} 生成されたPlayableSequenceオブジェクト
 */
function createPlayableSequence (progression) {
  const tempo = progression.tempo
  const beatDuration = 60 / tempo

  // --- カウントインデータ (countInData) の作成 ---
  let countInData = null
  if (progression.measures.length > 0) {
    const firstMeasure = progression.measures[0]
    const countInNumerator = firstMeasure.numerator
    const countInDuration = countInNumerator * beatDuration
    const countInNotes = Array.from(
      { length: countInNumerator },
      (_, i) => new Note(i * beatDuration, beatDuration, null)
    )
    const countInTrack = new Track('hihat', countInNotes)
    countInData = new MusicData(tempo, countInDuration, [countInTrack])
  }

  // --- メインループ：ドラムとピアノのNote生成 ---
  const mainLoopHihatNotes = []
  const mainLoopPianoNotes = []
  const mainLoopBassDrumNotes = []
  const mainLoopSnareDrumNotes = []
  let mainLoopDuration = 0

  let currentTime = 0
  for (const measure of progression.measures) {
    const measureDuration = measure.numerator * beatDuration
    // ハイハット
    for (let i = 0; i < measure.numerator; i++) {
      mainLoopHihatNotes.push(
        new Note(currentTime + i * beatDuration, beatDuration, null)
      )
    }
    // バスドラム
    mainLoopBassDrumNotes.push(new Note(currentTime, beatDuration, null))
    // スネアドラム
    mainLoopSnareDrumNotes.push(
      new Note(
        currentTime + (measure.numerator - 1) * beatDuration,
        beatDuration,
        null
      )
    )
    // ピアノ
    for (let i = 0; i < measure.chords.length; i++) {
      const chordStr = measure.chords[i]
      if (chordStr) {
        const rawNotes = parseChord(chordStr)
        if (rawNotes) {
          const pitches = assignOctavesToChordNotes(rawNotes, 3)
          pitches.forEach(pitch =>
            mainLoopPianoNotes.push(
              new Note(currentTime + i * beatDuration, beatDuration, pitch)
            )
          )
        }
      }
    }
    currentTime += measureDuration
  }
  mainLoopDuration = currentTime

  // --- メインループ：ベースラインのNote生成 ---
  const bassNotes = []

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
  currentTime = 0
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

      // 「低い5th」の処理
      const isLowerFifthPattern =
        (N === 5 && k === 3) ||
        (N >= 6 && k > 0 && k < N - 1 && (k - 1) % 4 === 3)
      if (noteName === fifthName && isLowerFifthPattern) {
        const currentIndex = getNoteIndex(noteWithOctave)
        if (currentIndex >= 12) {
          noteWithOctave = Range[currentIndex - 12]
        }
      }

      noteWithOctave = enforceMinimumPitch(noteWithOctave)

      bassNotes.push(new Note(currentTime, beatDuration, noteWithOctave))
      lastPlayedNote = noteWithOctave
      currentTime += beatDuration
    }
  }

  // --- 最終的なオブジェクトの組み立て ---
  const mainLoopTracks = [
    new Track('hihat', mainLoopHihatNotes),
    new Track('piano', mainLoopPianoNotes),
    new Track('bass-drum', mainLoopBassDrumNotes),
    new Track('snare-drum', mainLoopSnareDrumNotes),
    new Track('bass', bassNotes)
  ]
  const mainLoopData = new MusicData(tempo, mainLoopDuration, mainLoopTracks)

  return new PlayableSequence(mainLoopData, countInData)
}

// --- 実行と結果の表示 ---
if (chordProgression) {
  const playableSequence = createPlayableSequence(chordProgression)

  // console.logだけだとオブジェクトの中身が見えにくいのでJSONに変換して表示
  console.log(JSON.stringify(playableSequence, null, 2))
}
