import { useState, useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import { initFretboardSvg, showFretMark, hideFretMark } from './etc/fretboard.js'
import { playNote } from './etc/sound'
import Volume from './Volume'

// ギターの音域を定義 (E2からD6まで)
const guitarRange = [
  'E2',
  'F2',
  'F#2',
  'G2',
  'Ab2',
  'A2',
  'Bb2',
  'B2',
  'C3',
  'C#3',
  'D3',
  'Eb3',
  'E3',
  'F3',
  'F#3',
  'G3',
  'Ab3',
  'A3',
  'Bb3',
  'B3',
  'C4',
  'C#4',
  'D4',
  'Eb4',
  'E4',
  'F4',
  'F#4',
  'G4',
  'Ab4',
  'A4',
  'Bb4',
  'B4',
  'C5',
  'C#5',
  'D5',
  'Eb5',
  'E5',
  'F5',
  'F#5',
  'G5',
  'Ab5',
  'A5',
  'Bb5',
  'B5',
  'C6',
  'C#6',
  'D6'
]
// 開放弦の音
const openStringNotes = { 1: 'E4', 2: 'B3', 3: 'G3', 4: 'D3', 5: 'A2', 6: 'E2' }

const FRET_COUNT_ON_SVG = 22
const guitarStrings = []

// 各弦の各フレットに対応する音名を格納した二次元配列を生成
for (let stringNum = 1; stringNum <= 6; stringNum++) {
  const openNote = openStringNotes[stringNum]
  const startIndex = guitarRange.indexOf(openNote)

  if (startIndex !== -1) {
    const notesOnString = guitarRange.slice(startIndex + 1, startIndex + 1 + FRET_COUNT_ON_SVG)
    guitarStrings.push(notesOnString)
  }
}

/**
 * 科学的ピッチ表記を1オクターブ高くしてabcjsの音名表記に変換します。
 * @param {string} noteName - 科学的ピッチ表記の音名。
 * @returns {string} abcjs の音名表記。
 */
const scientificToAbcNotation = noteName => {
  if (!noteName) return ''
  const match = noteName.match(/([A-G])([b#]?)([0-9])/)
  if (!match) return ''

  let [, note, accidental, octaveStr] = match
  const octave = parseInt(octaveStr, 10) + 1

  if (accidental === '#') {
    note = `^${note}`
  } else if (accidental === 'b') {
    note = `_${note}`
  }

  if (octave === 4) {
    return note
  } else if (octave > 4) {
    return note.toLowerCase() + "'".repeat(octave - 5)
  } else {
    return note + ','.repeat(4 - octave)
  }
}

function FingerboardNotes () {
  const fretboardRef = useRef(null)
  const notationRef = useRef(null)
  const lastClickedPositionRef = useRef(null)
  // クリックされた音名を保持するための state
  const [currentNote, setCurrentNote] = useState(null)

  useEffect(() => {
    const svgElement = fretboardRef.current
    if (!svgElement) return

    initFretboardSvg(svgElement)
    const fretGroups = svgElement.querySelectorAll('.fret-position-group')

    const handleFretClick = event => {
      if (lastClickedPositionRef.current) {
        const { stringIndex, fretboardCxIndex } = lastClickedPositionRef.current
        hideFretMark(stringIndex, fretboardCxIndex, svgElement)
      }

      const group = event.currentTarget
      const stringIndex = parseInt(group.dataset.stringIndex, 10)
      const fretboardCxIndex = parseInt(group.dataset.fretboardCxIndex, 10)
      const scientificNote = guitarStrings[stringIndex][fretboardCxIndex]

      if (scientificNote) {
        // --- 1. クリックされた音名を state にセット ---
        setCurrentNote(scientificNote)

        // --- 2. ギターの音を鳴らす ---
        playNote('guitar', scientificNote)

        // --- 3. 新しい位置に赤丸を表示（テキストは空にする） ---
        showFretMark(stringIndex, fretboardCxIndex, '', 'red', 'white', svgElement)

        // --- 4. 楽譜を表示する ---
        const abcNote = scientificToAbcNotation(scientificNote)
        if (abcNote) {
          const abcString = `L: 4/4\n${abcNote}`
          abcjs.renderAbc(notationRef.current, abcString, {
            responsive: 'resize',
            staffwidth: 100
          })
        }

        lastClickedPositionRef.current = { stringIndex, fretboardCxIndex }
      }
    }

    fretGroups.forEach(group => {
      group.addEventListener('click', handleFretClick)
    })

    return () => {
      fretGroups.forEach(group => {
        group.removeEventListener('click', handleFretClick)
      })
    }
  }, [])

  return (
    <>
      <h2>指板の音を覚える</h2>
      <p className='center' style={{ margin: '20px 0' }}>
        指板上の任意のフレットをクリックすると、その音を再生し、楽譜を表示します。
      </p>

      <svg
        ref={fretboardRef}
        id='fretboard_svg'
        viewBox='0 0 810 170'
        style={{ cursor: 'pointer' }}
      ></svg>

      <div className='FingerboardNotes-result'>
        <div ref={notationRef} className='abcjs-notation-output'></div>
        <div className='note-display-area'>
          {currentNote && <p style={{ fontSize: '5rem' }}>{currentNote}</p>}
        </div>
      </div>

      <div className='controls-panel'>
        <Volume />
      </div>
    </>
  )
}

export default FingerboardNotes
