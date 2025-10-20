import Volume from './Volume'
import { playNote } from './etc/sound'

function Home () {
  return (
    <>
      <h2>チューニング</h2>
      <div className='tuning'>
        <button onClick={() => playNote('piano', 'A4')}>A4</button>
      </div>

      <h3>レギュラーチューニング</h3>
      <div className='tuning'>
        {['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map(note => (
          <button key={`id-${note}`} onClick={() => playNote('piano', note)}>
            {note}
          </button>
        ))}
      </div>

      <h3>ハーフダウンチューニング</h3>
      <div className='tuning'>
        {['Eb2', 'Ab2', 'C#3', 'F#3', 'Bb3', 'Eb4'].map(note => (
          <button key={`id-${note}`} onClick={() => playNote('piano', note)}>
            {note}
          </button>
        ))}
      </div>

      <div className='controls-panel'>
        <Volume />
      </div>
    </>
  )
}

export default Home
