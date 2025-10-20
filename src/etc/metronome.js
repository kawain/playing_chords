import { getAudioContext, playScheduledNote } from './sound'

// --- モジュールレベルの変数で状態を管理 ---
let timerID = null // setTimeoutのID
let nextNoteTime = 0.0 // 次のノートが再生されるべき時間
let currentBeat = 0 // 現在の拍（UI更新用）

// --- 定数 ---
const scheduleAheadTime = 0.1 // 秒単位。どれだけ先までスケジュールを予約するか
const schedulerFrequency = 25.0 // ミリ秒単位。スケジューラをどれくらいの頻度で呼び出すか

/**
 * 次に再生すべきノートをスケジュールする内部関数
 * @param {number} tempo - BPM
 * @param {string} sound - 音源名
 * @param {function} onBeat - 1拍ごとにUIを更新するためのコールバック
 */
function scheduler (tempo, sound, onBeat) {
  const audioCtx = getAudioContext()
  if (!audioCtx) return

  // 現在の時間 + 先読み時間よりも前にスケジュールされるべきノートがあるかチェックし、あればスケジュールする
  while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
    // onBeatコールバックを呼び出してUIを更新
    onBeat(currentBeat)

    // 音の再生をスケジュール
    playScheduledNote(sound, null, nextNoteTime)

    // 次のノートの時間と拍を更新
    const secondsPerBeat = 60.0 / tempo
    nextNoteTime += secondsPerBeat
    currentBeat++
  }

  // 次のスケジューリングを設定
  timerID = window.setTimeout(
    () => scheduler(tempo, sound, onBeat),
    schedulerFrequency
  )
}

/**
 * メトロノームを開始する
 * @param {number} tempo - BPM
 * @param {string} sound - SoundSourcesのキー名
 * @param {function} onBeat - 1拍ごとに呼び出されるコールバック関数
 */
export function startMetronome (tempo, sound, onBeat) {
  const audioCtx = getAudioContext()
  if (!audioCtx) {
    console.error('AudioContext has not been initialized.')
    return
  }

  // ユーザーの操作によって中断されたAudioContextを再開
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  currentBeat = 0
  // 少し未来から開始することで、初回実行時の遅延を防ぐ
  nextNoteTime = audioCtx.currentTime + 0.1
  scheduler(tempo, sound, onBeat)
}

/**
 * メトロノームを停止する
 */
export function stopMetronome () {
  if (timerID) {
    window.clearTimeout(timerID)
    timerID = null
  }
}
