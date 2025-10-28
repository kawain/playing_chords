import { useState, useEffect } from 'react'
import Tuning from './Tuning'
import Metronome from './Metronome'
import FretboardTrainer from './FretboardTrainer'
import Chord from './Chord'
import Scale from './Scale'
import Phrase from './Phrase'
import ChordPlaying from './ChordPlaying'
import Accompaniment from './Accompaniment'
import { loadAllSounds } from './etc/sound'
import './index.css'

function App () {
  // 表示するコンテンツを管理するステート
  const [currentContent, setCurrentContent] = useState('')
  // テンポを管理するステート
  const [tempo, setTempo] = useState(60)

  // テンポの変更イベントハンドラー
  const handleTempoChange = event => {
    const newTempo = parseInt(event.target.value, 10)
    setTempo(newTempo) // スライダーを動かしたらContextの値を更新
  }

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
      case 'Tuning':
        return <Tuning />
      case 'Metronome':
        return <Metronome tempo={tempo} handleTempoChange={handleTempoChange} />
      case 'FretboardTrainer':
        return <FretboardTrainer tempo={tempo} handleTempoChange={handleTempoChange} />
      case 'Chord':
        return <Chord />
      case 'Scale':
        return <Scale />
      case 'Phrase':
        return <Phrase tempo={tempo} handleTempoChange={handleTempoChange} />
      case 'ChordPlaying':
        return <ChordPlaying tempo={tempo} handleTempoChange={handleTempoChange} />
      case 'Accompaniment':
        return <Accompaniment tempo={tempo} setTempo={setTempo} handleTempoChange={handleTempoChange} />
      default:
        return ''
    }
  }

  return (
    <>
      <div className='container'>
        <h1>ギター練習アプリ</h1>
        <nav>
          <button onClick={() => setCurrentContent('Tuning')} disabled={currentContent === 'Tuning'}>
            <span>チューニング</span>
          </button>
          <button onClick={() => setCurrentContent('Metronome')} disabled={currentContent === 'Metronome'}>
            <span>メトロノーム</span>
          </button>
          <button onClick={() => setCurrentContent('FretboardTrainer')} disabled={currentContent === 'FretboardTrainer'}>
            <span>音符と弦番号</span>
          </button>
          <button onClick={() => setCurrentContent('Chord')} disabled={currentContent === 'Chord'}>
            <span>コードポジション</span>
          </button>
          <button onClick={() => setCurrentContent('Scale')} disabled={currentContent === 'Scale'}>
            <span>コードトーンとスケール</span>
          </button>
          <button onClick={() => setCurrentContent('Phrase')} disabled={currentContent === 'Phrase'}>
            <span>フレーズ</span>
          </button>
          <button onClick={() => setCurrentContent('ChordPlaying')} disabled={currentContent === 'ChordPlaying'}>
            <span>ランダムコード演奏</span>
          </button>
          <button onClick={() => setCurrentContent('Accompaniment')} disabled={currentContent === 'Accompaniment'}>
            <span>コード入力演奏</span>
          </button>
        </nav>
        <main>{renderContent()}</main>
      </div>
    </>
  )
}

export default App
