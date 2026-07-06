import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
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

function getMonthDateRange(date) {
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1).toLocaleDateString('en-CA')
  const lastDay = new Date(year, month + 1, 0).toLocaleDateString('en-CA')

  return {
    firstDay,
    lastDay,
  }
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

function buildActivityLogFromRows(rows) {
  return rows.reduce((log, row) => {
    const currentDay = log[row.date_key] || {}

    return {
      ...log,
      [row.date_key]: {
        ...currentDay,
        [row.activity_id]: {
          count: row.count,
          minutes: row.minutes,
        },
      },
    }
  }, {})
}

function App() {
  const todayKey = getTodayKey()
  const [visibleMonth, setVisibleMonth] = useState(new Date())
  const [activityLog, setActivityLog] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

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

  useEffect(() => {
    loadMonthActivity()
  }, [visibleMonth])

  async function loadMonthActivity() {
    setIsLoading(true)
    setErrorMessage('')

    const { firstDay, lastDay } = getMonthDateRange(visibleMonth)

    const { data, error } = await supabase
      .from('activity_log')
      .select('date_key, activity_id, count, minutes')
      .gte('date_key', firstDay)
      .lte('date_key', lastDay)

    if (error) {
      console.error(error)
      setErrorMessage('Could not load activity from Supabase.')
      setIsLoading(false)
      return
    }

    setActivityLog(buildActivityLogFromRows(data))
    setIsLoading(false)
  }

  async function saveActivityUpdate(activityId, newActivity) {
    const { error } = await supabase
      .from('activity_log')
      .upsert(
        {
          date_key: todayKey,
          activity_id: activityId,
          count: newActivity.count,
          minutes: newActivity.minutes,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'date_key,activity_id',
        }
      )

    if (error) {
      console.error(error)
      setErrorMessage('That update did not save to Supabase.')
      await loadMonthActivity()
    }
  }

  function incrementTally(activityId) {
    const currentDay = activityLog[todayKey] || {}
    const currentActivity = currentDay[activityId] || {
      count: 0,
      minutes: 0,
    }

    const newActivity = {
      ...currentActivity,
      count: currentActivity.count + 1,
    }

    setActivityLog((currentLog) => ({
      ...currentLog,
      [todayKey]: {
        ...currentDay,
        [activityId]: newActivity,
      },
    }))

    saveActivityUpdate(activityId, newActivity)
  }

  function addMinutes(activityId, minutesToAdd) {
    const currentDay = activityLog[todayKey] || {}
    const currentActivity = currentDay[activityId] || {
      count: 0,
      minutes: 0,
    }

    const newActivity = {
      ...currentActivity,
      minutes: currentActivity.minutes + minutesToAdd,
    }

    setActivityLog((currentLog) => ({
      ...currentLog,
      [todayKey]: {
        ...currentDay,
        [activityId]: newActivity,
      },
    }))

    saveActivityUpdate(activityId, newActivity)
  }

  async function resetToday() {
    setActivityLog((currentLog) => ({
      ...currentLog,
      [todayKey]: {},
    }))

    const { error } = await supabase
      .from('activity_log')
      .delete()
      .eq('date_key', todayKey)

    if (error) {
      console.error(error)
      setErrorMessage('Could not reset today in Supabase.')
      await loadMonthActivity()
    }
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
            <p className="summary-number">
              {isLoading ? '...' : totalCount}
            </p>
          </div>

          <div>
            <p className="summary-label">Productive minutes</p>
            <p className="summary-number">
              {isLoading ? '...' : totalMinutes}
            </p>
          </div>
        </div>

        <button className="reset-button" onClick={resetToday}>
          Reset today
        </button>
      </section>

      {errorMessage && (
        <p className="error-message">{errorMessage}</p>
      )}

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