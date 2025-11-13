import { useEffect, useRef } from 'react'
import abcjs from 'abcjs'
import 'abcjs/abcjs-audio.css'

const AbcScore = ({ abcNotation }) => {
  // 楽譜と再生コントロールを描画するためのDOM要素への参照
  const notationRef = useRef(null)
  const audioControlRef = useRef(null)

  // abcjsのオーディオ関連のインスタンスを保持するためのref
  const synthControllerRef = useRef(null)
  const visualObjRef = useRef(null)

  useEffect(() => {
    if (!abcNotation) return

    // 楽譜を描画
    // renderAbcは描画された楽譜の情報を配列で返す
    visualObjRef.current = abcjs.renderAbc(notationRef.current, abcNotation, {
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
  }, [abcNotation]) // abcNotationが変更された時に再実行

  return (
    <div className='abc'>
      {/* 楽譜の描画エリア */}
      <div ref={notationRef} />
      {/* 再生コントロールの描画エリア */}
      <div ref={audioControlRef} />
    </div>
  )
}

export default AbcScore
