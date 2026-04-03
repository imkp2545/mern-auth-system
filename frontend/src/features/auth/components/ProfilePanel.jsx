function ProfilePanel({
  authUser,
  profile,
  isLoadingProfile,
  onFetchProfile,
  onLogout,
}) {
  const displayName = authUser?.name || profile?.user?.name || 'User'
  const displayEmail = authUser?.email || profile?.user?.email || 'Not available'

  return (
    <article className="panel profile-panel">
      <div className="profile-hero">
        <p className="section-kicker">Profile</p>
        <div className="profile-heading-row">
          <div className="profile-identity">
            <span className="profile-avatar">
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <h2>Welcome, {displayName}</h2>
              <p className="profile-subtitle">
                Your account is active and your protected profile data loaded successfully.
              </p>
            </div>
          </div>

          <span className="profile-status-pill">Active session</span>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-data-card">
          <span className="summary-label">Name</span>
          <strong>{displayName}</strong>
          <p>Visible on your account profile.</p>
        </div>
        <div className="profile-data-card">
          <span className="summary-label">Email</span>
          <strong>{displayEmail}</strong>
          <p>Used for secure login and account access.</p>
        </div>
      </div>

      <div className="profile-note profile-note-highlight">
        <span className="note-indicator"></span>
        <p>{profile?.message || 'Your profile information is ready.'}</p>
      </div>

      <div className="profile-actions">
        <button
          type="button"
          className="profile-button profile-button-primary"
          onClick={onFetchProfile}
          disabled={!authUser?.token || isLoadingProfile}
        >
          {isLoadingProfile ? 'Refreshing...' : 'Refresh profile'}
        </button>
        <button
          type="button"
          className="profile-button profile-button-secondary"
          onClick={onLogout}
          disabled={!authUser}
        >
          Sign out
        </button>
      </div>
    </article>
  )
}

export default ProfilePanel
