import { useState, useRef, useCallback } from 'react'
import { getAudioContext, playScheduledNote } from '../etc/sound'

export function usePlayback () {
  const [isPlaying, setIsPlaying] = useState(false)
  const scheduledSources = useRef([])
  const endTimer = useRef(null)

  const stop = useCallback(() => {
    scheduledSources.current.forEach(source => {
      try {
        source.stop()
      } catch (e) {
        /* Already stopped */
      }
    })
    scheduledSources.current = []

    if (endTimer.current) {
      clearTimeout(endTimer.current)
      endTimer.current = null
    }
    setIsPlaying(false)
    console.log('Playback stopped.')
  }, [])

  /**
   * PlayableSequenceオブジェクトを受け取って再生を開始する
   * @param {import('../etc/dataStructure').PlayableSequence} playableSequence
   * @param {number} [loopCount=1] - メインループの繰り返し回数
   */
  const play = useCallback(
    (playableSequence, loopCount = 1) => {
      stop()

      const audioContext = getAudioContext()
      if (!audioContext) {
        alert(
          'オーディオの準備ができていません。ページをクリックしてからもう一度お試しください。'
        )
        return
      }

      const sources = []
      const scheduleStartTime = audioContext.currentTime + 0.1
      let currentTimeOffset = 0
      let totalDuration = 0

      // 1. カウントイン部分をスケジュール (これはループしない)
      if (playableSequence.countInData) {
        const data = playableSequence.countInData
        data.tracks.forEach(track => {
          track.notes.forEach(note => {
            const source = playScheduledNote(
              track.instrument,
              note.pitch,
              scheduleStartTime + currentTimeOffset + note.startTime
            )
            if (source) sources.push(source)
          })
        })
        currentTimeOffset += data.duration
        totalDuration += data.duration
      }

      // 2. メインループ部分を、指定された回数だけ繰り返しスケジュールする
      const mainData = playableSequence.mainLoopData
      if (mainData.duration > 0) {
        // 無限ループを防ぐため duration が0より大きい場合のみ
        for (let i = 0; i < loopCount; i++) {
          mainData.tracks.forEach(track => {
            track.notes.forEach(note => {
              const source = playScheduledNote(
                track.instrument,
                note.pitch,
                // ↓↓↓ ループのオフセット時間を加算する
                scheduleStartTime +
                  currentTimeOffset +
                  i * mainData.duration +
                  note.startTime
              )
              if (source) sources.push(source)
            })
          })
        }
        // 全体の再生時間に、ループ回数分のメインループ時間を加算
        totalDuration += mainData.duration * loopCount
      }

      scheduledSources.current = sources
      setIsPlaying(true)
      console.log(
        `Playback scheduled. Total duration: ${totalDuration.toFixed(
          2
        )}s, Loop: ${loopCount} times.`
      )

      // 3. 全ての再生が終わるタイミングで isPlaying を false にする
      endTimer.current = setTimeout(() => {
        setIsPlaying(false)
        endTimer.current = null
        console.log('Playback finished.')
      }, totalDuration * 1000 + 200)
    },
    [stop]
  )

  return { play, stop, isPlaying }
}
