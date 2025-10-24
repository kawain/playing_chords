import { useState, useRef } from 'react'
import { Measure, ChordProgression } from './etc/dataStructure'
import { createPlayableSequence } from './etc/chordProgressionRules'
import { usePlayback } from './hooks/usePlayback'
import Volume from './Volume'
import Tempo from './Tempo'

const chordCycles = ['C', 'F', 'Bb', 'Eb', 'Ab', 'C#', 'F#', 'B', 'E', 'A', 'D', 'G']
const chordKinds = ['maj7', '7', 'm7', 'm7(b5)']

function ChordPlaying ({ tempo, setTempo, handleTempoChange }) {
  const { play, stop, isPlaying, currentMeasureIndex } = usePlayback()
  const [loopCount, setLoopCount] = useState(4)
  const MAX_LOOP_COUNT = 100
  const [chordProgression, setChordProgression] = useState(null)

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

  const handleCreatePattern = () => {
    // 1. ランダムなコードサイクルの配列を作成
    const randomIndex = Math.floor(Math.random() * chordCycles.length)
    const newCycle = [...chordCycles.slice(randomIndex), ...chordCycles.slice(0, randomIndex)]

    // 2. 各ルート音にランダムなコード種別を付与
    const finalChords = newCycle.map(rootNote => {
      const randomKindIndex = Math.floor(Math.random() * chordKinds.length)
      const randomKind = chordKinds[randomKindIndex]
      return rootNote + randomKind
    })

    // 3. finalChordsを元にMeasureオブジェクトの配列を作成
    const measures = finalChords.map(chordName => {
      const chordsInMeasure = [chordName, '', '', '']
      return new Measure(4, 4, chordsInMeasure)
    })

    // 4. ChordProgressionオブジェクトを作成
    // ここでは画面上のテンポを初期値として設定
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
      // 現在のUIのテンポを反映させた新しいChordProgressionオブジェクトを作成
      const progressionWithCurrentTempo = new ChordProgression(chordProgression.title, Number(tempo), chordProgression.measures)
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

  return (
    <>
      <h1>ランダムコード演奏</h1>

      <div className='create-pattern'>
        <button onClick={handleCreatePattern} disabled={isPlaying}>
          コードパターン作成
        </button>
      </div>

      <div className='measures-container'>
        {chordProgression &&
          chordProgression.measures.map((measure, measureIndex) => {
            const isHighlighted = isPlaying && currentMeasureIndex === measureIndex
            return (
              <div key={measureIndex} className={`measure-block-playing ${isHighlighted ? 'selected' : ''}`}>
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
          <input type='number' min='1' max={MAX_LOOP_COUNT} value={loopCount} onChange={handleLoopCountChange} disabled={isPlaying} aria-label='Loop Count' />
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
