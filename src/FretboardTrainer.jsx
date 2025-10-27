import { useState, useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import { usePlayback } from './hooks/usePlayback'
import Volume from './Volume'
import Tempo from './Tempo'

const noteMap = {
  E2: 'E,',
  F2: 'F,',
  'F#2': '^F,',
  G2: 'G,',
  Ab2: '_A,',
  A2: 'A,',
  Bb2: '_B,',
  B2: 'B,',
  C3: 'C',
  'C#3': '^C',
  D3: 'D',
  Eb3: '_E',
  E3: 'E',
  F3: 'F',
  'F#3': '^F',
  G3: 'G',
  Ab3: '_A',
  A3: 'A',
  Bb3: '_B',
  B3: 'B',
  C4: 'c',
  'C#4': '^c',
  D4: 'd',
  Eb4: '_e',
  E4: 'e',
  F4: 'f',
  'F#4': '^f',
  G4: 'g',
  Ab4: '_a',
  A4: 'a',
  Bb4: '_b',
  B4: 'b',
  C5: "c'",
  'C#5': "^c'",
  D5: "d'",
  Eb5: "_e'",
  E5: "e'",
  F5: "f'",
  'F#5': "^f'",
  G5: "g'",
  Ab5: "_a'",
  A5: "a'",
  Bb5: "_b'",
  B5: "b'",
  C6: "c''",
  'C#6': "^c''",
  D6: "d''"
}

// --- guitarStringsを動的に生成 ---
const allNotes = Object.keys(noteMap)
const openStringNotes = { 1: 'E4', 2: 'B3', 3: 'G3', 4: 'D3', 5: 'A2', 6: 'E2' }
const guitarStrings = {}
const fretCount = 23

for (let stringNum = 1; stringNum <= 6; stringNum++) {
  const openNote = openStringNotes[stringNum]
  const startIndex = allNotes.indexOf(openNote)
  if (startIndex !== -1) {
    guitarStrings[stringNum] = allNotes.slice(startIndex, startIndex + fretCount)
  } else {
    guitarStrings[stringNum] = []
  }
}

/**
 * 配列の要素をランダムにシャッフルする（フィッシャー–イェーツのシャッフル）
 * @param {Array} array - シャッフルする配列
 * @returns {Array} シャッフルされた配列
 */
function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * ギターの指板上のすべての音のポジションをリストとして生成する
 * @returns {Array<{note: string, string: number, fret: number}>}
 */
function getAllFretboardPositions () {
  const allPositions = []
  for (const stringNum in guitarStrings) {
    const notesOnString = guitarStrings[stringNum]
    for (let fret = 0; fret < notesOnString.length; fret++) {
      allPositions.push({
        note: notesOnString[fret],
        string: parseInt(stringNum, 10),
        fret
      })
    }
  }
  return allPositions
}

const allFretboardPositions = getAllFretboardPositions()

/**
 * ギターの指板上からランダムな「音のポジション」を指定された数だけ生成する関数
 * @param {number} count - 生成したい音のポジションの数
 * @returns {Array<{note: string, string: number, fret: number}>}
 */
function generateRandomNotes (count) {
  // 全ポジションリストをシャッフルし、先頭から指定された数だけ切り出す
  const shuffled = shuffleArray([...allFretboardPositions])
  return shuffled.slice(0, count)
}

/**
 * 音のポジション配列と難易度からABC記法の文字列を生成する関数
 * @param {Array<{note: string, string: number, fret: number}>} positionsArray
 * @param {'beginner' | 'intermediate' | 'advanced'} difficulty
 * @returns {string} ABC記法の文字列
 */
function makeABC (positionsArray, difficulty) {
  let abcString = `X: 1\nM: 4/4\nL: 1/4\nK: C\n`
  if (!positionsArray || positionsArray.length === 0) return abcString

  const stringCircleNumbers = { 1: '①', 2: '②', 3: '③', 4: '④', 5: '⑤', 6: '⑥' }

  let musicLine = ''
  let lyricLine1 = '' // (上級) 弦番号
  let lyricLine2 = '' // (中級) 音名
  let lyricLine3 = '' // (初級) フレット番号

  for (let i = 0; i < positionsArray.length; i++) {
    const pos = positionsArray[i]
    const abcNote = noteMap[pos.note]
    const noteNameOnly = pos.note.replace(/[0-9]/g, '') // 'E4' -> 'E'

    musicLine += abcNote + ' '
    lyricLine1 += stringCircleNumbers[pos.string] + ' '
    lyricLine2 += noteNameOnly + (noteNameOnly.length > 1 ? ' ' : '  ') // C# は2文字なのでスペース調整
    lyricLine3 += pos.fret.toString().padEnd(2, ' ') + ' '

    if ((i + 1) % 4 === 0) {
      musicLine += '| '
      lyricLine1 += '| '
      lyricLine2 += '| '
      lyricLine3 += '| '
    }

    if ((i + 1) % 16 === 0 && i + 1 < positionsArray.length) {
      abcString += musicLine + '\n'
      abcString += `w: ${lyricLine1}\n`
      if (difficulty === 'intermediate' || difficulty === 'beginner') {
        abcString += `w: ${lyricLine2}\n`
      }
      if (difficulty === 'beginner') {
        abcString += `w: ${lyricLine3}\n`
      }
      musicLine = ''
      lyricLine1 = ''
      lyricLine2 = ''
      lyricLine3 = ''
    }
  }

  if (musicLine) {
    if (positionsArray.length % 4 !== 0) {
      musicLine = musicLine.trimEnd() + ' |'
      lyricLine1 = lyricLine1.trimEnd() + ' |'
      lyricLine2 = lyricLine2.trimEnd() + ' |'
      lyricLine3 = lyricLine3.trimEnd() + ' |'
    }
    abcString += musicLine.trimEnd() + '\n'
    abcString += `w: ${lyricLine1.trimEnd()}\n`
    if (difficulty === 'intermediate' || difficulty === 'beginner') {
      abcString += `w: ${lyricLine2.trimEnd()}\n`
    }
    if (difficulty === 'beginner') {
      abcString += `w: ${lyricLine3.trimEnd()}`
    }
  }

  return abcString.trim()
}

/**
 * noteSequenceとtempoから、usePlaybackフック用の再生シーケンスオブジェクトを生成する
 * @param {string[]} noteSequence - 再生する音名の配列 (例: ['E4', 'G3', ...])
 * @param {number} tempo - BPM (Beats Per Minute)
 * @returns {object} usePlaybackのplay関数に渡すためのオブジェクト
 */
function createPlayableSequence (noteSequence, tempo) {
  const beatDuration = 60 / tempo // 4分音符1つの長さ（秒）

  // --- 1. カウントインデータ（1小節分）の作成 ---
  const countInNotes = []
  for (let i = 0; i < 4; i++) {
    // 指パッチン音を4回鳴らす
    countInNotes.push({ pitch: null, startTime: i * beatDuration })
  }
  const countInData = {
    duration: 4 * beatDuration,
    tracks: [{ instrument: 'finger', notes: countInNotes }]
  }

  // --- 2. メインループデータ（楽譜本体）の作成 ---
  const mainLoopNotes = noteSequence.map((note, index) => ({
    pitch: note,
    startTime: index * beatDuration // 各音の開始時間を計算
  }))

  const totalMeasures = Math.ceil(noteSequence.length / 4)
  const measureTimings = []
  for (let i = 0; i < totalMeasures; i++) {
    measureTimings.push({
      index: i,
      startTime: i * 4 * beatDuration
    })
  }

  const mainLoopData = {
    duration: noteSequence.length * beatDuration,
    tracks: [{ instrument: 'guitar', notes: mainLoopNotes }],
    measureTimings
  }

  return { countInData, mainLoopData }
}

function FretboardTrainer ({ tempo, handleTempoChange }) {
  const { play, stop, isPlaying } = usePlayback()
  const [loopCount, setLoopCount] = useState(1)
  const MAX_LOOP_COUNT = 100

  const [numberOfMeasures, setNumberOfMeasures] = useState(8)
  const [abcString, setAbcString] = useState('')
  const [positionSequence, setPositionSequence] = useState([])
  const [difficulty, setDifficulty] = useState('beginner')
  const notationRef = useRef(null)

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  const handleGenerateClick = () => {
    stop()
    const totalNotes = numberOfMeasures * 4
    const newPositionSequence = generateRandomNotes(totalNotes)
    const newAbcString = makeABC(newPositionSequence, difficulty)
    setAbcString(newAbcString)
    setPositionSequence(newPositionSequence)
  }

  useEffect(() => {
    if (abcString && notationRef.current) {
      abcjs.renderAbc(notationRef.current, abcString, { responsive: 'resize' })
    }
  }, [abcString])

  const handleLoopCountChange = event => {
    let value = parseInt(event.target.value, 10)
    if (isNaN(value) || value < 1) value = 1
    if (value > MAX_LOOP_COUNT) value = MAX_LOOP_COUNT
    setLoopCount(value)
  }

  const handlePlay = () => {
    if (positionSequence.length === 0 || isPlaying) return
    const noteSequenceForPlayback = positionSequence.map(pos => pos.note)
    const playableSequence = createPlayableSequence(noteSequenceForPlayback, tempo)
    play(playableSequence, loopCount)
  }

  const handleStop = () => {
    stop()
  }

  return (
    <>
      <h1>音符と弦番号</h1>
      <h3>音符と弦番号から瞬時にフレットの位置を割り出すための練習</h3>
      <div className='fretboard-trainer-controls'>
        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
          <option value='beginner'>(初級) 弦番号、音名、フレット番号</option>
          <option value='intermediate'>(中級) 弦番号、音名</option>
          <option value='advanced'>(上級) 弦番号</option>
        </select>
        <input type='number' value={numberOfMeasures} onChange={e => setNumberOfMeasures(parseInt(e.target.value, 10))} min='1' step='1' />
        <button onClick={handleGenerateClick}>新しい楽譜を生成</button>
      </div>

      <div className='abcjs-area'>
        <div ref={notationRef} />
      </div>

      <h3>再生</h3>
      <div className='playback-controls'>
        <button onClick={handlePlay} disabled={isPlaying || positionSequence.length === 0}>
          {isPlaying ? '再生中...' : '再生する'}
        </button>
        <button onClick={handleStop} disabled={!isPlaying}>
          停止する
        </button>
      </div>

      <div className='controls-panel'>
        <Tempo disabled={isPlaying} tempo={tempo} handleTempoChange={handleTempoChange} />
        <h3>繰り返し</h3>
        <div className='loop-control'>
          <input type='number' min='1' max={MAX_LOOP_COUNT} value={loopCount} onChange={handleLoopCountChange} disabled={isPlaying} aria-label='Loop Count' />
          <span>回</span>
        </div>
        <Volume />
      </div>
    </>
  )
}

export default FretboardTrainer
