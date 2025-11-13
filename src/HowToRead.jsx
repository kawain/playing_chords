import { useState, useEffect } from 'react'
import AbcScore from './AbcScore'

function HowToRead () {
  const scale = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']
  const scaleLength = scale.length
  // 初期化をuseEffectの外で行い、不要な再レンダリングを防ぐ
  const [ascendingScaleAll, setAscendingScaleAll] = useState([])
  const [descendingScaleAll, setDescendingScaleAll] = useState([])

  // useEffectの依存配列が空なので、コンポーネントのマウント時に一度だけ実行される
  useEffect(() => {
    const buildScales = () => {
      const ascScales = []
      const descScales = []
      for (const startNote of scale) {
        const startIndex = scale.indexOf(startNote)
        const ascendingScale = []
        const descendingScale = []
        for (let i = 0; i < scaleLength; i++) {
          const ascendingIndex = (startIndex + i) % scaleLength
          ascendingScale.push(scale[ascendingIndex])
          const descendingIndex = (startIndex - i + scaleLength) % scaleLength
          descendingScale.push(scale[descendingIndex])
        }
        ascScales.push(ascendingScale)
        descScales.push(descendingScale)
      }
      setAscendingScaleAll(ascScales)
      setDescendingScaleAll(descScales)
    }

    buildScales()

    // クリーンアップ関数は空の配列をセットする必要はない
    return () => {}
  }, []) // 依存配列が空なので初回レンダリング後のみ実行

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
        <strong>「どの音を」「どれくらいの長さで」演奏するか</strong>
        が書かれた、いわば「音楽の設計図」です。いくつかの基本的なルールさえ覚えてしまえば、誰でも読めるようになります。
      </p>
      <p>まずは、楽譜を構成する大きな要素から見ていきましょう。</p>
      <h4>STEP 1：音の「高さ」を読む ～五線譜と音部記号～</h4>
      <p>
        音の高さは、<strong>五線（ごせん）</strong>
        という5本の線と、その間（かん）のどこに音符が置かれているかで決まります。
      </p>
      <ul>
        <li>
          <strong>五線譜（ごせんふ）</strong>:
          5本の横線が引かれたキャンバスです。ルールはとてもシンプルで、
          <strong>音符が上にあるほど高い音</strong>、<strong>下にあるほど低い音</strong>
          を表します。音符は線の上と線の間に、交互にジグザグに並んでいきます。
        </li>
        <li>
          <strong>音部記号（おんぶきごう）</strong>:
          五線の左端にある大きな記号で、その五線譜の「音の高さの基準」を示します。これがなければ、どの音が「ド」なのか全く分かりません。まずは代表的な2つを覚えましょう。
          <ul>
            <li>
              <strong>ト音記号</strong>: 五線の<strong>下から2番目の線が「ソ」</strong>
              の音であることを示します。比較的に高い音域のパート（ボーカル、ピアノの右手、ギター、フルートなど）で使われます。
            </li>
            <li>
              <strong>ヘ音記号</strong>: 五線の<strong>上から2番目の線が「ファ」</strong>
              の音であることを示します。比較的に低い音域のパート（ベース、ピアノの左手、チェロなど）で使われます。
            </li>
          </ul>
        </li>
      </ul>

      <div className='one-point-advice'>
        <h5>【なぜ2種類あるの？】</h5>
        <p>
          ピアノの鍵盤を思い浮かべてください。とても横に長いですよね。もしト音記号だけでピアノのすべての音を表そうとすると、五線譜から大きくはみ出した、数えきれないほどの線（加線）が必要になり、非常に読みにくくなります。そこで、高い音域はト音記号、低い音域はヘ音記号と役割分担することで、楽譜をスッキリと読みやすくしているのです。
        </p>
      </div>

      <h3>ト音記号の楽譜例</h3>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no1Notation} />
      </div>

      <h3>ヘ音記号の楽譜例</h3>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no2Notation} />
      </div>

      <h4>STEP 2：音の「長さ」を読む ～音符と休符～</h4>
      <p>
        音の長さは、<strong>音符（おんぷ）の形</strong>
        で決まります。基本となるのは「4分音符」で、これを「1拍」と数えることが多いです。
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
        もあり、それぞれ対応する音符と同じ長さの休みを表します。音楽は音が鳴っている時間と同じくらい、音が鳴らない時間も大切なのです。
      </p>

      <h4>STEP 3：曲の「リズム」を読む ～拍子と小節～</h4>
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
              <strong>下の数字</strong>: どの音符を1拍の基準とするか（4は「4分音符」）。
            </li>
            <li>
              <strong>上の数字</strong>: 1つの部屋（小節）にその基準の拍が何個入るか。
            </li>
            <li>
              つまり「4/4拍子」は、<strong>「1小節に4分音符が4つ入るリズムで進みますよ」</strong>
              という宣言になります。「イチ、ニ、サン、シ」と自然に手拍子が打てる、最もポピュラーなリズムです。
            </li>
          </ul>
        </li>
        <li>
          <p>
            <strong>小節と縦線</strong>: 五線譜は<strong>縦線（じゅうせん）</strong>
            でいくつかの部屋に区切られています。この一つの部屋を<strong>小節（しょうせつ）</strong>
            と呼びます。各小節の中には、拍子記号で示された長さ分の音符や休符がキッチリと収まるルールになっています。
          </p>
        </li>
      </ul>

      <h3>音の「長さ」と「リズム」の例</h3>
      <p className='center'>再生してリズムを感じてみましょう。</p>
      <div className='abcjs-area'>
        <AbcScore abcNotation={no3Notation} />
      </div>
      <p>
        ※楽譜の冒頭にある「♩=100」は<strong>テンポ</strong>を表す記号で、
        <strong>「1分間に4分音符（♩）を100回刻む速さで演奏してください」</strong>
        という意味です。
      </p>

      <h3>まとめ</h3>
      <p>楽譜を読むための最初のステップは、以下の3つです。</p>
      <ol>
        <li>
          <strong>音部記号を見て、音の高さの基準（ドの位置）を確認する。</strong>
        </li>
        <li>
          <strong>音符の位置（線の上か、間か）を見て、音の高さ（ドレミ）を読む。</strong>
        </li>
        <li>
          <strong>音符の形を見て、音の長さを読み、拍子に合わせてリズムを把握する。</strong>
        </li>
      </ol>
      <p>
        最初は呪文のように見えるかもしれませんが、一つ一つの記号にはちゃんと意味があります。焦らず、まずは「ト音記号のドレミ」だけでも読めるように練習してみましょう。実際に楽器で音を出したり、歌ってみたりしながら楽譜を読むと、より速く身につきます。楽譜が読めるようになると、音楽の世界が何倍にも広がりますよ！
      </p>

      <h3>譜読みをスピードアップする頭の体操</h3>
      <p>
        楽譜を読むとき、一つ一つの音符を「えーっと、これはドで、次が…」と数えていると、演奏が止まってしまいますよね。音符のかたまりをパッと見て「ドレミだ！」と認識できるようになるには、音階そのものに慣れておくことが近道です。
      </p>
      <p>
        ここでは、そのための簡単な口頭トレーニングを紹介します。「ドレミファソラシド」を色々な音から始めたり、逆にたどったりする練習です。これをスラスラ言えるようになると、楽譜上の音の並びを予測しやすくなり、譜読みのスピードが格段にアップします。
      </p>

      <div className='center'>
        <h5>上昇音階（上に向かって）</h5>
        <table className='spell'>
          <tbody>
            {ascendingScaleAll.map((scale, index) => (
              <tr key={index}>
                {scale.map((note, noteIndex) => (
                  <td key={noteIndex}>{note}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <h5>下降音階（下に向かって）</h5>
        <table className='spell'>
          <tbody>
            {descendingScaleAll.map((scale, index) => (
              <tr key={index}>
                {scale.map((note, noteIndex) => (
                  <td key={noteIndex}>{note}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default HowToRead
