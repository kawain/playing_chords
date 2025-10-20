import { useState, useEffect } from 'react'
import Volume from './Volume'
import Tempo from './Tempo'
import { startMetronome, stopMetronome } from './etc/metronome'
import { SoundSources } from './etc/sound'

function Metronome ({ tempo, handleTempoChange }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedSound, setSelectedSound] = useState('bass-drum')
  const [beat, setBeat] = useState(0)

  // sound.jsから打楽器のリスト（ピッチを持たない音源）を動的に取得
  const drumSounds = Object.keys(SoundSources).filter(
    key => SoundSources[key].pitch === null
  )

  // isPlaying, tempo, selectedSound が変更されたときの副作用を管理します
  useEffect(() => {
    // 再生中の場合
    if (isPlaying) {
      // 1拍ごとに呼び出されるコールバック関数
      const onBeatCallback = () => {
        // beatステートを更新してUIを再レンダリングさせます
        setBeat(prevBeat => prevBeat + 1)
      }

      // メトロノームを開始
      startMetronome(tempo, selectedSound, onBeatCallback)

      // クリーンアップ関数：コンポーネントのアンマウント時や、
      // 依存配列の変数が変わる前に実行されます
      return () => {
        stopMetronome()
      }
    } else {
      // 停止したときに拍カウントをリセット
      setBeat(0)
    }
  }, [isPlaying, tempo, selectedSound]) // これらの値が変わるたびにeffectが再実行されます

  // スタート・停止ボタンのクリックイベントハンドラー
  const handleStartStopClick = () => {
    setIsPlaying(!isPlaying)
  }

  // 音源選択のイベントハンドラー
  const handleSoundChange = event => {
    setSelectedSound(event.target.value)
  }

  // ボタンのテキストとスタイルを再生状態に応じて動的に決定します
  const buttonText = isPlaying ? '停止' : 'スタート'
  // beatが1以上の時に背景色を交互に変更します
  const buttonStyle =
    isPlaying && beat > 0
      ? {
          backgroundColor: beat % 2 !== 0 ? 'red' : 'white',
          color: beat % 2 !== 0 ? 'white' : 'black'
        }
      : {}

  return (
    <>
      <h2>メトロノーム</h2>

      <div className='metronome-controls'>
        <button
          onClick={handleStartStopClick}
          style={buttonStyle}
          className='start-stop-button'
        >
          {buttonText}
        </button>

        <h3>音色選択</h3>
        <select
          value={selectedSound}
          onChange={handleSoundChange}
          disabled={isPlaying}
        >
          {drumSounds.map(soundName => (
            <option key={soundName} value={soundName}>
              {soundName}
            </option>
          ))}
        </select>
      </div>

      <div className='controls-panel'>
        <Tempo tempo={tempo} handleTempoChange={handleTempoChange} />
        <Volume />
      </div>
    </>
  )
}

export default Metronome
