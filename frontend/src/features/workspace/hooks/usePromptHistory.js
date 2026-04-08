import { useEffect, useState } from 'react'
import { promptService } from '../services/promptService'

const IMAGE_PROMPT_REGEX =
  /\b(image|picture|photo|illustration|art|logo|icon|poster|wallpaper|draw|sketch|render)\b/i
const CODE_REVIEW_PROMPT_REGEX =
  /\b(code review|review code|analyze code|audit code|check this code)\b/i

function resolvePromptType(prompt) {
  if (IMAGE_PROMPT_REGEX.test(prompt)) {
    return 'image'
  }

  if (CODE_REVIEW_PROMPT_REGEX.test(prompt)) {
    return 'code-review'
  }

  return 'text'
}

export function usePromptHistory(authUser) {
  const [promptHistory, setPromptHistory] = useState([])
  const [promptDraft, setPromptDraft] = useState('')
  const [pendingPrompt, setPendingPrompt] = useState(null)
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
        setPendingPrompt(null)
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
        setPendingPrompt(null)
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

    const pendingEntry = {
      _id: `pending-${Date.now()}`,
      prompt,
      response: '',
      images: [],
      responseType: 'text',
      createdAt: new Date().toISOString(),
      isPending: true,
    }

    setIsGeneratingPrompt(true)
    setPendingPrompt(pendingEntry)
    setPromptDraft('')
    setPromptStatus({
      type: 'pending',
      message: 'Generating your response...',
    })

    try {
      const promptType = resolvePromptType(prompt)
      const payload = promptType === 'text' ? { prompt } : { prompt, type: promptType }
      const data = await promptService.generatePrompt(authUser.token, payload)
      const nextEntry = data.historyEntry

      setPromptHistory((current) => [nextEntry, ...current])
      setSelectedHistoryEntry(nextEntry)
      setPendingPrompt(null)
      setPromptStatus({
        type: 'success',
        message: data.message || 'Prompt generated successfully.',
      })
    } catch (error) {
      setPendingPrompt(null)
      setPromptDraft(prompt)
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
    pendingPrompt,
    setPromptDraft,
    selectedHistoryEntry,
    isLoadingPromptHistory,
    isGeneratingPrompt,
    promptStatus,
    selectHistoryEntry,
    generatePrompt,
  }
}
