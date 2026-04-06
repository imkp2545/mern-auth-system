import WorkspaceHomePanel from '../features/workspace/components/WorkspaceHomePanel'

function WorkspacePromptPage({
  profile,
  draftTask,
  isCreatingTask,
  taskStatus,
  onDraftChange,
  onCreateTask,
}) {
  return (
    <WorkspaceHomePanel
      profile={profile}
      draftTask={draftTask}
      isCreatingTask={isCreatingTask}
      taskStatus={taskStatus}
      onDraftChange={onDraftChange}
      onCreateTask={onCreateTask}
    />
  )
}

export default WorkspacePromptPage
