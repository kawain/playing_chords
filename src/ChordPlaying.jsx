import { useState, useEffect } from 'react'
import { Measure, ChordProgression } from './etc/dataStructure'
import { createPlayableSequence } from './etc/chordProgressionRules'
import { usePlayback } from './hooks/usePlayback'
import Volume from './Volume'
import Tempo from './Tempo'

const chordCycles = ['C', 'F', 'Bb', 'Eb', 'Ab', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G']
const chordKinds = [
  'maj7',
  '7',
  'm7',
  'm7(b5)',
  '6',
  'm6',
  'dim7',
  'aug7',
  'maj7(9)',
  '6(9)',
  'm7(9)',
  '7(#9)',
  '7(9)',
  '7(b9)',
  '7(#11)',
  '7(13)',
  '7(b13)'
]

function ChordPlaying ({ tempo, handleTempoChange }) {
  const { play, stop, isPlaying, currentMeasureIndex } = usePlayback()
  const [loopCount, setLoopCount] = useState(4)
  const MAX_LOOP_COUNT = 100
  const [chordProgression, setChordProgression] = useState(null)
  const [selectedChordKind, setSelectedChordKind] = useState('ランダム')

  const handleLoopCountChange = event => {
    let value = parseInt(event.target.value, 10)
    if (isNaN(value) || value < 1) {
      value = 1
    }
    if (value > MAX_LOOP_COUNT) {
      value = MAX_LOOP_COUNT
    }
    setLoopCount(value)
  }

  const handleChordKindChange = event => {
    setSelectedChordKind(event.target.value)
  }

  const handleCreatePattern = () => {
    // 1. ランダムなコードサイクルの配列を作成
    const randomIndex = Math.floor(Math.random() * chordCycles.length)
    const newCycle = [...chordCycles.slice(randomIndex), ...chordCycles.slice(0, randomIndex)]

    // 2. 各ルート音にコード種別を付与
    const finalChords = newCycle.map(rootNote => {
      let kind
      if (selectedChordKind === 'ランダム') {
        // 「ランダム」が選択されている場合は、従来通りランダムに選択
        const randomKindIndex = Math.floor(Math.random() * chordKinds.length)
        kind = chordKinds[randomKindIndex]
      } else {
        // 特定のコード種別が選択されている場合は、その種別を使用
        kind = selectedChordKind
      }
      return rootNote + kind
    })

    // 3. finalChordsを元にMeasureオブジェクトの配列を作成
    const measures = finalChords.map(chordName => {
      const chordsInMeasure = [chordName, '', '', '']
      return new Measure(4, 4, chordsInMeasure)
    })

    // 4. ChordProgressionオブジェクトを作成
    const newProgression = new ChordProgression('sample', tempo, measures)

    // 5. useStateに保存
    setChordProgression(newProgression)
  }

  const handlePlay = () => {
    if (!chordProgression) {
      alert('演奏するコード進行がありません。')
      return
    }

    try {
      const progressionWithCurrentTempo = new ChordProgression(
        chordProgression.title,
        Number(tempo),
        chordProgression.measures
      )
      const sequence = createPlayableSequence(progressionWithCurrentTempo)
      play(sequence, loopCount)
    } catch (error) {
      console.error('Error during playback preparation:', error)
      alert('再生の準備中にエラーが発生しました。')
    }
  }

  const handleStop = () => {
    stop()
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return (
    <>
      <h1>ランダムコード演奏</h1>

      <div className='create-pattern'>
        <select value={selectedChordKind} onChange={handleChordKindChange}>
          <option value='ランダム'>ランダム</option>
          {chordKinds.map(kind => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>
        <button onClick={handleCreatePattern} disabled={isPlaying}>
          コードパターン作成
        </button>
      </div>

      <div className='measures-container'>
        {chordProgression &&
          chordProgression.measures.map((measure, measureIndex) => {
            const isHighlighted = isPlaying && currentMeasureIndex === measureIndex
            return (
              <div
                key={measureIndex}
                className={`measure-block-playing ${isHighlighted ? 'selected' : ''}`}
              >
                {measure.chords.map((chordName, chordIndex) => (
                  <div key={chordIndex}>{chordName || '-'}</div>
                ))}
              </div>
            )
          })}
      </div>

      <div className='controls-panel'>
        <Tempo disabled={isPlaying} tempo={tempo} handleTempoChange={handleTempoChange} />
        <h3>繰り返し</h3>
        <div className='loop-control'>
          <input
            type='number'
            min='1'
            max={MAX_LOOP_COUNT}
            value={loopCount}
            onChange={handleLoopCountChange}
            disabled={isPlaying}
            aria-label='Loop Count'
          />
          <span>回</span>
        </div>

        <Volume />
      </div>

      <h3>演奏</h3>
      <div className='playback-controls'>
        <button onClick={handlePlay} disabled={isPlaying || !chordProgression}>
          {isPlaying ? '再生中...' : '演奏する'}
        </button>
        <button onClick={handleStop} disabled={!isPlaying}>
          停止する
        </button>
      </div>
    </>
  )
}

export default ChordPlaying
