import { useEffect, useState } from 'react'
import { promptService } from '../services/promptService'

export function usePromptHistory(authUser) {
  const [promptHistory, setPromptHistory] = useState([])
  const [promptDraft, setPromptDraft] = useState('')
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null)
  const [isLoadingPromptHistory, setIsLoadingPromptHistory] = useState(true)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const [promptStatus, setPromptStatus] = useState({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadPromptHistory() {
      if (!authUser?.token) {
        setIsLoadingPromptHistory(false)
        return
      }

      setIsLoadingPromptHistory(true)

      try {
        const data = await promptService.getPromptHistory(authUser.token)

        if (!isMounted) {
          return
        }

        const history = data.history || []

        setPromptHistory(history)
        setSelectedHistoryEntry(history[0] || null)
        setPromptStatus({
          type: 'idle',
          message: '',
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setPromptStatus({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'Unable to load prompt history',
        })
      } finally {
        if (isMounted) {
          setIsLoadingPromptHistory(false)
        }
      }
    }

    loadPromptHistory()

    return () => {
      isMounted = false
    }
  }, [authUser?.token])

  const selectHistoryEntry = (entry) => {
    setSelectedHistoryEntry(entry)
    setPromptDraft(entry?.prompt || '')
  }

  const generatePrompt = async () => {
    const prompt = promptDraft.trim()

    if (!prompt || !authUser?.token) {
      return
    }

    setIsGeneratingPrompt(true)
    setPromptStatus({
      type: 'pending',
      message: 'Generating your response...',
    })

    try {
      const data = await promptService.generatePrompt(authUser.token, { prompt })
      const nextEntry = data.historyEntry

      setPromptHistory((current) => [nextEntry, ...current])
      setSelectedHistoryEntry(nextEntry)
      setPromptDraft('')
      setPromptStatus({
        type: 'success',
        message: data.message || 'Prompt generated successfully.',
      })
    } catch (error) {
      setPromptStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to generate response',
      })
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  return {
    promptHistory,
    promptDraft,
    setPromptDraft,
    selectedHistoryEntry,
    isLoadingPromptHistory,
    isGeneratingPrompt,
    promptStatus,
    selectHistoryEntry,
    generatePrompt,
  }
}
