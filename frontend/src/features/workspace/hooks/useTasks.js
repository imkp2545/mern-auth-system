import { useEffect, useState } from 'react'
import { taskService } from '../services/taskService'

export function useTasks(authUser) {
  const [tasks, setTasks] = useState([])
  const [draftTask, setDraftTask] = useState('')
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isCreatingTask, setIsCreatingTask] = useState(false)
  const [taskStatus, setTaskStatus] = useState({
    type: 'idle',
    message: '',
  })

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      if (!authUser?.token) {
        setIsLoadingTasks(false)
        return
      }

      setIsLoadingTasks(true)

      try {
        const data = await taskService.getTasks(authUser.token)

        if (!isMounted) {
          return
        }

        setTasks(data.tasks || [])
        setTaskStatus({
          type: 'idle',
          message: '',
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setTaskStatus({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unable to load tasks',
        })
      } finally {
        if (isMounted) {
          setIsLoadingTasks(false)
        }
      }
    }

    loadTasks()

    return () => {
      isMounted = false
    }
  }, [authUser?.token])

  const createTask = async () => {
    const title = draftTask.trim()

    if (!title || !authUser?.token) {
      return
    }

    setIsCreatingTask(true)
    setTaskStatus({
      type: 'pending',
      message: 'Creating your task...',
    })

    try {
      const data = await taskService.createTask(authUser.token, { title })
      setTasks((current) => [data.task, ...current])
      setDraftTask('')
      setTaskStatus({
        type: 'success',
        message: data.message || 'Task created successfully.',
      })
    } catch (error) {
      setTaskStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Unable to create task',
      })
    } finally {
      setIsCreatingTask(false)
    }
  }

  return {
    tasks,
    draftTask,
    setDraftTask,
    isLoadingTasks,
    isCreatingTask,
    taskStatus,
    createTask,
  }
}
