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
  promptDraft,
  promptHistory,
  selectedHistoryEntry,
  isGeneratingPrompt,
  promptStatus,
  onPromptDraftChange,
  onGeneratePrompt,
  onSelectHistoryEntry,
}) {
  const firstName = (profile.fullName || 'there').trim().split(' ')[0]

  const handleSubmit = (event) => {
    event.preventDefault()
    onGeneratePrompt()
  }

  const selectedTimestamp = selectedHistoryEntry?.createdAt
    ? new Date(selectedHistoryEntry.createdAt).toLocaleString()
    : ''

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
            id="workspace-prompt"
            type="text"
            placeholder="Ask SproutOS"
            value={promptDraft}
            onChange={(event) => onPromptDraftChange(event.target.value)}
          />
          <button
            type="submit"
            className="workspace-task-submit"
            disabled={isGeneratingPrompt || !promptDraft.trim()}
          >
            {isGeneratingPrompt ? '...' : 'Send'}
          </button>
        </div>
      </form>

      <div className="workspace-suggestion-row">
        {QUICK_STARTS.map((item) => (
          <button
            key={item}
            type="button"
            className="workspace-suggestion-chip"
            onClick={() => onPromptDraftChange(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {promptStatus.message ? (
        <div className="workspace-task-status">
          <StatusBanner status={promptStatus} />
        </div>
      ) : null}

      {selectedHistoryEntry ? (
        <section className="workspace-inline-output">
          <div className="workspace-inline-output-head">
            <span>Generated output</span>
            {selectedTimestamp ? <small>{selectedTimestamp}</small> : null}
          </div>

          <div className="workspace-inline-output-body">
            {selectedHistoryEntry.response}
          </div>
        </section>
      ) : promptHistory.length === 0 ? (
        <section className="workspace-inline-output workspace-inline-output-empty">
          <div className="workspace-inline-output-head">
            <span>Generated output</span>
          </div>

          <div className="workspace-inline-output-body">
            Your generated response will appear here after you send a prompt.
          </div>
        </section>
      ) : null}
    </section>
  )
}

export default WorkspaceHomePanel
