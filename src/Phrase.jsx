import { useState, useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import { getAudioContext, playScheduledNote } from './etc/sound'
import { phrases } from './etc/phrases'
import Volume from './Volume'
import Tempo from './Tempo'

const formatAbcString = phrase => {
  if (!phrase) return ''
  const headerString = Object.entries(phrase.header)
    .map(([key, value]) => `${key}:${value}`)
    .join('\n')
  return `${headerString}\n${phrase.body}`
}

const midiToNoteName = midiNumber => {
  if (midiNumber < 21 || midiNumber > 108) return null
  const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
  const octave = Math.floor(midiNumber / 12) - 1
  const noteIndex = midiNumber % 12
  return noteNames[noteIndex] + octave
}

function Phrase ({ tempo, handleTempoChange }) {
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(0)
  const [abcString, setAbcString] = useState(() => formatAbcString(phrases[0]))
  const notationRef = useRef(null)
  const visualObjRef = useRef(null)
  const [isPlaybackReady, setIsPlaybackReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const scheduledSourcesRef = useRef([])
  const playbackTimeoutRef = useRef(null)

  const handlePhraseChange = event => {
    const newIndex = parseInt(event.target.value, 10)
    setSelectedPhraseIndex(newIndex)
    setAbcString(formatAbcString(phrases[newIndex]))
  }

  useEffect(() => {
    if (!notationRef.current) return

    setIsPlaybackReady(false)

    let tempoAppliedAbcString

    if (/^Q:.*$/m.test(abcString)) {
      tempoAppliedAbcString = abcString.replace(/^Q:.*$/m, `Q: ${tempo}`)
    } else {
      tempoAppliedAbcString = abcString.replace(/^(M:.*)$/m, `$1\nQ: ${tempo}`)
    }

    const visualObjs = abcjs.renderAbc(notationRef.current, tempoAppliedAbcString, {
      responsive: 'resize',
      add_classes: true
    })

    if (visualObjs.length > 0) {
      const visualObj = visualObjs[0]
      visualObjRef.current = visualObj

      const createAudioData = async () => {
        const audioCtx = getAudioContext()
        if (!audioCtx) {
          console.error(
            'AudioContext が初期化されていません。App.jsxの処理に問題がある可能性があります。'
          )
          return
        }

        const synth = new abcjs.synth.CreateSynth()
        try {
          // 1) ノートサンプル等を読み込んで初期化
          await synth.init({
            visualObj,
            audioContext: audioCtx
          })
          // 2) prime() を呼んで実際のオーディオバッファとタイミング情報を作る
          //    prime() が解決したら visualObj に noteTimings 等が入ります。
          const primeResult = await synth.prime()
          console.log('synth.prime() result:', primeResult)

          // 確認：visualObj.noteTimings があるかチェック
          if (!visualObj.noteTimings || visualObj.noteTimings.length === 0) {
            console.warn(
              'visualObj.noteTimings が見つかりません。代替で setTiming を試行します。'
            )
            // 代替措置：明示的にタイミングを設定して noteTimings を作らせる
            // visualObj.getBpm() が使えるので BPM を取得して setTiming を呼ぶ
            try {
              const bpm = visualObj.getBpm ? visualObj.getBpm() : undefined
              // 第2引数は measuresOfDelay（先頭に余分な小節を入れる場合）
              visualObj.setTiming && visualObj.setTiming(bpm || 0, 0)
            } catch (e) {
              console.error('visualObj.setTiming エラー:', e)
            }
          }

          console.log('再生データの準備が完了しました (noteTimings generated).')
          setIsPlaybackReady(true)
        } catch (error) {
          console.error('再生データの準備中にエラーが発生しました:', error)
        }
      }

      createAudioData()
    }
  }, [abcString, tempo])

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current)
      }
    }
  }, [])

  const stopPlayback = () => {
    // スケジュールされたすべての音源を停止
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.stop()
      } catch (e) {
        // すでに停止しているノードを止めようとするとエラーが出る場合があるため無視
      }
    })
    scheduledSourcesRef.current = []

    // 再生終了タイマーをキャンセル
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current)
    }

    // 再生状態を更新
    setIsPlaying(false)
    console.log('再生を停止しました。')
  }

  const playWithCustomSound = () => {
    const audioCtx = getAudioContext()
    if (!audioCtx || isPlaying) return

    const visualObj = visualObjRef.current
    if (!visualObj || !visualObj.noteTimings) {
      console.error('再生データが見つかりません。', visualObj)
      return
    }

    // 再生状態を開始にセット
    setIsPlaying(true)
    // 古い参照をクリア
    scheduledSourcesRef.current = []

    const startTime = audioCtx.currentTime + 0.1

    visualObj.noteTimings.forEach(event => {
      if (event.type === 'event' && event.midiPitches) {
        event.midiPitches.forEach(noteInfo => {
          const noteName = midiToNoteName(noteInfo.pitch)
          if (noteName) {
            const whenToPlay = startTime + event.milliseconds / 1000
            // playScheduledNote が返す音源ノードを受け取る
            const sourceNode = playScheduledNote('guitar', noteName, whenToPlay)
            // 停止できるように、参照を配列に保存しておく
            if (sourceNode) {
              scheduledSourcesRef.current.push(sourceNode)
            }
          }
        })
      }
    })

    // 曲の総時間を取得して、再生終了時に isPlaying を false に戻すタイマーをセット
    const totalDuration = visualObj.getTotalTime() // 秒単位
    const totalDurationMs = totalDuration * 1000 + 100 // 0.1秒の開始遅延を考慮
    playbackTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false)
      scheduledSourcesRef.current = [] // 終わったらクリア
      console.log('再生が完了しました。')
    }, totalDurationMs)

    console.log(
      `${scheduledSourcesRef.current.length}個のノートを再生スケジュールに登録しました。`
    )
  }

  return (
    <>
      <h2>フレーズ練習</h2>
      <select value={selectedPhraseIndex} onChange={handlePhraseChange}>
        {phrases.map((phrase, index) => (
          <option key={index} value={index}>
            {phrase.header.T}
          </option>
        ))}
      </select>
      <div>
        <button onClick={playWithCustomSound} disabled={!isPlaybackReady || isPlaying}>
          {isPlaybackReady ? (isPlaying ? '再生中...' : 'ギターの音で再生') : '準備中...'}
        </button>

        {isPlaying && (
          <button onClick={stopPlayback} style={{ marginLeft: '10px' }}>
            停止
          </button>
        )}
      </div>

      <div ref={notationRef} />
      <Volume />

      <Tempo disabled={isPlaying} tempo={tempo} handleTempoChange={handleTempoChange} />
    </>
  )
}

export default Phrase
