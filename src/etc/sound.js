// 一般的な88鍵盤のグランドピアノの音域
export const Range = [
  'A0',
  'Bb0',
  'B0',
  'C1',
  'C#1',
  'D1',
  'Eb1',
  'E1', // ベースの4弦の開放弦
  'F1',
  'F#1',
  'G1',
  'Ab1',
  'A1',
  'Bb1',
  'B1',
  'C2',
  'C#2',
  'D2',
  'Eb2',
  'E2', // ギターの6弦の開放弦
  'F2',
  'F#2',
  'G2',
  'Ab2',
  'A2',
  'Bb2',
  'B2',
  'C3',
  'C#3',
  'D3',
  'Eb3',
  'E3',
  'F3',
  'F#3',
  'G3',
  'Ab3',
  'A3',
  'Bb3',
  'B3',
  'C4',
  'C#4',
  'D4',
  'Eb4',
  'E4',
  'F4',
  'F#4',
  'G4',
  'Ab4',
  'A4',
  'Bb4',
  'B4',
  'C5',
  'C#5',
  'D5',
  'Eb5',
  'E5',
  'F5',
  'F#5',
  'G5',
  'Ab5',
  'A5',
  'Bb5',
  'B5',
  'C6',
  'C#6',
  'D6', // ギターの1弦の22フレット
  'Eb6',
  'E6',
  'F6',
  'F#6',
  'G6',
  'Ab6',
  'A6',
  'Bb6',
  'B6',
  'C7',
  'C#7',
  'D7',
  'Eb7',
  'E7',
  'F7',
  'F#7',
  'G7',
  'Ab7',
  'A7',
  'Bb7',
  'B7',
  'C8'
]

// ------------------------------------
// 音源情報を一元管理するオブジェクト
// ------------------------------------
/**
 * 楽器名、音源ファイルのパス、ピッチシフトの基準音をまとめたオブジェクト。
 * ここを編集するだけで、楽器の追加・変更ができます。
 *
 * @property {string} path - /public/sounds/ からのファイルパス
 * @property {string | null} pitch - ピッチシフトの基準となる音名 (例: "C4")。
 *                                  打楽器などピッチシフトしない場合は null を指定します。
 */
export const SoundSources = {
  // chordProgressionRules.js で使われている楽器名をキーにします
  piano: { path: 'piano_C4.wav', pitch: 'C4' },
  guitar: { path: 'Guitar-C4.wav', pitch: 'C4' },
  bass: { path: 'fingered-bass-guitar_C2.wav', pitch: 'C2' },

  // --- ドラム類（ピッチシフトなし） ---
  finger: { path: 'finger.wav', pitch: null },
  hihat: { path: 'hihat.wav', pitch: null },
  cymbal: { path: 'cymbal.wav', pitch: null },
  'bass-drum': { path: 'kick.wav', pitch: null },
  'snare-drum': { path: 'snare.wav', pitch: null }
}

// ------------------------------------
// 周波数計算
// ------------------------------------
const A4_FREQUENCY = 440
const SEMITONE_RATIO = Math.pow(2, 1 / 12)
const NOTE_TO_SEMITONE_OFFSET = {
  C: 0,
  'C#': 1,
  D: 2,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  G: 7,
  Ab: 8,
  A: 9,
  Bb: 10,
  B: 11
}

/**
 * 音名 (例: "C4") → 周波数(Hz)
 */
export function calculateFrequency (noteName) {
  const match = noteName.match(/([A-G][b#]?)([0-9])/)
  if (!match) {
    console.error('Invalid note format:', noteName)
    return 0
  }
  const [_, note, octaveStr] = match
  const octave = parseInt(octaveStr, 10)
  const semitonesFromC0 = octave * 12 + NOTE_TO_SEMITONE_OFFSET[note]
  const semitonesFromA4 = semitonesFromC0 - (4 * 12 + NOTE_TO_SEMITONE_OFFSET.A)
  return A4_FREQUENCY * Math.pow(SEMITONE_RATIO, semitonesFromA4)
}

// ------------------------------------
// AudioContextとバッファ管理
// ------------------------------------

let audioContext = null
let masterGainNode = null
const audioBuffers = {}

/**
 * AudioContextを取得または初期化します。
 * @returns {AudioContext | null}
 */
export function getAudioContext () {
  if (!audioContext) {
    // ユーザーインタラクションがないと初期化できない場合がある
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('AudioContext initialized.')
      masterGainNode = audioContext.createGain()
      masterGainNode.gain.value = 0.5
      masterGainNode.connect(audioContext.destination)
      console.log('Master Gain Node initialized.')
    } catch (e) {
      console.error('Could not initialize AudioContext:', e)
      return null
    }
  }
  return audioContext
}

/**
 * AudioContextを初期化します。ユーザーインタラクション後にのみ呼び出されるべきです。
 */
function initAudioContext () {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    console.log('AudioContext initialized.')
    masterGainNode = audioContext.createGain()
    masterGainNode.gain.value = 0.5
    masterGainNode.connect(audioContext.destination)
    console.log('Master Gain Node initialized with volume:', masterGainNode.gain.value)
  }
}

/**
 * 音声ファイルを読み込んでAudioBuffer化
 * @param {string} filename - `public/sounds/` 以下のファイル名 (例: "PianoA4.wav")
 */
async function loadSound (filename) {
  const url = `/sounds/${filename}`
  if (audioBuffers[url]) return audioBuffers[url]

  if (!audioContext) {
    console.error(
      'AudioContext is not initialized when attempting to load sound:',
      filename
    )
    return null
  }

  try {
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    audioBuffers[url] = audioBuffer
    console.log('Loaded:', filename)
    return audioBuffer
  } catch (error) {
    console.error(`Error loading sound file ${filename}:`, error)
    throw error
  }
}

/**
 * SoundSourcesオブジェクトに定義されたすべての音源を読み込む
 */
export async function loadAllSounds () {
  initAudioContext()
  try {
    const loadPromises = Object.values(SoundSources).map(source => loadSound(source.path))
    await Promise.all(loadPromises)
    console.log('All base sounds loaded.')
  } catch (err) {
    console.error('Error loading base sounds:', err)
  }
}

/**
 * 指定した時間に音を再生するようにスケジュールします。
 * @param {string} instrument - "piano", "bass" など SoundSources のキー名
 * @param {string | null} note - "C4" など。打楽器の場合は null
 * @param {number} when - AudioContextの絶対時間で、いつ再生を開始するか
 * @returns {AudioBufferSourceNode | null} 生成されたオーディオソースノード
 */
export function playScheduledNote (instrument, note, when) {
  const audioCtx = getAudioContext()
  if (!audioCtx || !masterGainNode) {
    console.warn('AudioContext not ready, cannot schedule note.')
    return null
  }

  const sourceInfo = SoundSources[instrument]
  if (!sourceInfo) {
    console.error('Unknown instrument:', instrument)
    return null
  }

  const url = `/sounds/${sourceInfo.path}`
  const buffer = audioBuffers[url]
  if (!buffer) {
    console.warn(`Buffer for ${instrument} not loaded yet. Cannot play.`)
    return null
  }

  const sourceNode = audioCtx.createBufferSource()
  sourceNode.buffer = buffer

  if (sourceInfo.pitch && note) {
    const baseFreq = calculateFrequency(sourceInfo.pitch)
    const targetFreq = calculateFrequency(note)
    if (baseFreq > 0 && targetFreq > 0) {
      sourceNode.playbackRate.value = targetFreq / baseFreq
    }
  }

  sourceNode.connect(masterGainNode)
  sourceNode.start(when)
  return sourceNode
}

/**
 * 音を再生
 * @param {string} instrument - "piano", "bass" など SoundSources のキー名
 * @param {string | null} note - "C4" など。打楽器の場合は null
 */
export async function playNote (instrument, note) {
  initAudioContext()

  if (!audioContext || !masterGainNode) {
    console.warn('AudioContext or Master Gain Node not initialized, cannot play note.')
    return
  }

  // SoundSourcesオブジェクトから楽器の情報を取得
  const sourceInfo = SoundSources[instrument]
  if (!sourceInfo) {
    console.error('Unknown instrument:', instrument)
    return
  }

  const { path, pitch: basePitch } = sourceInfo
  const url = `/sounds/${path}`
  let buffer = audioBuffers[url]

  if (!buffer) {
    console.log(`Sound buffer for ${path} not found, attempting to load dynamically...`)
    try {
      buffer = await loadSound(path)
    } catch (error) {
      console.error(
        `Failed to dynamically load sound for ${instrument} (${note}):`,
        error
      )
      return
    }
  }

  if (!buffer) {
    console.warn(
      `Sound buffer for ${instrument} (${note}) is still not available after attempt to load.`
    )
    return
  }

  const source = audioContext.createBufferSource()
  source.buffer = buffer

  // ピッチ（音の高さ）を調整
  if (basePitch && note) {
    // 基準音があり、再生する音の指定もある場合（ピアノ、ベースなど）
    const baseFreq = calculateFrequency(basePitch)
    const targetFreq = calculateFrequency(note)
    source.playbackRate.value = targetFreq / baseFreq
  } else {
    // 打楽器など、音の高さを変えない場合
    source.playbackRate.value = 1.0
  }

  source.connect(masterGainNode)
  source.start(0)
}

/**
 * マスター音量を設定します。
 * @param {number} volume - 0.0 (ミュート) から 1.0 (最大音量) までの値。
 */
export function setMasterVolume (volume) {
  if (masterGainNode) {
    masterGainNode.gain.value = volume
    // console.log('Master volume set to:', volume)
  } else {
    console.warn('Master Gain Node not initialized. Cannot set volume.')
  }
}

/**
 * 現在のマスター音量を取得します。
 * @returns {number} 現在の音量 (0.0 - 1.0)。未初期化の場合は 0.5 を返します。
 */
export function getMasterVolume () {
  if (masterGainNode) {
    return masterGainNode.gain.value
  }
  return 0.5
}
