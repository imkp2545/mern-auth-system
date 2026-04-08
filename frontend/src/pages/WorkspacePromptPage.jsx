import WorkspaceHomePanel from '../features/workspace/components/WorkspaceHomePanel'

function WorkspacePromptPage({
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
  return (
    <WorkspaceHomePanel
      profile={profile}
      promptDraft={promptDraft}
      promptHistory={promptHistory}
      selectedHistoryEntry={selectedHistoryEntry}
      isGeneratingPrompt={isGeneratingPrompt}
      promptStatus={promptStatus}
      onPromptDraftChange={onPromptDraftChange}
      onGeneratePrompt={onGeneratePrompt}
      onSelectHistoryEntry={onSelectHistoryEntry}
    />
  )
}

export default WorkspacePromptPage
