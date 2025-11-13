import { useState, useEffect } from 'react'
import AbcScore from './AbcScore'

function HowToRead () {
  const scale = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']
  const scaleLength = scale.length
  const [ascendingScaleAll, setAscendingScaleAll] = useState([])
  const [descendingScaleAll, setDescendingScaleAll] = useState([])

  useEffect(() => {
    for (const startNote of scale) {
      // 開始となる音の、配列内での位置（インデックス）を取得します
      // 例：「ミ」なら 2
      const startIndex = scale.indexOf(startNote)

      // 結果を格納するための空の配列を用意します
      const ascendingScale = [] // 上昇音階用
      const descendingScale = [] // 下降音階用

      // 3. 7回ループして、音を一つずつ組み立てます
      for (let i = 0; i < scaleLength; i++) {
        // --- 上昇音階の生成 ---
        // (開始位置 + i) を配列の長さ(7)で割った余りを次の位置とします
        // これにより、「シ」の次に「ド」が来るように循環させることができます
        const ascendingIndex = (startIndex + i) % scaleLength
        ascendingScale.push(scale[ascendingIndex])

        // --- 下降音階の生成 ---
        // (開始位置 - i) を計算し、マイナスにならないように配列の長さを足してから割ります
        // これにより、「ド」の前に「シ」が来るように循環させることができます
        const descendingIndex = (startIndex - i + scaleLength) % scaleLength
        descendingScale.push(scale[descendingIndex])
      }

      setAscendingScaleAll(prev => [...prev, ascendingScale])
      setDescendingScaleAll(prev => [...prev, descendingScale])
    }

    return () => {
      setAscendingScaleAll([])
      setDescendingScaleAll([])
    }
  }, [])

  const no1Notation = `
X: 1
M: 4/4
L: 1/4
K: C clef=treble
E, F, G, A, | B, "@↓真ん中のド"C D E | F G A B | c d e f | g a b c' | d' e' f' g' |
w: ミ ファ ソ ラ シ ド レ ミ ファ ソ ラ シ ド レ ミ ファ ソ ラ シ ド レ ミ ファ ソ
  `

  const no2Notation = `
X: 1
M: 4/4
L: 1/4
K: C clef=bass
C,, D,, E,, F,, | G,, A,, B,, C, | D, E, F, G, | A, B, "@↓真ん中のド"C D | E F G A |
w: ド レ ミ ファ ソ ラ シ ド レ ミ ファ ソ ラ シ ド レ ミ ファ ソ ラ
  `

  const no3Notation = `
X: 1
M:4/4
L:1/8
Q:1/4=100
C2 C2 C2 C2 |C8 | C4 C4 | C4 z2 C2 |
C2 C2 C4 | C2 z4 C2 | C3 C3 C2 |
CC C2 C2 CC | C2 CC C2 CC | CCCz C z C z | z C z C CCCC | 
CCCC CCC2 | (3C2C2C2 C2 C2 | (3CCC (3CCC (3CCC (3CCC |
(3CzC (3CzC (3CzC (3CzC | z C z C z C z C |
C/2C/2C/2C/2 CC C/2C/2C/2C/2 CC | C2 C2 C4 | C/2C/2C/2C/2 C/2C/2C/2C/2 C/2C/2C/2C/2 C/2C/2C/2C/2 | C8 |
C/2C/2C C/2C/2C C/2C/2C C/2C/2C | C2 C2 C2 C2 | CC/2C/2 CC/2C/2 CC/2C/2 CC/2C/2 | C2 C2 C2 C2 |
C<C C<C C<C C<C | C2 C2 C2 C2 | C>C C>C C>C C>C | C2 C2 C2 C2 |
C/2CC/2 z2 C/2CC/2 z2 | C2 C2 C2 C2 | C/2CC/2 C/2CC/2 C/2CC/2 C/2CC/2 | C2 C2 C2 C2 |
  `

  return (
    <div className='how-to-read'>
      <h3>楽譜は音楽の設計図！ゼロから始める楽譜の読み方入門</h3>
      <p>
        楽譜は、一見すると複雑な記号の集まりに見えるかもしれません。しかし、これは
        <strong>「どの音を」「どれくらいの長さで」「どんな強さで」演奏するか</strong>
        が書かれた、いわば「音楽の設計図」です。いくつかの基本的なルールさえ覚えてしまえば、誰でも読めるようになります。
      </p>
      <p>まずは、楽譜を構成する3つの大きな要素から見ていきましょう。</p>
      <h4>STEP 1：音の「高さ」を読む</h4>
      <p>
        音の高さは、<strong>五線（ごせん）</strong>
        という5本の線と、その間（かん）のどこに音符が置かれているかで決まります。
      </p>
      <h5>五線と音部記号</h5>
      <ul>
        <li>
          <strong>五線譜（ごせんふ）</strong>: 5本の横線のキャンバスです。
          <strong>音符が上にあるほど高い音</strong>、<strong>下にあるほど低い音</strong>を表します。
        </li>
        <li>
          <strong>音部記号（おんぶきごう）</strong>:
          五線の左端にある大きな記号で、音の高さを決める「基準」を示します。まずは代表的な2つを覚えましょう。
          <ul>
            <li>
              <strong>ト音記号</strong>:
              比較的に高い音域のパート（ボーカル、ピアノの右手、ギター、フルートなど）で使われます。記号の描き始めの中心が「ソ」の音になります。
            </li>
            <li>
              <strong>ヘ音記号</strong>:
              比較的に低い音域のパート（ベース、ピアノの左手、チェロなど）で使われます。記号の点の間の線が「ファ」の音になります。
            </li>
          </ul>
        </li>
      </ul>

      <h3>ト音記号</h3>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no1Notation} />
      </div>

      <h3>ヘ音記号</h3>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no2Notation} />
      </div>

      <h4>STEP 2：音の「長さ」を読む</h4>
      <p>
        音の長さは、<strong>音符（おんぷ）の形</strong>で決まります。基本となるのは「4分音符」です。
      </p>
      <table>
        <thead>
          <tr>
            <th>音符の種類</th>
            <th>見た目</th>
            <th>長さの目安（4分音符を1拍とした場合）</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>全音符</strong>
            </td>
            <td>白い丸</td>
            <td>4拍（ターーーー）</td>
          </tr>
          <tr>
            <td>
              <strong>2分音符</strong>
            </td>
            <td>白い丸に棒</td>
            <td>2拍（ターー）</td>
          </tr>
          <tr>
            <td>
              <strong>4分音符</strong>
            </td>
            <td>黒い丸に棒</td>
            <td>1拍（タン）</td>
          </tr>
          <tr>
            <td>
              <strong>8分音符</strong>
            </td>
            <td>黒い丸に棒と旗</td>
            <td>0.5拍（タ）</td>
          </tr>
        </tbody>
      </table>
      <p>ピザを分けるイメージで考えると分かりやすいです。</p>
      <ul>
        <li>全音符がピザ1枚</li>
        <li>2分音符はその半分</li>
        <li>4分音符は4等分した1切れ</li>
        <li>8分音符は8等分した1切れ</li>
      </ul>
      <p>
        また、音を出さない時間を示す<strong>休符（きゅうふ）</strong>
        もあり、それぞれ音符と同じ長さの休みを表します。
      </p>

      <h4>STEP 3：曲の「リズム」を読む</h4>
      <p>
        曲全体のリズムや構造は、<strong>拍子記号（ひょうしきごう）</strong> と
        <strong>小節（しょうせつ）</strong> で決まります。
      </p>
      <ul>
        <li>
          <p>
            <strong>拍子記号</strong>:
            音部記号の隣にある分数のような記号です。「4/4」などがよく使われます。
          </p>
          <ul>
            <li>
              <strong>下の数字</strong>: どの音符を1拍とするか（4は4分音符）。
            </li>
            <li>
              <strong>上の数字</strong>: 1つの部屋（小節）にその音符が何個入るか。
            </li>
            <li>
              つまり「4/4拍子」は、<strong>「1小節に4分音符が4つ入るリズムですよ」</strong>
              という意味になります。
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>小節と縦線</strong>: 五線譜は<strong>縦線（じゅうせん）</strong>
            でいくつかの部屋に区切られています。この一つの部屋を<strong>小節（しょうせつ）</strong>
            と呼びます。各小節の中には、拍子記号で示された長さ分の音符や休符が入ります。
          </p>
        </li>
      </ul>

      <h3>音の「長さ」と「リズム」の例</h3>
      <p className='center'>再生してみましょう。</p>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no3Notation} />
      </div>

      <p>
        ※「♩=100」とは<strong>「1分間に4分音符（♩）を100回刻む速さで演奏してください」</strong>
        という意味です。
      </p>

      <h3>まとめ</h3>
      <p>楽譜を読むための最初のステップは、以下の3つです。</p>
      <ol>
        <li>
          <strong>音部記号を見て、音の高さの基準を確認する。</strong>
        </li>
        <li>
          <strong>音符の位置を見て、音の高さ（ドレミ）を読む。</strong>
        </li>
        <li>
          <strong>音符の形を見て、音の長さを読む。</strong>
        </li>
      </ol>
      <p>
        最初は呪文のように見えるかもしれませんが、一つ一つの記号にはちゃんと意味があります。焦らず、まずは「ト音記号のドレミ」だけでも読めるように練習してみましょう。実際に楽器で音を出したり、歌ってみたりしながら楽譜を読むと、より速く身につきます。楽譜が読めるようになると、音楽の世界が何倍にも広がりますよ！
      </p>

      {/*  */}
      <h3>楽譜を早く読む裏技</h3>
      <p>
        「ドレミファソラシド」は言えるが、いつも「ド」から始まり、いつも「上がる」方向にしか言えない。
        こういう状態から、「ドレミファソラシド」のスタート地点がどこからでも、上昇音階と下降音階を言えるようにしましょう。
        下の文を声に出して練習しましょう。
      </p>

      <div className='center'>
        <h5>上昇音階</h5>
        <table className='spell'>
          {ascendingScaleAll.map((scale, index) => (
            <tr key={index}>
              {scale.map((note, noteIndex) => (
                <td key={noteIndex}>{note}</td>
              ))}
            </tr>
          ))}
        </table>
        <h5>下降音階</h5>
        <table className='spell'>
          {descendingScaleAll.map((scale, index) => (
            <tr key={index}>
              {scale.map((note, noteIndex) => (
                <td key={noteIndex}>{note}</td>
              ))}
            </tr>
          ))}
        </table>
      </div>
    </div>
  )
}

export default HowToRead
