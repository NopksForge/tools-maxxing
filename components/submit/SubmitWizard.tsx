'use client'

import { useState } from 'react'
import { StepUrl } from './StepUrl'
import { StepDetails } from './StepDetails'

type Step = 'url' | 'details'

export function SubmitWizard() {
  const [step, setStep] = useState<Step>('url')
  const [url, setUrl] = useState('')

  if (step === 'url') {
    return (
      <StepUrl
        onContinue={(submittedUrl) => {
          setUrl(submittedUrl)
          setStep('details')
        }}
      />
    )
  }

  return (
    <StepDetails
      url={url}
      onBack={() => setStep('url')}
    />
  )
}
