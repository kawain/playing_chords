import { useState, useEffect } from 'react'
import { setMasterVolume, getMasterVolume } from './etc/sound'

function Volume () {
  // 初期音量を getMasterVolume() から取得し、100倍した後に四捨五入して整数にする
  const [volume, setVolumeState] = useState(Math.round(getMasterVolume() * 100))

  // useEffectは初回マウント時に一度だけ実行されるため、このロジックは変更の必要なし
  useEffect(() => {
    setMasterVolume(volume / 100)
  }, [])

  const handleVolumeChange = event => {
    const newVolume = event.target.value
    setVolumeState(newVolume)
    setMasterVolume(newVolume / 100)
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
      <span>{Math.round(volume)}%</span>
    </div>
  )
}

export default Volume
