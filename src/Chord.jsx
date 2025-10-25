import ChordDiagram from './ChordDiagram'
import { allChords } from './etc/chordForm'

function Code () {
  return (
    <>
      <h1>コードポジション</h1>
      <p className='center'>C 以外はルートの位置をずらして読み替えてください。</p>
      <div className='code-position-container'>
        {allChords.map((chordType, i1) => (
          <section key={i1}>
            <h2>{chordType.name}</h2>
            <div className='code-position'>
              {chordType.chords.map((chordData, i2) => (
                <div key={i2}>
                  <h3>{chordData.name}</h3>
                  <ChordDiagram configure={chordData.configure} chord={chordData.chord} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

export default Code
