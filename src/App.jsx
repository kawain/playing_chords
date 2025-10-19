import { useState, useEffect } from 'react'
import Home from './Home'
import Fretboard from './Fretboard'
import DiatonicChords from './DiatonicChords'
import Accompaniment from './Accompaniment'
import Volume from './Volume' 
import { loadAllSounds } from './etc/sound'

import './index.css'

function App () {
  const [currentContent, setCurrentContent] = useState('Home')

  useEffect(() => {
    // ユーザーの最初のインタラクションでサウンドを読み込むためのイベントリスナー
    const initAndLoadSounds = () => {
      console.log('User interaction detected, loading sounds.')
      loadAllSounds()
      // 一度実行されたらリスナーを削除
      window.removeEventListener('click', initAndLoadSounds)
      window.removeEventListener('keydown', initAndLoadSounds)
    }

    window.addEventListener('click', initAndLoadSounds)
    window.addEventListener('keydown', initAndLoadSounds)

    return () => {
      window.removeEventListener('click', initAndLoadSounds)
      window.removeEventListener('keydown', initAndLoadSounds)
    }
  }, [])

  // 表示するコンテンツを決定する関数
  const renderContent = () => {
    switch (currentContent) {
      case 'Fretboard':
        return <Fretboard />
      case 'DiatonicChords':
        return <DiatonicChords />
      case 'Accompaniment':
        return <Accompaniment />
      case 'Home':
        return <Home />
      default:
        return <Home />
    }
  }

  return (
    <>
      <h1>Vite + React</h1>
      <div className='container'>
        <nav>
          <button
            onClick={() => setCurrentContent('Home')}
            disabled={currentContent === 'Home'}
          >
            <span>チューニング</span>
          </button>
          <button
            onClick={() => setCurrentContent('Fretboard')}
            disabled={currentContent === 'Fretboard'}
          >
            <span>指板音当てクイズ</span>
          </button>
          <button
            onClick={() => setCurrentContent('DiatonicChords')}
            disabled={currentContent === 'DiatonicChords'}
          >
            <span>ダイアトニックコード・クイズ</span>
          </button>
          <button
            onClick={() => setCurrentContent('Accompaniment')}
            disabled={currentContent === 'Accompaniment'}
          >
            <span>コード伴奏</span>
          </button>
        </nav>
        <main>
          <Volume />
          {renderContent()}
        </main>
      </div>
    </>
  )
}

export default App
