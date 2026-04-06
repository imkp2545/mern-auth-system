function WorkspaceProfileSummary({ profile, onEdit }) {
  return (
    <section className="workspace-form-card workspace-summary-card">
      <div className="workspace-form-header">
        <p className="workspace-form-kicker">Submission Complete</p>
        <h1>Workspace profile submitted</h1>
        <p>
          Your details are already saved in the database, so you do not need to fill
          this form again.
        </p>
      </div>

      <div className="workspace-summary-grid">
        <div className="workspace-summary-item">
          <span>Name</span>
          <strong>{profile.fullName}</strong>
        </div>
        <div className="workspace-summary-item">
          <span>Work type</span>
          <strong>{profile.workType}</strong>
        </div>
        <div className="workspace-summary-item">
          <span>Role</span>
          <strong>{profile.role}</strong>
        </div>
        <div className="workspace-summary-item">
          <span>Team size</span>
          <strong>{profile.teamSize}</strong>
        </div>
        <div className="workspace-summary-item">
          <span>Help topic</span>
          <strong>{profile.helpTopic}</strong>
        </div>
        <div className="workspace-summary-item">
          <span>Beta feedback</span>
          <strong>{profile.betaFeedback}</strong>
        </div>
      </div>

      <div className="workspace-summary-note">
        <p>
          Marketing consent: {profile.marketingConsent ? 'Granted' : 'Not granted'}
        </p>
      </div>

      <button type="button" className="workspace-submit-button" onClick={onEdit}>
        Edit Submitted Details
      </button>
    </section>
  )
}

export default WorkspaceProfileSummary
