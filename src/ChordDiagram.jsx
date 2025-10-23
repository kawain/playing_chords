import { useRef, useEffect } from 'react'
import { SVGuitarChord } from 'svguitar'

const ChordDiagram = ({ configure, chord }) => {
  const chartRef = useRef(null)

  useEffect(() => {
    // 描画先のDOM要素が存在することを確認
    if (chartRef.current) {
      // 1. まず、描画先の要素の中身を空にする
      chartRef.current.innerHTML = ''

      // 2. 新しいコードダイアグラムを描画する
      const guitarChord = new SVGuitarChord(chartRef.current)
      guitarChord.configure(configure).chord(chord).draw()
    }
  }, [configure, chord]) // propsが変更された時だけ再実行

  return <div ref={chartRef} />
}

export default ChordDiagram
