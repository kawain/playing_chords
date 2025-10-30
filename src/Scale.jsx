import { useState, useEffect, useRef } from 'react'
import { root, quality, scales, getChordToneObjs, getScaleToneObjs } from './etc/scalesAndChordTones.js'
import { initFretboardSvg, showFretMark } from './etc/fretboard.js'

/**
 * 保存されたフレットボードのデータを表示するための子コンポーネント
 * @param {{data: {head: string, body: Array<object>}}} props
 */
function SavedFretboardDisplay ({ data }) {
  const fretboardRef = useRef(null)

  useEffect(() => {
    const svgElement = fretboardRef.current
    if (svgElement && data.body) {
      // SVGを初期化
      initFretboardSvg(svgElement)
      // bodyのデータを使ってマークを描画
      for (const obj of data.body) {
        showFretMark(obj.stringIndex, obj.fretboardCxIndex, obj.noteName, obj.circleColor, obj.textColor, svgElement)
      }
    }
  }, [data]) // props.data が変更されたときに再描画

  return <svg ref={fretboardRef} viewBox='0 0 810 170' className='saved-fretboard'></svg>
}

function Scale () {
  const [selectedRoot, setSelectedRoot] = useState('C')
  const [displayType, setDisplayType] = useState('コードトーン')
  const [selectedQuality, setSelectedQuality] = useState('maj7')
  const [selectedScale, setSelectedScale] = useState('メジャー、アイオニアン')
  const [savedData, setSavedData] = useState([])

  const fretboardRef = useRef(null)

  useEffect(() => {
    try {
      const dataFromStorage = localStorage.getItem('savedFretboardData')
      if (dataFromStorage) {
        setSavedData(JSON.parse(dataFromStorage))
      }
    } catch (error) {
      console.error('ローカルストレージからのデータ読み込みに失敗しました:', error)
      setSavedData([])
    }
  }, [])

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
    if (fretboardRef.current) {
      initFretboardSvg(fretboardRef.current)
    }

    if (displayType === 'コードトーン') {
      const chord = selectedRoot + selectedQuality
      const chordToneObjects = getChordToneObjs(chord)
      for (const obj of chordToneObjects) {
        showFretMark(obj.stringIndex, obj.fretboardCxIndex, obj.noteName, obj.circleColor, obj.textColor, fretboardRef.current)
      }
    } else {
      const scaleToneObjects = getScaleToneObjs(selectedRoot, selectedScale)
      for (const obj of scaleToneObjects) {
        showFretMark(obj.stringIndex, obj.fretboardCxIndex, obj.noteName, obj.circleColor, obj.textColor, fretboardRef.current)
      }
    }
  }

  const handleSave = () => {
    let dataToSave = {}
    if (displayType === 'コードトーン') {
      const chordName = selectedRoot + selectedQuality
      dataToSave = { head: chordName, body: getChordToneObjs(chordName) }
    } else {
      const scaleName = selectedRoot + ' ' + selectedScale
      dataToSave = { head: scaleName, body: getScaleToneObjs(selectedRoot, selectedScale) }
    }

    try {
      const newSavedData = [...savedData, dataToSave]
      setSavedData(newSavedData)
      localStorage.setItem('savedFretboardData', JSON.stringify(newSavedData))
      alert('現在の表示を保存しました。')
    } catch (error) {
      console.error('ローカルストレージへの保存に失敗しました:', error)
      alert('保存に失敗しました。')
    }
  }

  const handleDelete = indexToDelete => {
    if (window.confirm(`「${savedData[indexToDelete].head}」を削除してもよろしいですか？`)) {
      const newSavedData = savedData.filter((_, index) => index !== indexToDelete)
      setSavedData(newSavedData)
      localStorage.setItem('savedFretboardData', JSON.stringify(newSavedData))
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

      <div className='save-button'>
        <button onClick={handleSave}>保存</button>
      </div>

      {savedData.length > 0 && (
        <div className='saved-data-container'>
          <h3>保存されたデータ一覧</h3>
          {savedData.map((data, index) => (
            <div key={index}>
              <h4>{data.head}</h4>
              <SavedFretboardDisplay data={data} />
              <button onClick={() => handleDelete(index)}>このデータを削除</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Scale
