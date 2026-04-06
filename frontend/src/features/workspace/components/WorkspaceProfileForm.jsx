import StatusBanner from '../../auth/components/StatusBanner'
import {
  BETA_FEEDBACK_OPTIONS,
  HELP_TOPIC_OPTIONS,
  ROLE_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from '../constants/workspaceProfile.constants'

function WorkspaceProfileForm({
  profile,
  status,
  isLoading,
  isSaving,
  isDirty,
  isFormComplete,
  onFieldChange,
  onSave,
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSave()
  }

  return (
    <section className="workspace-form-card">
      <div className="workspace-form-header">
        <p className="workspace-form-kicker">Early Access</p>
        <h1>Tell us about yourself</h1>
        <p>
          Share a few details so we can shape your workspace around how you work.
        </p>
      </div>

      {isLoading ? (
        <div className="workspace-loading-card">
          <p>Loading your workspace details...</p>
        </div>
      ) : (
        <form className="workspace-profile-form" onSubmit={handleSubmit}>
          <div className="workspace-form-body">
            <label className="workspace-field">
              <span>Name</span>
              <input
                type="text"
                value={profile.fullName}
                onChange={(event) => onFieldChange('fullName', event.target.value)}
                placeholder="John Doe"
                required
              />
            </label>

            <div className="workspace-field">
              <span>Are you working as an agency or freelancer?</span>
              <div className="workspace-choice-grid">
                <button
                  type="button"
                  className={`workspace-choice-button${
                    profile.workType === 'agency' ? ' active' : ''
                  }`}
                  onClick={() => onFieldChange('workType', 'agency')}
                >
                  Agency
                </button>
                <button
                  type="button"
                  className={`workspace-choice-button${
                    profile.workType === 'freelancer' ? ' active' : ''
                  }`}
                  onClick={() => onFieldChange('workType', 'freelancer')}
                >
                  Freelancer
                </button>
              </div>
            </div>

            <label className="workspace-field">
              <span>What best describes you?</span>
              <select
                value={profile.role}
                onChange={(event) => onFieldChange('role', event.target.value)}
                required
              >
                <option value="">Select an item</option>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="workspace-field">
              <span>Team size</span>
              <select
                value={profile.teamSize}
                onChange={(event) => onFieldChange('teamSize', event.target.value)}
                required
              >
                <option value="">Select an item</option>
                {TEAM_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="workspace-field">
              <span>What do you want help with most?</span>
              <select
                value={profile.helpTopic}
                onChange={(event) => onFieldChange('helpTopic', event.target.value)}
                required
              >
                <option value="">Select an item</option>
                {HELP_TOPIC_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="workspace-field">
              <span>Are you open to giving feedback during beta?</span>
              <select
                value={profile.betaFeedback}
                onChange={(event) => onFieldChange('betaFeedback', event.target.value)}
                required
              >
                <option value="">Select an item</option>
                {BETA_FEEDBACK_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="workspace-checkbox-row">
              <input
                type="checkbox"
                checked={profile.marketingConsent}
                onChange={(event) =>
                  onFieldChange('marketingConsent', event.target.checked)
                }
              />
              <span>
                I agree to receive emails about my early access status, product
                updates, and waitlist-related offers.
              </span>
            </label>
          </div>

          <div className="workspace-form-footer">
            <button
              className="workspace-submit-button"
              type="submit"
              disabled={isSaving || !isFormComplete}
            >
              {isSaving ? 'Submitting...' : isDirty ? 'Submit Form' : 'Submitted'}
            </button>

            <p className="workspace-form-note">
              {isFormComplete
                ? isDirty
                  ? 'Submit the completed form to save it in your WorkspaceProfile collection.'
                  : 'Your form was submitted successfully and stored in the database.'
                : 'Complete every field in the form before submitting.'}
            </p>
          </div>
        </form>
      )}

      <div className="workspace-status-wrap">
        <StatusBanner status={status} />
      </div>
    </section>
  )
}

export default WorkspaceProfileForm
