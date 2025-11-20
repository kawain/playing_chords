import { useState, useEffect } from 'react'

const shuffleArray = array => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function Quiz () {
  // すべてのクイズデータを保持するステート
  const [allQuizzes, setAllQuizzes] = useState([])
  // 現在のクイズのインデックスを保持するステート
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  // ユーザーが選択した回答を保持するステート
  const [selectedAnswer, setSelectedAnswer] = useState('')
  // 回答が送信されたかどうかを判定するステート
  const [isAnswered, setIsAnswered] = useState(false)
  // 正解かどうかを判定するステート
  const [isCorrect, setIsCorrect] = useState(false)
  // クイズが開始されたかどうかを判定するステート
  const [isQuizStarted, setIsQuizStarted] = useState(false)
  // データの読み込み状態を管理するステート
  const [isLoading, setIsLoading] = useState(true)
  // 現在の問題のシャッフルされた選択肢を保持するステート
  const [shuffledChoices, setShuffledChoices] = useState([])
  // 試行数を管理するステート
  const [trials, setTrials] = useState(0)
  // 正解数を管理するステート
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const fetchQuizzes = async () => {
      try {
        const response = await fetch('./qa.json', { signal })
        const data = await response.json()
        setAllQuizzes(shuffleArray(data))
        setIsLoading(false)
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted')
        } else {
          console.error('クイズデータの読み込みに失敗しました。', error)
          setIsLoading(false)
        }
      }
    }

    fetchQuizzes()

    return () => {
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (allQuizzes.length > 0 && isQuizStarted) {
      setShuffledChoices(shuffleArray(allQuizzes[currentQuizIndex].choices))
    }
  }, [currentQuizIndex, allQuizzes, isQuizStarted])

  const handleStartQuiz = () => {
    setIsQuizStarted(true)
  }

  const handleSelectAnswer = e => {
    setSelectedAnswer(e.target.value)
  }

  const handleSubmit = () => {
    if (!selectedAnswer) {
      alert('回答を選択してください。')
      return
    }

    // 試行回数を1増やす
    setTrials(prevTrials => prevTrials + 1)
    const currentQuiz = allQuizzes[currentQuizIndex]
    if (selectedAnswer === currentQuiz.correct) {
      // 正解だった場合、正解数を1増やす
      setCorrectCount(prevCorrectCount => prevCorrectCount + 1)
      setIsCorrect(true)
    } else {
      setIsCorrect(false)
    }

    setIsAnswered(true)
  }

  const handleNextQuestion = () => {
    const nextIndex = (currentQuizIndex + 1) % allQuizzes.length
    setCurrentQuizIndex(nextIndex)
    setSelectedAnswer('')
    setIsAnswered(false)
    setIsCorrect(false)
  }

  const currentQuiz = isQuizStarted && allQuizzes.length > 0 ? allQuizzes[currentQuizIndex] : null

  // 正解率を計算（試行回数が0の場合は0を返す）
  const accuracy = trials > 0 ? ((correctCount / trials) * 100).toFixed(1) : 0

  return (
    <div className='quiz-area'>
      <h3>クイズ</h3>
      {!isQuizStarted ? (
        <button onClick={handleStartQuiz} disabled={isLoading}>
          {isLoading ? '準備中...' : '問題'}
        </button>
      ) : currentQuiz ? (
        <div>
          <h4>
            <span>{currentQuiz.question}</span>
          </h4>
          <div className='choices'>
            {shuffledChoices.map((choice, index) => (
              <div key={index} className='choice'>
                <input
                  type='radio'
                  id={`choice-${index}`}
                  name='quiz'
                  value={choice}
                  onChange={handleSelectAnswer}
                  checked={selectedAnswer === choice}
                  disabled={isAnswered}
                />
                <label htmlFor={`choice-${index}`}>{choice}</label>
              </div>
            ))}
          </div>
          {!isAnswered ? (
            <button onClick={handleSubmit}>回答</button>
          ) : (
            <div>
              <p className={isCorrect ? 'correct' : 'incorrect'}>
                {isCorrect ? `正解！` : `不正解！ 正解は「${currentQuiz.correct}」です。`}
              </p>

              <div className='quiz-stats'>
                <p>
                  正解率: {accuracy}% (正解: {correctCount} / 試行: {trials})
                </p>
              </div>

              <div className='next'>
                <button onClick={handleNextQuestion}>次の問題</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p>クイズデータがありません。</p>
      )}
    </div>
  )
}

export default Quiz
