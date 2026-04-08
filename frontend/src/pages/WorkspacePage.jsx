import { useEffect, useState } from 'react'
import WorkspaceProfileForm from '../features/workspace/components/WorkspaceProfileForm'
import { usePromptHistory } from '../features/workspace/hooks/usePromptHistory'
import { useWorkspaceProfile } from '../features/workspace/hooks/useWorkspaceProfile'
import WorkspacePromptPage from './WorkspacePromptPage'
import './WorkspacePage.css'

function WorkspacePage({ authUser, onUserSync, onLogout }) {
  const [activeScreen, setActiveScreen] = useState('form')
  const {
    profile,
    status,
    isLoading,
    isSaving,
    isDirty,
    isFormComplete,
    hasSubmittedProfile,
    updateField,
    saveProfile,
  } = useWorkspaceProfile(authUser, onUserSync)
  const {
    promptHistory,
    promptDraft,
    setPromptDraft,
    selectedHistoryEntry,
    isLoadingPromptHistory,
    isGeneratingPrompt,
    promptStatus,
    selectHistoryEntry,
    generatePrompt,
  } = usePromptHistory(authUser)

  const firstName = (profile.fullName || authUser?.name || 'Creator')
    .trim()
    .split(' ')[0]
  const sidebarName = `${firstName.toLowerCase()}'s team`
  const initial = firstName.slice(0, 1).toUpperCase()
  const recentPrompts = promptHistory.slice(0, 4)
  const hasRecentPrompts = recentPrompts.length > 0

  useEffect(() => {
    setActiveScreen(hasSubmittedProfile ? 'prompt' : 'form')
  }, [hasSubmittedProfile])

  const showPromptPage = activeScreen === 'prompt'

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <div className="workspace-brand-row">
          <div className="workspace-brand-pill">
            <span className="workspace-brand-mark"></span>
            <span>SproutOS</span>
          </div>
          <div className="workspace-team-pill">
            <span className="workspace-team-avatar">{initial}</span>
            <span>{sidebarName}</span>
          </div>
        </div>

        <div className="workspace-sidebar-panel">
          <div className="workspace-search-box">Search</div>

          <div className="workspace-sidebar-section">
            <span className="workspace-sidebar-label">Last Opened</span>
            {isLoadingPromptHistory ? (
              <p>Loading history...</p>
            ) : hasRecentPrompts ? (
              <div className="workspace-project-list">
                {recentPrompts.map((entry) => (
                  <button
                    key={entry._id}
                    type="button"
                    className="workspace-project-item"
                    onClick={() => selectHistoryEntry(entry)}
                  >
                    {entry.prompt}
                  </button>
                ))}
              </div>
            ) : (
              <p>No saved prompts yet</p>
            )}
          </div>

          <div className="workspace-sidebar-section">
            <span className="workspace-sidebar-label">{sidebarName}</span>
            <p>
              {hasRecentPrompts
                ? `${promptHistory.length} saved prompt${promptHistory.length > 1 ? 's' : ''}`
                : 'No prompt history yet'}
            </p>
          </div>
        </div>

        <div className="workspace-sidebar-panel workspace-sidebar-panel-bottom">
          <span className="workspace-sidebar-label">Get started</span>
          <ul className="workspace-checklist">
            <li className="active">Enter the prompt</li>
            <li>{showPromptPage ? 'Generate and save your response.' : 'Complete your workspace profile.'}</li>
            <li>Review saved history</li>
            <li>Continue from your last session</li>
            <li>Build your next idea</li>
          </ul>
        </div>

        <div className="workspace-sidebar-footer">
          <div className="workspace-user-chip">
            <span className="workspace-user-avatar">{initial}</span>
            <div>
              <strong>{authUser?.name || profile.fullName || 'User'}</strong>
              <p>{authUser?.email}</p>
            </div>
          </div>

          <button
            type="button"
            className="workspace-logout-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      <section
        className={`workspace-main-panel${showPromptPage ? ' workspace-main-panel-home' : ''}`}
      >
        {showPromptPage ? (
          <WorkspacePromptPage
            profile={profile}
            promptDraft={promptDraft}
            promptHistory={promptHistory}
            selectedHistoryEntry={selectedHistoryEntry}
            isGeneratingPrompt={isGeneratingPrompt}
            promptStatus={promptStatus}
            onPromptDraftChange={setPromptDraft}
            onGeneratePrompt={generatePrompt}
            onSelectHistoryEntry={selectHistoryEntry}
          />
        ) : (
          <WorkspaceProfileForm
            profile={profile}
            status={status}
            isLoading={isLoading}
            isSaving={isSaving}
            isDirty={isDirty}
            isFormComplete={isFormComplete}
            onFieldChange={updateField}
            onSave={async () => {
              const didSubmit = await saveProfile()

              if (didSubmit) {
                setActiveScreen('prompt')
              }
            }}
          />
        )}
      </section>
    </main>
  )
}

export default WorkspacePage
