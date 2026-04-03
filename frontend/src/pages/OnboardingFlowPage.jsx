import { useEffect, useState } from 'react'
import OnboardingQuestionPage from './OnboardingQuestionPage'
import OnboardingReadyPage from './OnboardingReadyPage'
import OnboardingWelcomePage from './OnboardingWelcomePage'
import './OnboardingPages.css'

const ONBOARDING_STEPS = [
  {
    id: 'source',
    title: 'How did you find us?',
    description: 'Helps us grow in the right places',
    options: [
      'Social media',
      'Google search',
      'Friend / colleague',
      'Community forum',
      'Influencer',
      'Other',
    ],
  },
  {
    id: 'team',
    title: 'Who are you setting this up for?',
    description: 'We will tune the product around your working style',
    options: [
      'Just me',
      'My small team',
      'My company',
      'Client work',
      'Freelance projects',
      'Still exploring',
    ],
  },
  {
    id: 'goal',
    title: 'What are you hoping to improve first?',
    description: 'Choose the first outcome you want from the platform',
    options: [
      'Productivity',
      'Collaboration',
      'Automation',
      'Client delivery',
      'Documentation',
      'Strategy',
    ],
  },
  {
    id: 'workflow',
    title: 'Which workflow feels closest to yours?',
    description: 'This helps personalize your first workspace view',
    options: [
      'Fast and lightweight',
      'Structured and detailed',
      'Creative and visual',
      'Operational and process-driven',
      'Client-facing',
      'Experimental',
    ],
  },
  {
    id: 'intent',
    title: 'What should your profile communicate?',
    description: 'We use this to shape the final profile presentation',
    options: [
      'Professional and trusted',
      'Bold and modern',
      'Minimal and calm',
      'Creative and premium',
      'Friendly and approachable',
      'Sharp and high-performance',
    ],
  },
]

function OnboardingFlowPage({ userName, onComplete }) {
  const [stage, setStage] = useState('welcome')
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [phase, setPhase] = useState('enter')

  const activeStep = ONBOARDING_STEPS[stepIndex]
  const activeAnswer = activeStep ? answers[activeStep.id] : ''

  const handleSelect = (stepId, answer) => {
    setAnswers((current) => ({
      ...current,
      [stepId]: answer,
    }))

    setPhase('exit')

    window.setTimeout(() => {
      setStepIndex((current) => {
        if (ONBOARDING_STEPS[current]?.id !== stepId) {
          return current
        }

        if (current === ONBOARDING_STEPS.length - 1) {
          setStage('ready')
          setPhase('enter')
          return current
        }

        setPhase('enter')
        return current + 1
      })
    }, 260)
  }

  useEffect(() => {
    if (stage !== 'welcome') {
      return undefined
    }

    const timer = window.setTimeout(() => {
      setPhase('exit')
    }, 1650)

    const switchTimer = window.setTimeout(() => {
      setStage('questions')
      setStepIndex(0)
      setPhase('enter')
    }, 1980)

    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(switchTimer)
    }
  }, [stage])

  const handleReadyComplete = () => {
    setPhase('exit')

    window.setTimeout(() => {
      onComplete()
    }, 320)
  }

  if (stage === 'welcome') {
    return <OnboardingWelcomePage userName={userName} phase={phase} />
  }

  if (stage === 'questions') {
    return (
      <OnboardingQuestionPage
        step={activeStep}
        stepIndex={stepIndex}
        totalSteps={ONBOARDING_STEPS.length}
        answer={activeAnswer}
        onSelect={handleSelect}
        phase={phase}
      />
    )
  }

  return (
    <OnboardingReadyPage
      answers={answers}
      phase={phase}
      onComplete={handleReadyComplete}
    />
  )
}

export default OnboardingFlowPage
