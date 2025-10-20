import { Range, playNote } from './etc/sound'

function Home () {
  return (
    <>
      <h1>Home</h1>
      <h2>ピアノ</h2>
      <div>
        {Range.map(note => (
          <button key={`piano-${note}`} onClick={() => playNote('piano', note)}>
            {note}
          </button>
        ))}
      </div>

      <h2>ギター</h2>
      <div>
        {Range.map(note => (
          <button
            key={`guitar-${note}`}
            onClick={() => playNote('bass', note)}
          >
            {note}
          </button>
        ))}
      </div>
    </>
  )
}

export default Home
