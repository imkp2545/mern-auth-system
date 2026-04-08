import { useEffect, useMemo, useRef } from 'react'
import StatusBanner from '../../auth/components/StatusBanner'

const QUICK_STARTS = [
  'Create image of Indian flag',
  'Explain recursion with example',
  'Make a 3-day study plan',
  'Write a short motivational message',
]

const IMAGE_URL_REGEX =
  /^https?:\/\/.+\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i
const IMAGE_DATA_URL_REGEX = /^data:image\/[a-zA-Z0-9.+-]+;base64,/

function normalizeMessageImages(entry) {
  const responseText =
    typeof entry?.response === 'string' ? entry.response.trim() : ''
  const images = Array.isArray(entry?.images) ? [...entry.images] : []

  if (responseText && (IMAGE_DATA_URL_REGEX.test(responseText) || IMAGE_URL_REGEX.test(responseText))) {
    if (!images.includes(responseText)) {
      images.unshift(responseText)
    }
  }

  return images.filter(Boolean)
}

function resolveMessageText(entry) {
  const responseText =
    typeof entry?.response === 'string' ? entry.response.trim() : ''

  if (IMAGE_DATA_URL_REGEX.test(responseText) || IMAGE_URL_REGEX.test(responseText)) {
    return ''
  }

  return responseText
}

function WorkspaceHomePanel({
  profile,
  promptDraft,
  promptHistory,
  pendingPrompt,
  selectedHistoryEntry,
  isGeneratingPrompt,
  promptStatus,
  onPromptDraftChange,
  onGeneratePrompt,
  onSelectHistoryEntry,
}) {
  const firstName = (profile.fullName || 'there').trim().split(' ')[0]
  const chatScrollRef = useRef(null)

  const timeline = useMemo(() => {
    const chronological = [...promptHistory].reverse()
    return pendingPrompt ? [...chronological, pendingPrompt] : chronological
  }, [promptHistory, pendingPrompt])

  useEffect(() => {
    if (!chatScrollRef.current) {
      return
    }

    chatScrollRef.current.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [timeline.length, isGeneratingPrompt])

  const handleSubmit = (event) => {
    event.preventDefault()
    onGeneratePrompt()
  }

  return (
    <section className="workspace-chat-panel">
      <div className="workspace-chat-hero">
        <p>Hi {firstName}</p>
        <h1>How can I help today?</h1>
      </div>

      <section className="workspace-chat-thread" ref={chatScrollRef}>
        {timeline.length === 0 ? (
          <div className="workspace-chat-empty">
            <h2>Start your first prompt</h2>
            <p>
              Ask anything, or request an image. Your conversation will appear
              here like a chat.
            </p>
          </div>
        ) : (
          timeline.map((entry) => {
            const messageImages = normalizeMessageImages(entry)
            const messageText = resolveMessageText(entry)
            const createdAtLabel = entry?.createdAt
              ? new Date(entry.createdAt).toLocaleString()
              : ''
            const canSelect = !entry?.isPending && typeof onSelectHistoryEntry === 'function'

            return (
              <article
                key={entry._id || `${entry.prompt}-${entry.createdAt}`}
                className={`workspace-chat-item${canSelect ? ' workspace-chat-item-selectable' : ''}`}
                onClick={canSelect ? () => onSelectHistoryEntry(entry) : undefined}
              >
                <div className="workspace-message workspace-message-user">
                  <span className="workspace-message-role">You</span>
                  <div className="workspace-message-bubble workspace-message-bubble-user">
                    {entry.prompt}
                  </div>
                </div>

                <div className="workspace-message workspace-message-assistant">
                  <span className="workspace-message-role">SproutOS</span>
                  <div className="workspace-message-bubble workspace-message-bubble-assistant">
                    {entry?.isPending ? (
                      <div className="workspace-typing">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <>
                        {messageText ? (
                          <p className="workspace-message-text">{messageText}</p>
                        ) : null}

                        {messageImages.length > 0 ? (
                          <div className="workspace-message-image-grid">
                            {messageImages.map((imageUrl, index) => (
                              <img
                                key={`${entry._id || entry.createdAt}-img-${index}`}
                                src={imageUrl}
                                alt={`Generated output ${index + 1}`}
                                className="workspace-generated-image"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        ) : null}

                        {!messageText && messageImages.length === 0 ? (
                          <p className="workspace-message-text">
                            No output was returned for this prompt.
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                  {createdAtLabel ? (
                    <small className="workspace-message-time">{createdAtLabel}</small>
                  ) : null}
                </div>
              </article>
            )
          })
        )}
      </section>

      <div className="workspace-chat-composer-wrap">
        {promptStatus.message && promptStatus.type === 'error' ? (
          <div className="workspace-task-status">
            <StatusBanner status={promptStatus} />
          </div>
        ) : null}

        {selectedHistoryEntry ? (
          <p className="workspace-selection-hint">
            Selected from history: {selectedHistoryEntry.prompt}
          </p>
        ) : null}

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

        <form className="workspace-chat-composer" onSubmit={handleSubmit}>
          <textarea
            id="workspace-prompt"
            placeholder="Message SproutOS..."
            value={promptDraft}
            onChange={(event) => onPromptDraftChange(event.target.value)}
            rows={2}
          />
          <button
            type="submit"
            className="workspace-task-submit"
            disabled={isGeneratingPrompt || !promptDraft.trim()}
          >
            {isGeneratingPrompt ? 'Generating...' : 'Send'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default WorkspaceHomePanel
