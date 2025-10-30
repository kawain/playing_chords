/**
 * フレットと弦の番号を描画します。
 * @param {Document} d - Documentオブジェクト
 * @param {SVGElement} e - SVG要素（fretboard_svg）
 */
function fretsStrings (d, e) {
  const coordinate = [
    [34, 30],
    [69, 30],
    [104, 30],
    [139, 30],
    [172, 30],
    [208, 30],
    [242, 30],
    [278, 30],
    [312, 30],
    [343, 30],
    [378, 30],
    [413, 30],
    [448, 30],
    [483, 30],
    [519, 30],
    [554, 30],
    [589, 30],
    [623, 30],
    [658, 30],
    [694, 30],
    [729, 30],
    [764, 30]
  ]

  const g = d.createElementNS('http://www.w3.org/2000/svg', 'g')
  g.setAttribute('font-family', 'sans-serif')
  g.setAttribute('font-size', '14')

  let fretNum = 1
  for (const coords of coordinate) {
    const text = d.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', coords[0].toString())
    text.setAttribute('y', coords[1].toString())
    text.setAttribute('fill', '#000')
    text.textContent = fretNum.toString()
    fretNum += 1
    g.appendChild(text)
  }
  e.appendChild(g)
}

/**
 * フレットボードの線を描画します。
 * @param {Document} d - Documentオブジェクト
 * @param {SVGElement} e - SVG要素（fretboard_svg）
 * @param {number} kind - 1: 横線 (弦), 2: 縦線 (フレット)
 */
function drawLine (d, e, kind) {
  let coordinate
  if (kind === 1) {
    // 弦 (横線)
    coordinate = [
      [20, 40, 790, 40, 1],
      [20, 60, 790, 60, 1],
      [20, 80, 790, 80, 1],
      [20, 100, 790, 100, 1],
      [20, 120, 790, 120, 1],
      [20, 140, 790, 140, 1]
    ]
  } else {
    // フレット (縦線)
    coordinate = [
      [20, 40, 20, 140, 3],
      [55, 40, 55, 140, 1],
      [90, 40, 90, 140, 1],
      [125, 40, 125, 140, 1],
      [160, 40, 160, 140, 1],
      [195, 40, 195, 140, 1],
      [230, 40, 230, 140, 1],
      [265, 40, 265, 140, 1],
      [300, 40, 300, 140, 1],
      [335, 40, 335, 140, 1],
      [370, 40, 370, 140, 1],
      [405, 40, 405, 140, 1],
      [440, 40, 440, 140, 1],
      [475, 40, 475, 140, 1],
      [510, 40, 510, 140, 1],
      [545, 40, 545, 140, 1],
      [580, 40, 580, 140, 1],
      [615, 40, 615, 140, 1],
      [650, 40, 650, 140, 1],
      [685, 40, 685, 140, 1],
      [720, 40, 720, 140, 1],
      [755, 40, 755, 140, 1],
      [790, 40, 790, 140, 1]
    ]
  }
  for (const coords of coordinate) {
    const line = d.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', coords[0].toString())
    line.setAttribute('y1', coords[1].toString())
    line.setAttribute('x2', coords[2].toString())
    line.setAttribute('y2', coords[3].toString())
    line.setAttribute('stroke', '#000')
    line.setAttribute('stroke-width', coords[4].toString())
    e.appendChild(line)
  }
}

/**
 * フレットボード上の丸印マークを描画します (3, 5, 7, 9, 12フレットなど)。
 * @param {Document} d - Documentオブジェクト
 * @param {SVGElement} e - SVG要素（fretboard_svg）
 */
function circleMark (d, e) {
  const coordinate = [
    [107, 90],
    [177, 90],
    [247, 90],
    [317, 90],
    [423, 70],
    [423, 110],
    [528, 90],
    [598, 90],
    [668, 90],
    [738, 90]
  ]
  for (const coords of coordinate) {
    const circle = d.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', coords[0].toString())
    circle.setAttribute('cy', coords[1].toString())
    circle.setAttribute('r', '5')
    circle.setAttribute('fill', '#444')
    e.appendChild(circle)
  }
}

/**
 * フレットポジション（音符を表示するための隠された丸とテキスト）を描画します。
 * @param {Document} d - Documentオブジェクト
 * @param {SVGElement} e - SVG要素（fretboard_svg）
 */
function fretPosition (d, e) {
  const cx = [38, 73, 108, 143, 178, 213, 248, 283, 318, 353, 388, 423, 458, 493, 528, 563, 598, 633, 668, 703, 738, 773]
  const cy = [40, 60, 80, 100, 120, 140]

  for (let stringIndex = 0; stringIndex < cy.length; stringIndex++) {
    for (let fretboardCxIndex = 0; fretboardCxIndex < cx.length; fretboardCxIndex++) {
      const group = d.createElementNS('http://www.w3.org/2000/svg', 'g')
      group.setAttribute('opacity', '0')
      group.classList.add('fret-position-group')
      group.setAttribute('data-string-index', stringIndex.toString())
      group.setAttribute('data-fretboard-cx-index', fretboardCxIndex.toString())

      const circle = d.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', cx[fretboardCxIndex].toString())
      circle.setAttribute('cy', cy[stringIndex].toString())
      circle.setAttribute('r', '8')
      circle.setAttribute('fill', 'red')
      group.appendChild(circle)

      const text = d.createElementNS('http://www.w3.org/2000/svg', 'text')
      text.setAttribute('x', cx[fretboardCxIndex].toString())
      text.setAttribute('y', cy[stringIndex].toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('dominant-baseline', 'middle')
      text.setAttribute('fill', 'white')
      text.classList.add('fret-position-text')
      text.setAttribute('font-size', '10')
      text.textContent = ''
      group.appendChild(text)

      e.appendChild(group)
    }
  }
}

/**
 * 特定のフレットポジションに音名を表示します。
 * @param {number} stringIndex
 * @param {number} fretboardCxIndex
 * @param {string} noteName
 * @param {string} circleColor
 * @param {string} textColor
 * @param {SVGElement} targetSvgElement
 */
function showFretMark (stringIndex, fretboardCxIndex, noteName, circleColor = 'blue', textColor = 'white', targetSvgElement) {
  const group = targetSvgElement.querySelector(`g[data-string-index="${stringIndex}"][data-fretboard-cx-index="${fretboardCxIndex}"]`)

  if (group) {
    group.setAttribute('opacity', '1')

    const circle = group.querySelector('circle')
    if (circle) {
      circle.setAttribute('fill', circleColor)
    }

    const textElement = group.querySelector('text')
    if (textElement) {
      textElement.textContent = noteName
      textElement.setAttribute('fill', textColor)
    }
  } else {
    console.warn(`要素グループが見つかりません。stringIndex: ${stringIndex}, fretboardCxIndex: ${fretboardCxIndex}`)
  }
}

/**
 * 特定のフレットポジションの音名表示を非表示にします。
 * @param {number} stringIndex
 * @param {number} fretboardCxIndex
 * @param {SVGElement} targetSvgElement
 */
function hideFretMark (stringIndex, fretboardCxIndex, targetSvgElement) {
  const group = targetSvgElement.querySelector(`g[data-string-index="${stringIndex}"][data-fretboard-cx-index="${fretboardCxIndex}"]`)
  if (group) {
    group.setAttribute('opacity', '0')
  } else {
    console.warn(`要素グループが見つかりません。stringIndex: ${stringIndex}, fretboardCxIndex: ${fretboardCxIndex}`)
  }
}

/**
 * フレットボードのSVGを初期化し描画します。
 * @param {SVGElement} fretboardSvg - SVG要素
 */
function initFretboardSvg (fretboardSvg) {
  if (!fretboardSvg) {
    console.error('描画対象のSVG要素が見つかりません。')
    return
  }

  fretboardSvg.innerHTML = ''

  const gTitle = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  gTitle.setAttribute('font-family', 'sans-serif')
  gTitle.setAttribute('font-size', '24')

  const textTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textTitle.setAttribute('x', '10')
  textTitle.setAttribute('y', '30')
  textTitle.setAttribute('fill', '#222')
  textTitle.setAttribute('id', 'svg_title')
  gTitle.appendChild(textTitle)
  fretboardSvg.appendChild(gTitle)

  fretsStrings(document, fretboardSvg)
  drawLine(document, fretboardSvg, 1) // 横線 (弦)
  drawLine(document, fretboardSvg, 2) // 縦線 (フレット)
  circleMark(document, fretboardSvg)
  fretPosition(document, fretboardSvg) // 音符表示用の丸とテキスト
}

export { initFretboardSvg, showFretMark, hideFretMark }
