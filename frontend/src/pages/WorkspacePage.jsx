import { useEffect, useState } from 'react'
import WorkspaceProfileForm from '../features/workspace/components/WorkspaceProfileForm'
import { useTasks } from '../features/workspace/hooks/useTasks'
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
    tasks,
    draftTask,
    setDraftTask,
    isLoadingTasks,
    isCreatingTask,
    taskStatus,
    createTask,
  } = useTasks(authUser)

  const firstName = (profile.fullName || authUser?.name || 'Creator')
    .trim()
    .split(' ')[0]
  const sidebarName = `${firstName.toLowerCase()}'s team`
  const initial = firstName.slice(0, 1).toUpperCase()
  const recentProjects = tasks.slice(0, 4)
  const hasRecentProjects = recentProjects.length > 0

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
            {isLoadingTasks ? (
              <p>Loading projects...</p>
            ) : hasRecentProjects ? (
              <div className="workspace-project-list">
                {recentProjects.map((task) => (
                  <button
                    key={task._id}
                    type="button"
                    className="workspace-project-item"
                    onClick={() => setDraftTask(task.title)}
                  >
                    {task.title}
                  </button>
                ))}
              </div>
            ) : (
              <p>No Recent Projects</p>
            )}
          </div>

          <div className="workspace-sidebar-section">
            <span className="workspace-sidebar-label">{sidebarName}</span>
            <p>
              {hasRecentProjects
                ? `${recentProjects.length} saved project${recentProjects.length > 1 ? 's' : ''}`
                : 'No team projects yet'}
            </p>
          </div>
        </div>

        <div className="workspace-sidebar-panel workspace-sidebar-panel-bottom">
          <span className="workspace-sidebar-label">Get started</span>
          <ul className="workspace-checklist">
            <li className="active">Enter the prompt</li>
            <li>{showPromptPage ? 'Create your next project idea.' : 'Complete your workspace profile.'}</li>
            <li>Generate site map</li>
            <li>Add your branding</li>
            <li>Export your project</li>
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
            draftTask={draftTask}
            isCreatingTask={isCreatingTask}
            taskStatus={taskStatus}
            onDraftChange={setDraftTask}
            onCreateTask={createTask}
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
