import { useState, useRef, useEffect } from 'react'
import { Measure, ChordProgression } from './etc/dataStructure'
import { createPlayableSequence } from './etc/chordProgressionRules'
import { transposeChordProgression } from './etc/transposition'
import { usePlayback } from './hooks/usePlayback'
import Volume from './Volume'
import Tempo from './Tempo'

function Accompaniment ({ tempo, setTempo, handleTempoChange }) {
  const [measures, setMeasures] = useState([])
  const [numerator, setNumerator] = useState(4)
  const [denominator, setDenominator] = useState(4)
  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState(null)
  const [actionType, setActionType] = useState('')
  const [progressionTitle, setProgressionTitle] = useState('My New Progression')
  const fileInputRef = useRef(null)
  const { play, stop, isPlaying, currentMeasureIndex } = usePlayback()
  const [loopCount, setLoopCount] = useState(4)
  const MAX_LOOP_COUNT = 100

  const handleCreateMeasure = () => {
    const initialChordNames = Array.from({ length: numerator }).map(() => '')
    const newMeasure = new Measure(numerator, denominator, initialChordNames)
    setMeasures(prevMeasures => [...prevMeasures, newMeasure])
  }

  const handleChordChange = (measureIndex, chordIndex, newChordName) => {
    setMeasures(prevMeasures => {
      const updatedMeasures = prevMeasures.map((measure, mIdx) => {
        if (mIdx === measureIndex) {
          const updatedChords = measure.chords.map((chord, cIdx) =>
            cIdx === chordIndex ? newChordName : chord
          )
          return new Measure(measure.numerator, measure.denominator, updatedChords)
        }
        return measure
      })
      return updatedMeasures
    })
  }

  const handleNumeratorChange = event => {
    const value = parseInt(event.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setNumerator(value)
    }
  }

  const handleDenominatorChange = event => {
    const value = parseInt(event.target.value, 10)
    if (!isNaN(value) && value > 0) {
      setDenominator(value)
    }
  }

  const handleSelectMeasure = event => {
    setSelectedMeasureIndex(parseInt(event.target.value, 10))
  }

  const handleActionTypeChange = event => {
    setActionType(event.target.value)
  }

  const handleExecuteAction = () => {
    if (actionType !== 'deleteAll' && selectedMeasureIndex === null) {
      alert('操作する小節を選択してください。')
      return
    }
    if (!actionType) {
      alert('実行する操作を選択してください。')
      return
    }

    // 「全部削除する」の場合の特別な処理
    if (actionType === 'deleteAll') {
      if (window.confirm('全部削除されますがよろしいですか？')) {
        setMeasures([])
        setSelectedMeasureIndex(null)
        setActionType('')
      }
      return
    }

    let updatedMeasures = [...measures]
    const measureToOperate = updatedMeasures[selectedMeasureIndex]

    switch (actionType) {
      case 'copyBefore': {
        const copiedMeasureBefore = new Measure(
          measureToOperate.numerator,
          measureToOperate.denominator,
          [...measureToOperate.chords]
        )
        updatedMeasures.splice(selectedMeasureIndex, 0, copiedMeasureBefore)
        break
      }
      case 'copyAfter': {
        const copiedMeasureAfter = new Measure(
          measureToOperate.numerator,
          measureToOperate.denominator,
          [...measureToOperate.chords]
        )
        updatedMeasures.splice(selectedMeasureIndex + 1, 0, copiedMeasureAfter)
        break
      }
      case 'copyEnd': {
        const copiedMeasureEnd = new Measure(
          measureToOperate.numerator,
          measureToOperate.denominator,
          [...measureToOperate.chords]
        )
        updatedMeasures.push(copiedMeasureEnd)
        break
      }
      case 'delete': {
        updatedMeasures.splice(selectedMeasureIndex, 1)
        setSelectedMeasureIndex(null)
        break
      }
      default:
        break
    }
    setMeasures(updatedMeasures)
  }

  const handleExport = () => {
    try {
      const progressionData = new ChordProgression(progressionTitle, tempo, measures)
      const jsonString = JSON.stringify(progressionData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${progressionTitle.replace(/\s/g, '_') || 'chord_progression'}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('エクスポート中にエラーが発生しました: ' + error.message)
      console.error('Export error:', error)
    }
  }

  const handleImportButtonClick = () => {
    fileInputRef.current.click()
  }

  const handleFileImport = event => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsedData = JSON.parse(e.target.result)

        if (
          parsedData &&
          typeof parsedData.title === 'string' &&
          typeof parsedData.tempo === 'number' &&
          Array.isArray(parsedData.measures)
        ) {
          const importedMeasures = parsedData.measures
            .map(m => {
              if (
                typeof m.numerator === 'number' &&
                typeof m.denominator === 'number' &&
                Array.isArray(m.chords)
              ) {
                return new Measure(
                  m.numerator,
                  m.denominator,
                  m.chords.map(c => (typeof c === 'string' ? c : ''))
                )
              }
              console.warn('Invalid measure data in imported file:', m)
              return null
            })
            .filter(m => m !== null)

          setMeasures(importedMeasures)
          setProgressionTitle(parsedData.title)
          setTempo(parsedData.tempo)
          setSelectedMeasureIndex(null)
          setActionType('')
          alert('コード進行を正常にインポートしました。')
        } else {
          alert('インポートファイルが不正な形式です。')
        }
      } catch (error) {
        alert('ファイルの読み込みまたはパースに失敗しました: ' + error.message)
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = null
  }

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

  const handlePlay = () => {
    setSelectedMeasureIndex(null)

    if (measures.length === 0) {
      alert('演奏する小節がありません。')
      return
    }

    try {
      const progression = new ChordProgression(progressionTitle, Number(tempo), measures)
      const sequence = createPlayableSequence(progression)
      play(sequence, loopCount)
    } catch (error) {
      console.error('Error during playback preparation:', error)
      alert('再生の準備中にエラーが発生しました。')
    }
  }

  const handleStop = () => {
    stop()
  }

  const handleTranspose = event => {
    const semitones = parseInt(event.target.value, 10)

    if (semitones === 0) {
      return
    }

    const currentProgression = new ChordProgression('temp', tempo, measures)

    const transposedProgression = transposeChordProgression(currentProgression, semitones)

    setMeasures(transposedProgression.measures)

    const sign = semitones > 0 ? '+' : ''
    alert(`${sign}${semitones}半音分、移調しました`)

    event.target.value = 0
  }

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return (
    <>
      <h1>コード伴奏</h1>

      <div className='measures-container'>
        {measures.map((measure, measureIndex) => {
          const isHighlighted = isPlaying
            ? currentMeasureIndex === measureIndex
            : selectedMeasureIndex === measureIndex

          return (
            <div key={measureIndex} className={`measure-block ${isHighlighted ? 'selected' : ''}`}>
              <div className='measure-header'>
                <label>
                  <input
                    type='radio'
                    name='selectedMeasure'
                    value={measureIndex}
                    checked={selectedMeasureIndex === measureIndex}
                    onChange={handleSelectMeasure}
                    disabled={isPlaying}
                  />
                  小節 {measureIndex + 1} ({measure.numerator}/{measure.denominator}拍子)
                </label>
              </div>
              <div className='chord-inputs'>
                {measure.chords.map((chordName, chordIndex) => (
                  <input
                    key={chordIndex}
                    type='text'
                    value={chordName}
                    onChange={event =>
                      handleChordChange(measureIndex, chordIndex, event.target.value)
                    }
                    list='codes'
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <h3>小節作成</h3>
      <div className='time-signature'>
        <div>
          <div>
            <label htmlFor='numerator-input'>拍子の分子: </label>
            <input
              id='numerator-input'
              type='number'
              value={numerator}
              onChange={handleNumeratorChange}
              min='1'
            />
          </div>
          <div>
            <label htmlFor='denominator-input'>拍子の分母: </label>
            <input
              id='denominator-input'
              type='number'
              value={denominator}
              onChange={handleDenominatorChange}
              min='1'
            />
          </div>
        </div>
        <div>
          <button onClick={handleCreateMeasure} disabled={isPlaying}>
            小節作成
          </button>
        </div>
      </div>

      <h3>選択した小節の操作</h3>
      <div className='measure-actions'>
        <select value={actionType} onChange={handleActionTypeChange}>
          <option value=''>操作を選択してください</option>
          <option value='copyBefore'>この直前へコピー</option>
          <option value='copyAfter'>この直後へコピー</option>
          <option value='copyEnd'>一番最後にコピー</option>
          <option value='delete'>削除する</option>
          <option value='deleteAll'>全部削除する</option>
        </select>
        <button
          onClick={handleExecuteAction}
          disabled={
            isPlaying ||
            !actionType ||
            (actionType !== 'deleteAll' && selectedMeasureIndex === null)
          }
        >
          実行する
        </button>
      </div>

      <h3>ファイル操作</h3>
      <div className='file-operations'>
        <button onClick={handleExport} disabled={measures.length === 0 || isPlaying}>
          エクスポート (JSON)
        </button>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileImport}
          accept='.json'
          style={{ display: 'none' }}
        />
        <button onClick={handleImportButtonClick} disabled={isPlaying}>
          インポート (JSON)
        </button>
      </div>

      <div className='controls-panel'>
        <Tempo disabled={isPlaying} tempo={tempo} handleTempoChange={handleTempoChange} />

        <h3>移調 (キー)</h3>
        <div className='transpose-control'>
          <select
            defaultValue='0'
            onChange={handleTranspose}
            disabled={measures.length === 0 || isPlaying}
            aria-label='Transpose'
          >
            {Array.from({ length: 23 }, (_, i) => i - 11).map(val => (
              <option key={val} value={val}>
                {val > 0 ? `+${val}` : val}
              </option>
            ))}
          </select>
        </div>

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
        <button onClick={handlePlay} disabled={isPlaying || measures.length === 0}>
          {isPlaying ? '再生中...' : '演奏する'}
        </button>
        <button onClick={handleStop} disabled={!isPlaying}>
          停止する
        </button>
      </div>

      <datalist id='codes'>
        <option value='C'></option>
        <option value='Cmaj7'></option>
        <option value='Cm7'></option>
        <option value='C7'></option>
        <option value='Cm7b5'></option>
        <option value='C#'></option>
        <option value='C#maj7'></option>
        <option value='C#m7'></option>
        <option value='C#7'></option>
        <option value='C#m7b5'></option>
        <option value='D'></option>
        <option value='Dmaj7'></option>
        <option value='Dm7'></option>
        <option value='D7'></option>
        <option value='Dm7b5'></option>
        <option value='Eb'></option>
        <option value='Ebmaj7'></option>
        <option value='Ebm7'></option>
        <option value='Eb7'></option>
        <option value='Ebm7b5'></option>
        <option value='E'></option>
        <option value='Emaj7'></option>
        <option value='Em7'></option>
        <option value='E7'></option>
        <option value='Em7b5'></option>
        <option value='F'></option>
        <option value='Fmaj7'></option>
        <option value='Fm7'></option>
        <option value='F7'></option>
        <option value='Fm7b5'></option>
        <option value='F#'></option>
        <option value='F#maj7'></option>
        <option value='F#m7'></option>
        <option value='F#7'></option>
        <option value='F#m7b5'></option>
        <option value='G'></option>
        <option value='Gmaj7'></option>
        <option value='Gm7'></option>
        <option value='G7'></option>
        <option value='Gm7b5'></option>
        <option value='Ab'></option>
        <option value='Abmaj7'></option>
        <option value='Abm7'></option>
        <option value='Ab7'></option>
        <option value='Abm7b5'></option>
        <option value='A'></option>
        <option value='Amaj7'></option>
        <option value='Am7'></option>
        <option value='A7'></option>
        <option value='Am7b5'></option>
        <option value='Bb'></option>
        <option value='Bbmaj7'></option>
        <option value='Bbm7'></option>
        <option value='Bb7'></option>
        <option value='Bbm7b5'></option>
        <option value='B'></option>
        <option value='Bmaj7'></option>
        <option value='Bm7'></option>
        <option value='B7'></option>
        <option value='Bm7b5'></option>
      </datalist>
    </>
  )
}

export default Accompaniment
