import { useEffect, useState } from 'react'
import './App.css'

const initialTallies = [
  {
    id: 1,
    name: 'Spanish',
    description: 'One tiny bit of practice.',
    count: 0,
  },
  {
    id: 2,
    name: 'Stretch',
    description: 'Loosen up for a minute.',
    count: 0,
  },
  {
    id: 3,
    name: 'Walk',
    description: 'Step outside and move.',
    count: 0,
  },
  {
    id: 4,
    name: 'Read',
    description: 'A page is enough.',
    count: 0,
  },
  {
    id: 5,
    name: 'Code',
    description: 'Make one small thing better.',
    count: 0,
  },
  {
    id: 6,
    name: 'Life admin',
    description: 'Clear one nagging task.',
    count: 0,
  },
  {
    id: 7,
    name: 'Surf fitness',
    description: 'Something for paddling, pop-ups, or mobility.',
    count: 0,
  },
  {
    id: 8,
    name: 'Chores',
    description: 'Reset the space a little.',
    count: 0,
  },
]

function App() {
  const [tallies, setTallies] = useState(() => {
  const savedTallies = localStorage.getItem('tally-ho-tallies')

  if (savedTallies) {
    return JSON.parse(savedTallies)
  }

  return initialTallies
})

  useEffect(() => {
    localStorage.setItem('tally-ho-tallies', JSON.stringify(tallies))
  }, [tallies])

  const totalCount = tallies.reduce((total, tally) => total + tally.count, 0)

  function incrementTally(id) {
    setTallies((currentTallies) =>
      currentTallies.map((tally) =>
        tally.id === id
          ? { ...tally, count: tally.count + 1 }
          : tally
      )
    )
  }

  function resetTallies() {
    setTallies((currentTallies) =>
      currentTallies.map((tally) => ({
        ...tally,
        count: 0,
      }))
    )
  }

  return (
    <main className="app">
      <section className="hero">
        <p className="eyebrow">Tally-Ho</p>
        <h1>Count the better pick.</h1>
        <p className="subtitle">
          A quiet little counter for the things you chose instead.
        </p>
      </section>

      <section className="summary-card">
        <div>
          <p className="summary-label">Today’s total</p>
          <p className="summary-number">{totalCount}</p>
        </div>

        <button className="reset-button" onClick={resetTallies}>
          Reset
        </button>
      </section>

      <section className="tally-grid" aria-label="Tally buttons">
        {tallies.map((tally) => (
          <button
          key={tally.id}
          className="tally-card"
          onClick={() => incrementTally(tally.id)}
        >
          <span className="tally-copy">
            <span className="tally-name">{tally.name}</span>
            <span className="tally-description">{tally.description}</span>
          </span>
        
          <span className="tally-count">{tally.count}</span>
        </button>
        ))}
      </section>
    </main>
  )
}

export default App