import ChordDiagram from './ChordDiagram'
import { allChords, CAGED } from './etc/chordForm'

function Code () {
  return (
    <>
      <h1>コード・ポジション</h1>
      <div className='code-position'>
        {allChords.map((chordData, index) => (
          <div key={index}>
            <h3>{chordData.name}</h3>
            <ChordDiagram configure={chordData.configure} chord={chordData.chord} />
          </div>
        ))}
      </div>

      <h2>CAGEDシステム</h2>
      <div className='sentence'>
        <p>
          ギターの「CAGED（ケイジド）システム」とは、
          オープンコード（オープンポジションのコード）の5つの基本フォーム（C・A・G・E・D）をもとに、
          指板全体でコードやスケール、アルペジオなどを体系的に理解・展開するためのフレームワークです。
        </p>
        <p>
          このシステムは、英語圏で広く使われており、ギターの指板を「地図のように」把握するのに非常に役立ちます。
        </p>
        <h3>CAGEDシステムの基本</h3>
        <p>
          CAGEDという名前は、以下の5つのメジャーコードのオープンフォームの頭文字から来ています：
        </p>
        <ul>
          <li>C：Cメジャーコード（C）</li>
          <li>A：Aメジャーコード（A）</li>
          <li>G：Gメジャーコード（G）</li>
          <li>E：Eメジャーコード（E）</li>
          <li>D：Dメジャーコード（D）</li>
        </ul>
        <p>
          これら5つのコードフォームは、バレー（セーハ）を使って指板上で移動可能であり、
          それぞれが異なるポジションで同じコード（たとえばCメジャー）を押さえる方法になります。
        </p>
        <h3>CAGEDの使い方の例（Cメジャーの場合）</h3>
        <p>たとえば「Cメジャーコード」をCAGEDシステムで押さえると：</p>
        <ol>
          <li>Cフォーム：通常のオープンC（3フレット以下）</li>
          <li>Aフォーム：5フレットでAフォームのC（Aコードの形を5フレットでバレー）</li>
          <li>Gフォーム：8フレット付近でGコードの形を使ってCを押さえる</li>
          <li>Eフォーム：8フレットでEコードの形をバレー（ルートは6弦）</li>
          <li>
            Dフォーム：10フレット付近でDコードの形を使ってCを押さえる（ルートは4弦）
          </li>
        </ol>
        <p>
          このように、1つのコードを5つの異なるポジション・フォームで押さえられるのがCAGEDの特徴です。
        </p>
        <h3>CAGEDのメリット</h3>
        <ol>
          <li>
            指板全体の理解が深まる
            <br />
            どこにどの音があるかが視覚的に把握しやすくなります。
          </li>
          <li>
            コード・スケール・アルペジオがつながる
            <br />
            各フォームに対応するスケールやアルペジオも同じポジションで使えるため、即興演奏や作曲に役立ちます。
          </li>
          <li>
            移調が簡単になる
            <br />
            同じフォームを平行移動するだけで、他のキーにも対応できます。
          </li>
          <li>
            ソロとコードの連携がしやすい
            <br />
            同じポジション内でコードとメロディ（スケール）を弾き分けられます。
          </li>
        </ol>
        <h3>CAGEDとスケール</h3>
        <p>
          CAGEDシステムはコードだけでなく、メジャースケールにも適用されます。
          たとえばCメジャースケールは、C・A・G・E・Dの各フォームに対応した5つのポジション（「CAGEDポジション」）に分けて練習できます。
          これにより、指板全体でスケールをつなげて弾くことが可能になります。
        </p>
        <h3>注意点</h3>
        <p>
          CAGEDはメジャー系のコード・スケールを中心に設計されています。
          マイナー系には直接は適用できませんが、応用は可能です（例：AmはCメジャーの関係的マイナーとして扱うなど）。
        </p>
      </div>

      <div className='code-position-caged'>
        {CAGED.map((chordData, index) => (
          <div key={index}>
            <ChordDiagram configure={chordData.configure} chord={chordData.chord} />
          </div>
        ))}
      </div>
    </>
  )
}

export default Code
