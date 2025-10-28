import { useState, useEffect, useRef } from 'react'
// getScaleToneObjs をインポートに追加
import { root, quality, scales, getChordToneObjs, getScaleToneObjs } from './etc/scalesAndChordTones.js'
import { initFretboardSvg, showFretMark } from './etc/fretboard.js'

function Scale () {
  const [selectedRoot, setSelectedRoot] = useState('C')
  const [displayType, setDisplayType] = useState('コードトーン')
  const [selectedQuality, setSelectedQuality] = useState('maj7')
  const [selectedScale, setSelectedScale] = useState('メジャー、アイオニアン')

  const fretboardRef = useRef(null)

  useEffect(() => {
    if (fretboardRef.current) {
      initFretboardSvg(fretboardRef.current)
    }

    return () => {
      if (fretboardRef.current) {
        fretboardRef.current.innerHTML = ''
      }
    }
  }, [])

  const handleDisplay = () => {
    // 表示ボタンが押されるたびに、フレットボードを一度初期状態に戻す
    if (fretboardRef.current) {
      initFretboardSvg(fretboardRef.current)
    }

    if (displayType === 'コードトーン') {
      const chord = selectedRoot + selectedQuality
      const chordToneObjects = getChordToneObjs(chord)

      for (const obj of chordToneObjects) {
        showFretMark(obj.stringIndex, obj.fretboardCxIndex, obj.noteName, obj.circleColor, obj.textColor)
      }
    } else {
      const scaleToneObjects = getScaleToneObjs(selectedRoot, selectedScale)

      for (const obj of scaleToneObjects) {
        showFretMark(obj.stringIndex, obj.fretboardCxIndex, obj.noteName, obj.circleColor, obj.textColor)
      }
    }
  }

  return (
    <>
      <h2>コードトーンとスケール</h2>

      <div className='scale-controls'>
        <select value={displayType} onChange={e => setDisplayType(e.target.value)}>
          <option value='コードトーン'>コードトーン</option>
          <option value='スケール'>スケール</option>
        </select>

        <select value={selectedRoot} onChange={e => setSelectedRoot(e.target.value)}>
          {root.map(note => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <select value={selectedQuality} onChange={e => setSelectedQuality(e.target.value)} disabled={displayType === 'スケール'}>
          {quality.map(q => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>

        <select value={selectedScale} onChange={e => setSelectedScale(e.target.value)} disabled={displayType === 'コードトーン'}>
          {Object.keys(scales).map(scaleName => (
            <option key={scaleName} value={scaleName}>
              {scaleName}
            </option>
          ))}
        </select>

        <button onClick={handleDisplay}>表示</button>
      </div>

      <svg ref={fretboardRef} id='fretboard_svg' viewBox='0 0 810 170'></svg>
    </>
  )
}

export default Scale
