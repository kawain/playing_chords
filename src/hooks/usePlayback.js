import { useState, useRef, useCallback } from 'react'
import { getAudioContext, playScheduledNote } from '../etc/sound'

export function usePlayback () {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMeasureIndex, setCurrentMeasureIndex] = useState(null)

  const scheduledSources = useRef([])
  const endTimer = useRef(null)
  const measureUpdateTimers = useRef([])

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

    measureUpdateTimers.current.forEach(timerId => clearTimeout(timerId))
    measureUpdateTimers.current = []

    setIsPlaying(false)
    setCurrentMeasureIndex(null)
    console.log('Playback stopped.')
  }, [])

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

      const mainData = playableSequence.mainLoopData
      if (mainData.duration > 0) {
        for (let i = 0; i < loopCount; i++) {
          mainData.tracks.forEach(track => {
            track.notes.forEach(note => {
              const source = playScheduledNote(
                track.instrument,
                note.pitch,
                scheduleStartTime +
                  currentTimeOffset +
                  i * mainData.duration +
                  note.startTime
              )
              if (source) sources.push(source)
            })
          })

          if (mainData.measureTimings) {
            mainData.measureTimings.forEach(timing => {
              const measureStartTime =
                scheduleStartTime +
                currentTimeOffset +
                i * mainData.duration +
                timing.startTime

              const delayInMs =
                (measureStartTime - audioContext.currentTime) * 1000

              if (delayInMs >= 0) {
                const timerId = setTimeout(() => {
                  setCurrentMeasureIndex(timing.index)
                }, delayInMs)
                measureUpdateTimers.current.push(timerId)
              }
            })
          }
        }
        totalDuration += mainData.duration * loopCount
      }

      scheduledSources.current = sources
      setIsPlaying(true)
      console.log(
        `Playback scheduled. Total duration: ${totalDuration.toFixed(
          2
        )}s, Loop: ${loopCount} times.`
      )

      endTimer.current = setTimeout(() => {
        setIsPlaying(false)
        setCurrentMeasureIndex(null)
        endTimer.current = null
        measureUpdateTimers.current = []
        console.log('Playback finished.')
      }, totalDuration * 1000 + 200)
    },
    [stop]
  )

  return { play, stop, isPlaying, currentMeasureIndex }
}
