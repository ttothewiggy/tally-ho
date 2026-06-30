import { useEffect, useState } from 'react'
import './App.css'

const activities = [
  {
    id: 'spanish',
    name: 'Spanish',
    description: 'One tiny bit of practice.',
  },
  {
    id: 'stretch',
    name: 'Stretch',
    description: 'Loosen up for a minute.',
  },
  {
    id: 'walk',
    name: 'Walk',
    description: 'Step outside and move.',
  },
  {
    id: 'read',
    name: 'Read',
    description: 'A page is enough.',
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Make one small thing better.',
  },
  {
    id: 'life-admin',
    name: 'Life admin',
    description: 'Clear one nagging task.',
  },
  {
    id: 'surf-fitness',
    name: 'Surf fitness',
    description: 'Something for paddling, pop-ups, or mobility.',
  },
  {
    id: 'chores',
    name: 'Chores',
    description: 'Reset the space a little.',
  },
]

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA')
}

function App() {
  const todayKey = getTodayKey()

  const [activityLog, setActivityLog] = useState(() => {
    const savedActivityLog = localStorage.getItem('tally-ho-activity-log')

    if (savedActivityLog) {
      return JSON.parse(savedActivityLog)
    }

    return {}
  })

  useEffect(() => {
    localStorage.setItem('tally-ho-activity-log', JSON.stringify(activityLog))
  }, [activityLog])

  const todayActivity = activityLog[todayKey] || {}

  const totalCount = Object.values(todayActivity).reduce(
    (total, activity) => total + activity.count,
    0
  )

  function incrementTally(activityId) {
    setActivityLog((currentLog) => {
      const currentDay = currentLog[todayKey] || {}
      const currentActivity = currentDay[activityId] || {
        count: 0,
        minutes: 0,
      }

      return {
        ...currentLog,
        [todayKey]: {
          ...currentDay,
          [activityId]: {
            ...currentActivity,
            count: currentActivity.count + 1,
          },
        },
      }
    })
  }

  function resetToday() {
    setActivityLog((currentLog) => ({
      ...currentLog,
      [todayKey]: {},
    }))
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

        <button className="reset-button" onClick={resetToday}>
          Reset today
        </button>
      </section>

      <section className="tally-grid" aria-label="Tally buttons">
        {activities.map((activity) => {
          const count = todayActivity[activity.id]?.count || 0

          return (
            <button
              key={activity.id}
              className="tally-card"
              onClick={() => incrementTally(activity.id)}
            >
              <span className="tally-copy">
                <span className="tally-name">{activity.name}</span>
                <span className="tally-description">{activity.description}</span>
              </span>

              <span className="tally-count">{count}</span>
            </button>
          )
        })}
      </section>
    </main>
  )
}

export default App