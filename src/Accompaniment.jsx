import { useState, useRef } from 'react'
import { Measure, ChordProgression } from './etc/dataStructure'

function Accompaniment () {
  const [numerator, setNumerator] = useState(4)
  const [denominator, setDenominator] = useState(4)
  const [measures, setMeasures] = useState([])
  const [selectedMeasureIndex, setSelectedMeasureIndex] = useState(null)
  const [actionType, setActionType] = useState('')

  const [progressionTitle, setProgressionTitle] = useState('My New Progression')
  const [progressionTempo, setProgressionTempo] = useState(120)

  const fileInputRef = useRef(null)

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
          return new Measure(
            measure.numerator,
            measure.denominator,
            updatedChords
          )
        }
        return measure
      })
      return updatedMeasures
    })
  }

  const handleSelectMeasure = event => {
    setSelectedMeasureIndex(parseInt(event.target.value, 10))
  }

  const handleActionTypeChange = event => {
    setActionType(event.target.value)
  }

  const handleExecuteAction = () => {
    if (selectedMeasureIndex === null) {
      alert('操作する小節を選択してください。')
      return
    }
    if (!actionType) {
      alert('実行する操作を選択してください。')
      return
    }

    const currentMeasures = [...measures]
    const measureToOperate = currentMeasures[selectedMeasureIndex]

    switch (actionType) {
      case 'copyAfter': {
        const copiedMeasureAfter = new Measure(
          measureToOperate.numerator,
          measureToOperate.denominator,
          [...measureToOperate.chords]
        )
        currentMeasures.splice(selectedMeasureIndex + 1, 0, copiedMeasureAfter)
        setMeasures(currentMeasures)
        break
      }
      case 'copyEnd': {
        const copiedMeasureEnd = new Measure(
          measureToOperate.numerator,
          measureToOperate.denominator,
          [...measureToOperate.chords]
        )
        setMeasures([...currentMeasures, copiedMeasureEnd])
        break
      }
      case 'delete': {
        currentMeasures.splice(selectedMeasureIndex, 1)
        setMeasures(currentMeasures)
        setSelectedMeasureIndex(null)
        break
      }
      default:
        break
    }
    setActionType('')
  }

  const handleExport = () => {
    try {
      const progressionData = new ChordProgression(
        progressionTitle,
        progressionTempo,
        measures
      )
      const jsonString = JSON.stringify(progressionData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `${
        progressionTitle.replace(/\s/g, '_') || 'chord_progression'
      }.json`
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
          setProgressionTempo(parsedData.tempo)
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

  return (
    <>
      <h1>Accompaniment</h1>
      <h2>小節入力</h2>
      <div>
        <div>
          <label htmlFor='numerator-input'>拍子の分子:</label>
          <input
            id='numerator-input'
            type='number'
            value={numerator}
            onChange={handleNumeratorChange}
            min='1'
          />
        </div>
        <div>
          <label htmlFor='denominator-input'>拍子の分母:</label>
          <input
            id='denominator-input'
            type='number'
            value={denominator}
            onChange={handleDenominatorChange}
            min='1'
          />
        </div>
        <div>
          <button onClick={handleCreateMeasure}>小節作成</button>
        </div>
      </div>

      <div className='measures-container'>
        {measures.map((measure, measureIndex) => (
          <div
            key={measureIndex}
            className={`measure-block ${
              selectedMeasureIndex === measureIndex ? 'selected' : ''
            }`}
          >
            <div className='measure-header'>
              <label>
                <input
                  type='radio'
                  name='selectedMeasure'
                  value={measureIndex}
                  checked={selectedMeasureIndex === measureIndex}
                  onChange={handleSelectMeasure}
                />
                小節 {measureIndex + 1} ({measure.numerator}/
                {measure.denominator}拍子)
              </label>
            </div>
            <div className='chord-inputs'>
              {measure.chords.map((chordName, chordIndex) => (
                <input
                  key={chordIndex}
                  type='text'
                  value={chordName}
                  onChange={event =>
                    handleChordChange(
                      measureIndex,
                      chordIndex,
                      event.target.value
                    )
                  }
                  placeholder={`コード ${chordIndex + 1}`}
                  list='codes'
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 小節操作パネル */}
      <div className='measure-actions'>
        <h3>選択した小節の操作</h3>
        <select value={actionType} onChange={handleActionTypeChange}>
          <option value=''>操作を選択してください</option>
          <option value='copyAfter'>この直後コピー</option>
          <option value='copyEnd'>一番最後にコピー</option>
          <option value='delete'>削除する</option>
        </select>
        <button
          onClick={handleExecuteAction}
          disabled={selectedMeasureIndex === null || !actionType}
        >
          選択した小節を実行する
        </button>
      </div>

      {/* エクスポート/インポートパネル */}
      <div className='file-operations'>
        <h3>ファイル操作</h3>
        <button onClick={handleExport} disabled={measures.length === 0}>
          エクスポート (JSON)
        </button>
        <input
          type='file'
          ref={fileInputRef}
          onChange={handleFileImport}
          accept='.json' // JSONファイルのみを受け入れる
          style={{ display: 'none' }} // 非表示にする
        />
        <button onClick={handleImportButtonClick}>インポート (JSON)</button>
      </div>

      {/* コード候補のdatalist */}
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
      {/* 簡単なスタイリングのためのCSSを追加 */}
      <style>{`
        .measures-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-top: 20px;
        }
        .measure-block {
          border: 1px solid #ccc;
          padding: 15px;
          border-radius: 8px;
        }
        .measure-block.selected {
          border-color: #007bff;
          box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
          background-color: #e0f7fa;
        }
        .measure-header {
          margin-bottom: 10px;
        }
        .measure-header label {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
        }
        .chord-inputs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .chord-inputs input {
          width: 80px;
          padding: 5px;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        .measure-actions,
        .file-operations {
          margin-top: 30px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #f9f9f9;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .measure-actions h3,
        .file-operations h3 {
          margin: 0;
          font-size: 1em;
          white-space: nowrap; /* テキストの折り返しを防ぐ */
        }
        .measure-actions select,
        .measure-actions button,
        .file-operations button {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          white-space: nowrap; /* テキストの折り返しを防ぐ */
        }
        .measure-actions button,
        .file-operations button {
          background-color: #007bff;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .measure-actions button:hover:not(:disabled),
        .file-operations button:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .measure-actions button:disabled,
        .file-operations button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
      `}</style>
    </>
  )
}

export default Accompaniment
