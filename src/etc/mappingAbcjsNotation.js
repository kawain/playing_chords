const noteMap = {
  E2: 'E,',
  F2: 'F,',
  'F#2': '^F,',
  G2: 'G,',
  Ab2: '_A,',
  A2: 'A,',
  Bb2: '_B,',
  B2: 'B,',
  C3: 'C',
  'C#3': '^C',
  D3: 'D',
  Eb3: '_E',
  E3: 'E',
  F3: 'F',
  'F#3': '^F',
  G3: 'G',
  Ab3: '_A',
  A3: 'A',
  Bb3: '_B',
  B3: 'B',
  C4: 'c',
  'C#4': '^c',
  D4: 'd',
  Eb4: '_e',
  E4: 'e',
  F4: 'f',
  'F#4': '^f',
  G4: 'g',
  Ab4: '_a',
  A4: 'a',
  Bb4: '_b',
  B4: 'b',
  C5: "c'",
  'C#5': "^c'",
  D5: "d'",
  Eb5: "_e'",
  E5: "e'",
  F5: "f'",
  'F#5': "^f'",
  G5: "g'",
  Ab5: "_a'",
  A5: "a'",
  Bb5: "_b'",
  B5: "b'",
  C6: "c''",
  'C#6': "^c''",
  D6: "d''"
}

// --- guitarStringsを動的に生成 ---
const allNotes = Object.keys(noteMap)
const openStringNotes = { 1: 'E4', 2: 'B3', 3: 'G3', 4: 'D3', 5: 'A2', 6: 'E2' }
const guitarStrings = {}
const fretCount = 23

for (let stringNum = 1; stringNum <= 6; stringNum++) {
  const openNote = openStringNotes[stringNum]
  const startIndex = allNotes.indexOf(openNote)
  if (startIndex !== -1) {
    guitarStrings[stringNum] = allNotes.slice(startIndex, startIndex + fretCount)
  } else {
    guitarStrings[stringNum] = []
  }
}
// --- 生成ここまで ---

/**
 * 配列の要素をランダムにシャッフルする（フィッシャー–イェーツのシャッフル）
 * @param {Array} array - シャッフルする配列
 * @returns {Array} シャッフルされた配列
 */
function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * ギターの指板上からランダムな「音のポジション」を指定された数だけ生成する関数
 * @param {number} count - 生成したい音のポジションの数
 * @returns {Array<Object>} シャッフルされた音のポジションの配列 (例: [{E4: 1}, {A2: 5}, ...])
 */
function generateRandomNotes (count) {
  const allPositions = []
  const allNoteKeys = Object.keys(noteMap)

  // allPositionsの長さが指定された数に達するまでループ
  while (allPositions.length < count) {
    // 1. noteMapのキーからランダムに一つ選ぶ
    const randomNote = allNoteKeys[Math.floor(Math.random() * allNoteKeys.length)]

    // 2. 選ばれた音が指板上のどの弦にあるか検索
    const locations = []
    for (const stringNum in guitarStrings) {
      if (guitarStrings[stringNum].includes(randomNote)) {
        // {音名: 弦番号} の形式でオブジェクトを作成
        locations.push({ [randomNote]: parseInt(stringNum, 10) })
      }
    }

    // 3. 見つかったポジションをallPositionsに一つずつ追加
    for (const loc of locations) {
      allPositions.push(loc)
    }

    // ループの無限化を防ぐため、万が一noteMapが空ならブレーク
    if (allNoteKeys.length === 0) break
  }

  // 配列の長さを正確にcountに合わせる
  const trimmedArray = allPositions.slice(0, count)

  // 配列をシャッフルして返す
  return shuffleArray(trimmedArray)
}

/**
 * 音のポジション配列からABC記法の文字列を生成する関数
 * @param {Array<Object>} positionsArray - [{音名: 弦番号}, ...] の形式の配列
 * @returns {string} ABC記法の文字列
 */
function makeABC (positionsArray) {
  // 1. ABCヘッダーは固定
  let abcString = `X: 1\nM: 4/4\nL: 1/4\nK: C\n`

  if (!positionsArray || positionsArray.length === 0) {
    return abcString // 配列が空ならヘッダーだけを返す
  }

  // 2. 弦番号を歌詞用の丸付き数字に変換するマップ
  const stringCircleNumbers = {
    1: '①',
    2: '②',
    3: '③',
    4: '④',
    5: '⑤',
    6: '⑥'
  }

  let musicLine = '' // 音符行を一時的に格納する変数
  let lyricLine = '' // 歌詞（弦番号）行を一時的に格納する変数

  // 3. 配列をループして音符と歌詞の文字列を組み立てる
  for (let i = 0; i < positionsArray.length; i++) {
    const noteObject = positionsArray[i]
    const scientificNote = Object.keys(noteObject)[0]
    const stringNumber = noteObject[scientificNote]

    // noteMapを使って音名をABC記法に変換
    const abcNote = noteMap[scientificNote]
    // マップを使って弦番号を丸付き数字に変換
    const lyricChar = stringCircleNumbers[stringNumber]

    // 音符と歌詞をそれぞれの行に追加（末尾にスペース）
    musicLine += abcNote + ' '
    lyricLine += lyricChar + ' '

    // 4音符ごと（1小節の終わり）に小節線を追加
    if ((i + 1) % 4 === 0) {
      musicLine += '| '
      lyricLine += '| '
    }

    // 16音符ごと（4小節の終わり）に改行処理
    if ((i + 1) % 16 === 0 && i + 1 < positionsArray.length) {
      abcString += musicLine + '\n' + 'w: ' + lyricLine + '\n'
      // 次の行の準備のために変数をリセット
      musicLine = ''
      lyricLine = ''
    }
  }

  // 4. ループ終了後、残りの音符と歌詞（最後の行）を追加
  if (musicLine) {
    // 配列の長さが4の倍数でない場合、最後の小節線を追加
    if (positionsArray.length % 4 !== 0) {
      musicLine = musicLine.trimEnd() + ' |'
      lyricLine = lyricLine.trimEnd() + ' |'
    }
    abcString += musicLine.trimEnd() + '\n' + 'w: ' + lyricLine.trimEnd()
  }

  return abcString
}

// --- 実行デモ ---
const numberOfNotes = 8
console.log(`${numberOfNotes}個のランダムな音のポジションを生成します...`)
const randomNotes = generateRandomNotes(numberOfNotes)
console.log(JSON.stringify(randomNotes, null, 2))
console.log(`\n生成された配列の長さ: ${randomNotes.length}`)

const abcResultLong = makeABC(randomNotes)
console.log(abcResultLong)
