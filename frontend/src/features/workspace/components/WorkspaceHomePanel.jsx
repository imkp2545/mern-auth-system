import StatusBanner from '../../auth/components/StatusBanner'

const QUICK_STARTS = [
  'Create image',
  'Explore cricket',
  'Create music',
  'Boost my day',
  'Write anything',
  'Help me learn',
]

function WorkspaceHomePanel({
  profile,
  draftTask,
  isCreatingTask,
  taskStatus,
  onDraftChange,
  onCreateTask,
}) {
  const firstName = (profile.fullName || 'there').trim().split(' ')[0]

  const handleSubmit = (event) => {
    event.preventDefault()
    onCreateTask()
  }

  return (
    <section className="workspace-home-panel">
      <div className="workspace-home-hero">
        <p className="workspace-home-greeting">Hi {firstName}</p>
        <h1>Where should we start?</h1>
      </div>

      <form className="workspace-task-composer" onSubmit={handleSubmit}>
        <div className="workspace-task-input-wrap">
          <span className="workspace-task-plus">+</span>
          <input
            type="text"
            placeholder="Ask SproutOS"
            value={draftTask}
            onChange={(event) => onDraftChange(event.target.value)}
          />
          <button
            type="submit"
            className="workspace-task-submit"
            disabled={isCreatingTask || !draftTask.trim()}
          >
            {isCreatingTask ? '...' : 'Send'}
          </button>
        </div>
      </form>

      <div className="workspace-suggestion-row">
        {QUICK_STARTS.map((item) => (
          <button
            key={item}
            type="button"
            className="workspace-suggestion-chip"
            onClick={() => onDraftChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {taskStatus.message ? (
        <div className="workspace-task-status">
          <StatusBanner status={taskStatus} />
        </div>
      ) : null}
    </section>
  )
}

export default WorkspaceHomePanel
