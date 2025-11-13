function MusicTheory3 () {
  return (
    <div className='music-theory'>
      <h2>STEP FINAL：コードネームの暗号を解読しよう！複雑なコードの仕組み</h2>
      <p>
        楽譜を見ていると、「C」や「Am」のようなシンプルなコードだけでなく、「Cmaj7(♯11)」や「G7(sus4,♭9)」といった、まるで化学式のような複雑なコードネームに出会うことがあります。一見すると難解で混乱してしまいますよね。
      </p>
      <p>
        しかし、心配は無用です。これらの複雑なコードは全て、これまで学んできた
        <strong>
          基本の三和音（トライアド）に「音を足したり」「音を入れ替えたり」する指示が書かれているだけ
        </strong>
        なのです。ルールさえ分かれば、誰でも解読できる「音楽の設計図」の一部です。
      </p>

      <h4>1. コードの骨格「トライアド」と味付けの材料「テンションノート」</h4>
      <p>
        全てのコードの土台は、<strong>ルート(R)、3度(3rd)、5度(5th)</strong>
        で構成される「トライアド」です。ここに様々な音を加えて、コードに彩りや深みを与えていきます。
      </p>
      <p>
        その「味付け」として使われるのが、1オクターブ上の音である<strong>テンションノート</strong>
        です。
      </p>
      <ul>
        <li>
          2度の1オクターブ上 → <strong>9th (ナインス)</strong>
        </li>
        <li>
          4度の1オクターブ上 → <strong>11th (イレブンス)</strong>
        </li>
        <li>
          6度の1オクターブ上 → <strong>13th (サーティーンス)</strong>
        </li>
      </ul>
      <p>
        「なぜ10thや12thはないの？」と疑問に思うかもしれません。それは、10thは3rdの、12thは5thの、14thは7thの1オクターブ上の音であり、コードの響きにおける役割が同じだからです。そのため、特別な響きを加える「テンション」としては、主に
        <strong>9th, 11th, 13th</strong>が使われます。
      </p>

      <h4>2. コードネームの解読ルール</h4>
      <p>複雑なコードは、いくつかの基本ルールを組み合わせることで成り立っています。</p>

      <h5>ルール①：`sus` は「3rdの入れ替え」</h5>
      <p>
        <code>sus</code>は「サスペンド（保留する）」の略です。コードの明るさ・暗さを決める
        <strong>3rdの音を一旦お休みさせ、代わりに指定された音を入れます</strong>。
      </p>
      <ul>
        <li>
          <strong>Csus4</strong>: 3rd(ミ)の代わりに4th(ファ)を入れる → <strong>C, F, G</strong>
        </li>
        <li>
          <strong>Csus2</strong>: 3rd(ミ)の代わりに2nd(レ)を入れる → <strong>C, D, G</strong>
        </li>
      </ul>
      <p>
        3rdの音がないため、メジャーでもマイナーでもない、中性的で浮遊感のあるサウンドになります。
      </p>

      <h5>ルール②：`add` や `6` は「単純な足し算」</h5>
      <p>
        これらはトライアドに指定の音を<strong>シンプルに加えるだけ</strong>のコードです。
      </p>
      <ul>
        <li>
          <strong>Cadd9</strong> (またはCadd2): トライアドに9th(レ)を加える →{' '}
          <strong>C, E, G, D</strong>
        </li>
        <li>
          <strong>C6</strong>: トライアドに6th(ラ)を加える → <strong>C, E, G, A</strong>
        </li>
      </ul>
      <p>
        ※<code>Cadd9</code>は、後述する<code>C9</code>と違い、7thの音を含まないのがポイントです。
      </p>

      <h5>ルール③：`7`以上の数字は「下の奇数を全部乗せ」が原則</h5>
      <p>
        これが最も重要で、少しややこしいルールです。コードネームに「7」以上の数字がある場合、それは
        <strong>
          「ルートからその音までの間の、奇数番目のテンションノート（と7th）を全て含みますよ」
        </strong>
        という指示になります。
      </p>
      <ul>
        <li>
          <strong>C7</strong> = R, 3, 5, <strong>b7</strong>
        </li>
        <li>
          <strong>C9</strong> = C7の構成音 + 9th → R, 3, 5, <strong>b7, 9</strong>
        </li>
        <li>
          <strong>C11</strong> = C9の構成音 + 11th → R, 3, 5, <strong>b7, 9, 11</strong>
        </li>
        <li>
          <strong>C13</strong> = C11の構成音 + 13th → R, 3, 5, <strong>b7, 9, 11, 13</strong>
        </li>
      </ul>
      <p>
        このルールがあるため、<strong>C6 (C,E,G,A)</strong> と <strong>C13 (C,E,G,B♭,D,F,A)</strong>{' '}
        は全く違うコードになるのです。
      </p>
      <p>
        このルールは、<code>maj7</code>（長7度）や<code>m7</code>（短3度,
        短7度）が付いていても同様に適用されます。
      </p>
      <ul>
        <li>
          <strong>Cmaj9</strong> = R, 3, 5, <strong>7, 9</strong>
        </li>
        <li>
          <strong>Cm11</strong> = R, <strong>b3</strong>, 5, <strong>b7, 9, 11</strong>
        </li>
      </ul>

      <h5>ルール④：`♭(b)` や `♯(#)` は「指定した音を変化」</h5>
      <p>
        テンションノートの横に<code>♭</code>や<code>♯</code>
        が付いている場合、それはそのテンションノートを半音上げ下げする指示です。ジャズなどで、より複雑でスリリングな響きを作りたいときに使われるスパイスです。
      </p>
      <ul>
        <li>
          <strong>C7(b13)</strong>: C7の構成音に、13th(ラ)を半音下げた音(ラ♭)を加える。
        </li>
        <li>
          <strong>Cmaj7(♯11)</strong>: Cmaj7の構成音に、11th(ファ)を半音上げた音(ファ#)を加える。
        </li>
        <li>
          <strong>C7(sus4, b9)</strong>: Csus4をベースに、7th(シ♭)と♭9th(レ♭)を加える。
        </li>
      </ul>

      <h4>3. 実践編：コードは全部弾かなくていい！「ヴォイシング」の技術</h4>
      <p>
        さて、ここまでルールを説明してきましたが、「C13なんて7音もあって、ギターやピアノでどうやって押さえるの？」と思いますよね。
      </p>
      <p>
        答えは、<strong>「全部弾く必要はない」</strong>です。
      </p>
      <p>
        実際に演奏する際は、そのコードの響きを特徴づける<strong>重要な音を選んで弾きます</strong>
        。これを「ヴォイシングを考える」と言います。
      </p>
      <ul>
        <li>
          <strong>必須の音</strong>: コードのキャラクターを決める<strong>3rd</strong>と
          <strong>7th</strong>。
        </li>
        <li>
          <strong>特徴づける音</strong>: コードネームで指定された
          <strong>最も高いテンションノート</strong>（例: C13なら13th）。
        </li>
        <li>
          <strong>省略されがちな音</strong>:
          <ul>
            <li>
              <strong>ルート(R)</strong>: ベース担当の人が弾いてくれることが多い。
            </li>
            <li>
              <strong>5th</strong>: コードの響きへの影響が少ないため、よく省略される。
            </li>
            <li>
              <strong>途中のテンション</strong>:
              C13の場合、9thや11thは省略しても、13thさえ入っていればC13らしい響きになる。
            </li>
          </ul>
        </li>
      </ul>
      <p>
        例えば、<code>C13</code>をギターやピアノで弾く場合、
        <strong>「C, E, B♭, A」 (R, 3, b7, 13)</strong>{' '}
        の4音だけでも、十分にC13のおしゃれな響きを表現できるのです。
      </p>
      <p>
        複雑なコードネームは、演奏者に「このスケールの中から、これらの音を使って自由にヴォイシングを作っていいですよ」という、
        <strong>響きのパレット</strong>を提示してくれている、と考えると良いでしょう。
      </p>
    </div>
  )
}

export default MusicTheory3
