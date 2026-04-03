function StatusBanner({ status }) {
  return (
    <div className={`status-box ${status.type}`}>
      <p>{status.message}</p>
    </div>
  )
}

export default StatusBanner
