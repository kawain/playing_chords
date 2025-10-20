import { useState, useEffect } from 'react'
import { setMasterVolume, getMasterVolume } from './etc/sound'

function Volume () {
  // 初期音量を getMasterVolume() から取得し、0-100の範囲に変換
  const [volume, setVolumeState] = useState(getMasterVolume() * 100)

  useEffect(() => {
    // コンポーネントがマウントされた時に初期音量を設定
    setMasterVolume(volume / 100)
  }, []) // 初回マウント時のみ実行

  const handleVolumeChange = event => {
    const newVolume = event.target.value
    setVolumeState(newVolume) // UIの状態を更新
    setMasterVolume(newVolume / 100) // sound.js の音量を更新 (0-1の範囲に変換)
  }

  return (
    <div className='volume-control'>
      <h3>音量調整</h3>
      <input
        type='range'
        min='0'
        max='100'
        value={volume}
        onChange={handleVolumeChange}
        aria-label='Master Volume'
      />
      <span>{volume}%</span>
    </div>
  )
}

export default Volume
