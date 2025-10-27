//
// ユーザーが入力するデータ
//

/**
 * 楽曲の1小節を表すクラス
 */
export class Measure {
  /**
   * @param {number} numerator - 拍子記号の分子 (例: 4/4拍子の「4」)
   * @param {number} denominator - 拍子記号の分母 (例: 4/4拍子の「4」)
   * @param {string[]} [chords=[]] - この小節に含まれるコード名の配列 (例: ["CM7", "G7"])
   */
  constructor (numerator, denominator, chords = []) {
    this.numerator = numerator
    this.denominator = denominator
    this.chords = chords
  }
}

/**
 * コード進行全体を管理する、ユーザー入力の元となるクラス
 */
export class ChordProgression {
  /**
   * @param {string} title - 曲のタイトル
   * @param {number} tempo - 曲のテンポ (BPM)
   * @param {Measure[]} [measures=[]] - このコード進行を構成するMeasureオブジェクトの配列
   */
  constructor (title, tempo, measures = []) {
    this.title = title
    this.tempo = tempo
    this.measures = measures
  }
}

//
// 以下は、ChordProgressionクラスから、再生しやすいようにプログラムで作成する
//

/**
 * 単一の音符イベントを表すクラス
 */
export class Note {
  /**
   * @param {number} startTime - 曲のセクション内での再生開始時間（秒）
   * @param {number} duration - 音の長さ（秒）
   * @param {string | null} pitch - 音の高さ（例: "C4", "F#5"）。打楽器など音高がない場合はnull。
   * @param {number} [velocity=1.0] - 音の強さ (0.0から1.0)
   */
  constructor (startTime, duration, pitch, velocity = 1.0) {
    this.startTime = startTime
    this.duration = duration
    this.pitch = pitch
    this.velocity = velocity
  }
}

/**
 * 単一の楽器トラックを表すクラス
 */
export class Track {
  /**
   * @param {string} instrument - 楽器名（例: "piano", "bass", "hihat"）
   * @param {Note[]} notes - このトラックが演奏するNoteオブジェクトの配列
   */
  constructor (instrument, notes) {
    this.instrument = instrument
    this.notes = notes
  }
}

/**
 * 楽曲の一部分（カウントインやメインループなど）を構成するデータを持つクラス
 */
export class MusicData {
  /**
   * @param {number} tempo - このセクションのテンポ（BPM）
   * @param {number} duration - このセクションの全長（秒）
   * @param {Track[]} tracks - このセクションに含まれるTrackオブジェクトの配列
   * @param {Array<{index: number, startTime: number}>} [measureTimings=[]] - 各小節の開始時間情報
   */
  constructor (tempo, duration, tracks, measureTimings = []) {
    this.tempo = tempo
    this.duration = duration
    this.tracks = tracks
    this.measureTimings = measureTimings
  }
}

/**
 * 再生に必要な全てのシーケンス情報をまとめるクラス
 */
export class PlayableSequence {
  /**
   * @param {MusicData} mainLoopData - メインループ部分の楽曲データ
   * @param {MusicData | null} countInData - カウントイン部分の楽曲データ。カウントインがない場合はnull。
   */
  constructor (mainLoopData, countInData) {
    this.mainLoopData = mainLoopData
    this.countInData = countInData
  }
}
