import { useState, useEffect } from 'react'
import HowToRead from './HowToRead'
import MusicTheory from './MusicTheory'
import MusicTheory2 from './MusicTheory2'
import MusicTheory3 from './MusicTheory3'
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
      case 'HowToRead':
        return <HowToRead />
      case 'MusicTheory':
        return <MusicTheory />
      case 'MusicTheory2':
        return <MusicTheory2 />
      case 'MusicTheory3':
        return <MusicTheory3 />
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
        return (
          <Accompaniment tempo={tempo} setTempo={setTempo} handleTempoChange={handleTempoChange} />
        )
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
            <option value='HowToRead'>楽譜の読み方</option>
            <option value='MusicTheory'>簡単な音楽理論</option>
            <option value='MusicTheory2'>マイナー・スケールの話</option>
            <option value='MusicTheory3'>複雑なコードの仕組み</option>
            <option value='FingerboardNotes'>指板の音を覚える</option>
            <option value='Chord'>コードポジション</option>
            <option value='Scale'>コードトーンとスケール</option>
            {/* <option value='Phrase'>フレーズ</option> */}
            <option value='ChordPlaying'>五度圏コード進行</option>
            <option value='Accompaniment'>コード入力演奏</option>
            <option value='Tuning'>チューニング</option>
            <option value='Metronome'>メトロノーム</option>
          </select>
        </nav>
        <main>{renderContent()}</main>
      </div>
    </>
  )
}

export default App
