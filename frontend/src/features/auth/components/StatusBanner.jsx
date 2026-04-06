function StatusBanner({ status }) {
  if (!status?.message) {
    return null
  }

  return (
    <div className={`status-box ${status.type}`}>
      <p>{status.message}</p>
    </div>
  )
}

export default StatusBanner
