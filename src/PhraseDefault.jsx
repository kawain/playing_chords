import { useState, useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import 'abcjs/abcjs-audio.css'
import { phrases } from './etc/phrases'

function Phrase () {
  const [abcString, setAbcString] = useState('')

  // 楽譜と再生コントロールを描画するためのDOM要素への参照
  const notationRef = useRef(null)
  const audioControlRef = useRef(null)

  // abcjsのオーディオ関連のインスタンスを保持するためのref
  const synthControllerRef = useRef(null)
  const visualObjRef = useRef(null)

  useEffect(() => {
    if (!abcString) return

    // 楽譜を描画
    // renderAbcは描画された楽譜の情報を配列で返す
    visualObjRef.current = abcjs.renderAbc(notationRef.current, abcString, {
      responsive: 'resize' // レスポンシブ対応
    })[0]

    // 再生コントロールの初期化
    if (abcjs.synth.supportsAudio()) {
      // SynthControllerを初期化
      synthControllerRef.current = new abcjs.synth.SynthController()
      synthControllerRef.current.load(audioControlRef.current, null, {
        displayLoop: true, // ループ再生ボタンを表示
        displayRestart: true, // 最初から再生ボタンを表示
        displayPlay: true, // 再生・停止ボタンを表示
        displayProgress: true, // 進捗バーを表示
        displayWarp: true // テンポ変更コントロールを表示
      })

      // 再生用のシンセサイザーを作成
      const synth = new abcjs.synth.CreateSynth()
      synth
        .init({
          visualObj: visualObjRef.current
        })
        .then(() => {
          synthControllerRef.current
            .setTune(visualObjRef.current, false)
            .then(() => {
              console.log('Audio successfully loaded.')
            })
            .catch(error => {
              console.warn('Audio problem:', error)
            })
        })
        .catch(error => {
          console.warn('Audio problem:', error)
        })
    } else {
      // オーディオをサポートしていないブラウザの場合
      if (audioControlRef.current) {
        audioControlRef.current.innerHTML = 'Audio is not supported in this browser.'
      }
    }

    // コンポーネントのアンマウント時にクリーンアップ
    return () => {
      if (synthControllerRef.current) {
        synthControllerRef.current.pause()
        synthControllerRef.current.destroy()
      }
    }
  }, [abcString])

  const handleChange = event => {
    setAbcString(event.target.value)
  }

  return (
    <>
      <h2>フレーズ練習</h2>
      <div className='phrases-select'>
        <select value={abcString} onChange={handleChange}>
          <option value=''>選んでください</option>
          {phrases.map((phrase, index) => (
            <option key={index} value={phrase.abcNotation}>
              {phrase.title}
            </option>
          ))}
        </select>
      </div>

      <div className='abcjs-area'>
        {/* 楽譜の描画エリア */}
        <div ref={notationRef} />
        {/* 再生コントロールの描画エリア */}
        <div ref={audioControlRef} />
      </div>
    </>
  )
}

export default Phrase
