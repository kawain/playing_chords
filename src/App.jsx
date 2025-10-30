import { useState, useEffect } from 'react'
import Tuning from './Tuning'
import Metronome from './Metronome'
import FingerboardNotes from './FingerboardNotes'
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
      case 'FingerboardNotes':
        return <FingerboardNotes tempo={tempo} handleTempoChange={handleTempoChange} />
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
          <select value={currentContent} onChange={e => setCurrentContent(e.target.value)}>
            <option value=''>コンテンツを選択してください</option>
            <option value='Tuning'>チューニング</option>
            <option value='Metronome'>メトロノーム</option>
            <option value='FingerboardNotes'>指板の音を覚える</option>
            <option value='Chord'>コードポジション</option>
            <option value='Scale'>コードトーンとスケール</option>
            <option value='Phrase'>フレーズ</option>
            <option value='ChordPlaying'>ランダムコード演奏</option>
            <option value='Accompaniment'>コード入力演奏</option>
          </select>
        </nav>
        <main>{renderContent()}</main>
      </div>
    </>
  )
}

export default App
