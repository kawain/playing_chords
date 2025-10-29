import { useState, useEffect } from 'react'
import ChordDiagram from './ChordDiagram'
import { allChords } from './etc/chordForm'

function Code () {
  const [selectedChordName, setSelectedChordName] = useState('')
  const [selectedChord, setSelectedChord] = useState([])

  useEffect(() => {
    if (!selectedChordName) {
      setSelectedChord([])
      return
    }

    setSelectedChord(allChords.find(obj => obj.name === selectedChordName).chords)
  }, [selectedChordName])

  return (
    <>
      <h1>コードポジション</h1>
      <p className='center'>C 以外はルートの位置をずらして読み替えてください。</p>

      <div className='code-position-select'>
        <select value={selectedChordName} onChange={e => setSelectedChordName(e.target.value)}>
          <option value=''>コードを選択してください</option>
          {allChords.map((obj, i) => (
            <option key={i} value={obj.name}>
              {obj.name}
            </option>
          ))}
        </select>
      </div>

      <div className='code-position'>
        {selectedChord.map((chordData, i) => (
          <div key={i}>
            <ChordDiagram configure={chordData.configure} chord={chordData.chord} />
          </div>
        ))}
      </div>
    </>
  )
}

export default Code
