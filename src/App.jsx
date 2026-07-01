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

function getMonthDays(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const currentDate = new Date(year, month, day)
    const dateKey = currentDate.toLocaleDateString('en-CA')

    return {
      day,
      dateKey,
    }
  })
}

function getDayTotals(dayActivity = {}) {
  return Object.values(dayActivity).reduce(
    (totals, activity) => {
      return {
        count: totals.count + activity.count,
        minutes: totals.minutes + activity.minutes,
      }
    },
    {
      count: 0,
      minutes: 0,
    }
  )
}

function getMonthLabel(date) {
  return date.toLocaleDateString('en-NZ', {
    month: 'long',
    year: 'numeric',
  })
}

function App() {
  const todayKey = getTodayKey()
  const [visibleMonth, setVisibleMonth] = useState(new Date())

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

  const totalMinutes = Object.values(todayActivity).reduce(
    (total, activity) => total + activity.minutes,
    0
  )

  const monthDays = getMonthDays(visibleMonth)
  const visibleMonthLabel = getMonthLabel(visibleMonth)

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

  function addMinutes(activityId, minutesToAdd) {
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
            minutes: currentActivity.minutes + minutesToAdd,
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

  function goToPreviousMonth() {
    setVisibleMonth((currentMonth) => {
      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    })
  }

  function goToNextMonth() {
    setVisibleMonth((currentMonth) => {
      return new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    })
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
        <div className="summary-stats">
          <div>
            <p className="summary-label">Today’s tallies</p>
            <p className="summary-number">{totalCount}</p>
          </div>

          <div>
            <p className="summary-label">Productive minutes</p>
            <p className="summary-number">{totalMinutes}</p>
          </div>
        </div>

        <button className="reset-button" onClick={resetToday}>
          Reset today
        </button>
      </section>

      <section className="tally-grid" aria-label="Tally buttons">
        {activities.map((activity) => {
          const count = todayActivity[activity.id]?.count || 0
          const minutes = todayActivity[activity.id]?.minutes || 0

          return (
            <article key={activity.id} className="tally-card">
              <div className="tally-copy">
                <span className="tally-name">{activity.name}</span>
                <span className="tally-description">
                  {activity.description}
                </span>
              </div>

              <div className="tally-stats">
                <span className="tally-count">{count}</span>
                <span className="tally-minutes">{minutes} min</span>
              </div>

              <div className="tally-actions">
                <button
                  className="task-button"
                  onClick={() => incrementTally(activity.id)}
                >
                  Tick task
                </button>

                <div className="time-buttons">
                  <button onClick={() => addMinutes(activity.id, 5)}>
                    +5 min
                  </button>
                  <button onClick={() => addMinutes(activity.id, 10)}>
                    +10 min
                  </button>
                  <button onClick={() => addMinutes(activity.id, 25)}>
                    +25 min
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="calendar-section">
        <div className="calendar-header">
          <div>
            <p className="summary-label">History</p>
            <h2>{visibleMonthLabel}</h2>
          </div>

          <div className="calendar-nav">
            <button onClick={goToPreviousMonth}>Previous</button>
            <button onClick={goToNextMonth}>Next</button>
          </div>
        </div>

        <div className="calendar-grid" aria-label="Monthly activity history">
          {monthDays.map((day) => {
            const dayActivity = activityLog[day.dateKey] || {}
            const dayTotals = getDayTotals(dayActivity)
            const isToday = day.dateKey === todayKey
            const hasActivity = dayTotals.count > 0 || dayTotals.minutes > 0

            return (
              <article
                key={day.dateKey}
                className={`calendar-day ${
                  isToday ? 'calendar-day-today' : ''
                }`}
              >
                <span className="calendar-day-number">{day.day}</span>

                {hasActivity ? (
                  <div className="calendar-day-stats">
                    <span>{dayTotals.count} tasks</span>
                    <span>{dayTotals.minutes} min</span>
                  </div>
                ) : (
                  <span className="calendar-empty">No activity</span>
                )}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

export default App