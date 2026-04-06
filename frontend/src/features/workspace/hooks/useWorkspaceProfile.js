import { useEffect, useRef, useState } from 'react'
import { WORKSPACE_PROFILE_DEFAULTS } from '../constants/workspaceProfile.constants'
import { workspaceService } from '../services/workspaceService'

function isWorkspaceProfileComplete(profile) {
  return Boolean(
    profile.fullName.trim() &&
      profile.workType &&
      profile.role &&
      profile.teamSize &&
      profile.helpTopic &&
      profile.betaFeedback,
  )
}

function isSnapshotComplete(snapshot) {
  try {
    return isWorkspaceProfileComplete(JSON.parse(snapshot))
  } catch {
    return false
  }
}

function buildInitialProfile(authUser) {
  return {
    ...WORKSPACE_PROFILE_DEFAULTS,
    fullName: authUser?.name || '',
    ...authUser?.workspaceProfile,
  }
}

export function useWorkspaceProfile(authUser, onUserSync) {
  const [profile, setProfile] = useState(() => buildInitialProfile(authUser))
  const [status, setStatus] = useState({
    type: 'idle',
    message: 'Complete your workspace details and save them to your account.',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [hasSubmittedProfile, setHasSubmittedProfile] = useState(
    isWorkspaceProfileComplete(buildInitialProfile(authUser)),
  )
  const lastSavedSnapshotRef = useRef(JSON.stringify(buildInitialProfile(authUser)))
  const latestProfileRef = useRef(buildInitialProfile(authUser))
  const saveRequestIdRef = useRef(0)

  const createSnapshot = (value) => JSON.stringify({
    ...WORKSPACE_PROFILE_DEFAULTS,
    ...value,
  })

  useEffect(() => {
    const initialProfile = buildInitialProfile(authUser)
    setProfile(initialProfile)
    setHasSubmittedProfile(isWorkspaceProfileComplete(initialProfile))
    latestProfileRef.current = initialProfile
    lastSavedSnapshotRef.current = createSnapshot(initialProfile)
  }, [authUser])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      if (!authUser?.token) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        const data = await workspaceService.getWorkspaceProfile(authUser.token)

        if (!isMounted) {
          return
        }

        const nextProfile = {
          ...WORKSPACE_PROFILE_DEFAULTS,
          fullName: data.user?.name || authUser.name || '',
          ...data.profile,
        }

        setProfile(nextProfile)
        latestProfileRef.current = nextProfile
        setIsDirty(false)
        setHasSubmittedProfile(isWorkspaceProfileComplete(nextProfile))
        lastSavedSnapshotRef.current = createSnapshot(nextProfile)
        setStatus({
          type: 'idle',
          message: '',
        })
        onUserSync?.({
          ...data.user,
          workspaceProfile: nextProfile,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        setStatus({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Unable to load workspace profile',
        })
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [authUser?.token])

  const updateField = (field, value) => {
    setProfile((current) => {
      const nextProfile = {
        ...current,
        [field]: value,
      }

      latestProfileRef.current = nextProfile
      setIsDirty(createSnapshot(nextProfile) !== lastSavedSnapshotRef.current)
      return nextProfile
    })
  }

  const saveProfile = async (profileToSave = profile, { isAutoSave = false } = {}) => {
    if (!authUser?.token) {
      return false
    }

    if (!isWorkspaceProfileComplete(profileToSave)) {
      setStatus({
        type: 'error',
        message: 'Please complete all form fields before submitting.',
      })
      return false
    }

    setIsSaving(true)
    setStatus({
      type: 'pending',
      message: 'Submitting your workspace profile...',
    })

    const requestId = ++saveRequestIdRef.current

    try {
      const data = await workspaceService.saveWorkspaceProfile(
        authUser.token,
        profileToSave,
      )

      if (requestId !== saveRequestIdRef.current) {
        return
      }

      const savedProfile = {
        ...WORKSPACE_PROFILE_DEFAULTS,
        ...data.profile,
      }

      const latestSnapshot = createSnapshot(latestProfileRef.current)
      const savedSnapshot = createSnapshot(savedProfile)

      lastSavedSnapshotRef.current = savedSnapshot

      if (latestSnapshot === savedSnapshot) {
        setProfile(savedProfile)
        latestProfileRef.current = savedProfile
        setIsDirty(false)
      } else {
        setIsDirty(true)
      }
      setHasSubmittedProfile(true)

      setStatus({
        type: 'success',
        message:
          data.message || 'Form submitted successfully. Your workspace profile was saved.',
      })
      onUserSync?.({
        ...data.user,
        workspaceProfile: savedProfile,
      })
      return true
    } catch (error) {
      if (requestId !== saveRequestIdRef.current) {
        return false
      }

      setStatus({
        type: 'error',
        message:
          error instanceof Error ? error.message : 'Unable to save workspace profile',
      })
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return {
    profile,
    status,
    isLoading,
    isSaving,
    isDirty,
    isFormComplete: isWorkspaceProfileComplete(profile),
    hasSubmittedProfile,
    updateField,
    saveProfile,
  }
}
