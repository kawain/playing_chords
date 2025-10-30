import { useState, useEffect, useRef } from 'react'
import { initFretboardSvg, showFretMark } from './etc/fretboard.js'
import Volume from './Volume'
import { playNote } from './etc/sound'

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
const openStringNotes = { 1: 'E4', 2: 'B3', 3: 'G3', 4: 'D3', 5: 'A2', 6: 'E2' }

const FRET_COUNT_ON_SVG = 22
const guitarStrings = []

for (let stringNum = 1; stringNum <= 6; stringNum++) {
  const openNote = openStringNotes[stringNum]
  const startIndex = guitarRange.indexOf(openNote)

  if (startIndex !== -1) {
    const notesOnString = guitarRange.slice(startIndex + 1, startIndex + 1 + FRET_COUNT_ON_SVG)
    guitarStrings.push(notesOnString)
  }
}

const notesToPractice = [...new Set(guitarStrings.flat())]

function FingerboardNotes () {
  const [isRunning, setIsRunning] = useState(false)
  const [currentNote, setCurrentNote] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  const fretboardRef = useRef(null)
  const timerRef = useRef(null)
  const stepRef = useRef(0)

  const intervalTime = 5000

  const resetFretboard = () => {
    if (fretboardRef.current) {
      initFretboardSvg(fretboardRef.current)
    }
    setCurrentNote(null)
    setShowAnswer(false)
  }

  useEffect(() => {
    resetFretboard()
  }, [])

  const findNotePositions = note => {
    const positions = []
    for (let stringIndex = 0; stringIndex < guitarStrings.length; stringIndex++) {
      const fretIndex = guitarStrings[stringIndex].indexOf(note)
      if (fretIndex !== -1) {
        positions.push({ stringIndex, fretboardCxIndex: fretIndex })
      }
    }
    return positions
  }

  const runTrainingStep = () => {
    if (stepRef.current === 0) {
      resetFretboard()
      const randomNote = notesToPractice[Math.floor(Math.random() * notesToPractice.length)]
      setCurrentNote(randomNote)

      const positions = findNotePositions(randomNote)
      if (positions.length > 0) {
        for (const position of positions) {
          showFretMark(
            position.stringIndex,
            position.fretboardCxIndex,
            '',
            'red',
            'white',
            fretboardRef.current
          )
        }
        playNote('guitar', randomNote)
      }
      stepRef.current = 1
    } else {
      setShowAnswer(true)
      stepRef.current = 0
    }
  }

  const handleStartStopClick = () => {
    if (isRunning) {
      clearInterval(timerRef.current)
      timerRef.current = null
    } else {
      runTrainingStep()
      timerRef.current = setInterval(runTrainingStep, intervalTime)
    }
    setIsRunning(!isRunning)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <>
      <h2>指板の音を覚える</h2>
      <div className='FingerboardNotes-controls'>
        <button onClick={handleStartStopClick}>{isRunning ? '停止' : '開始'}</button>
      </div>
      <svg ref={fretboardRef} id='fretboard_svg' viewBox='0 0 810 170'></svg>

      {showAnswer && (
        <p className='FingerboardNotes-answer'>
          答えは <span>{currentNote}</span> です
        </p>
      )}

      <div className='controls-panel'>
        <Volume />
      </div>
    </>
  )
}

export default FingerboardNotes
