import React, { useState } from "react";

export default function AdminPanel({ requests, onUpdateStatus, onDeleteRequest, onBack, lang, t }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Compute stats
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === "new").length;
  const activeCount = requests.filter(r => r.status === "in_progress").length;
  const completedCount = requests.filter(r => r.status === "completed").length;

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "new":
        return "badge badge-new";
      case "in_progress":
        return "badge badge-progress";
      case "completed":
        return "badge badge-completed";
      case "archived":
        return "badge badge-archived";
      default:
        return "badge";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "new": return t.statusNew;
      case "in_progress": return t.statusInProgress;
      case "completed": return t.statusCompleted;
      case "archived": return t.statusArchived;
      default: return status;
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div>
          <h1 className="gradient-text">{t.adminTitle}</h1>
          <p className="admin-subtitle">{t.adminSubtitle}</p>
        </div>
        <button className="btn-secondary" onClick={onBack}>
          &larr; {t.adminBackToSite}
        </button>
      </header>

      {/* Admin Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <h3>{t.statsTotal}</h3>
          <p className="stat-number text-primary">{totalCount}</p>
        </div>
        <div className="stat-card glass">
          <h3>{t.statsNewCount}</h3>
          <p className="stat-number text-new">{newCount}</p>
        </div>
        <div className="stat-card glass">
          <h3>{t.statsActive}</h3>
          <p className="stat-number text-progress">{activeCount}</p>
        </div>
        <div className="stat-card glass">
          <h3>{t.statsDone}</h3>
          <p className="stat-number text-completed">{completedCount}</p>
        </div>
      </div>

      <div className="admin-main">
        {/* Requests List */}
        <div className="requests-list-container glass">
          {requests.length === 0 ? (
            <div className="no-requests">{t.adminNoRequests}</div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>{t.adminRequestFrom}</th>
                    <th>{t.adminContactInfo}</th>
                    <th>{t.adminStatus}</th>
                    <th>{t.adminDate}</th>
                    <th>{t.adminActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr 
                      key={req.id} 
                      className={`request-row ${selectedRequest?.id === req.id ? 'active-row' : ''}`}
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td>
                        <div className="client-name">{req.name} {req.surname}</div>
                      </td>
                      <td>
                        <div className="client-email">{req.email}</div>
                        <div className="client-phone">{req.phone}</div>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(req.status)}>
                          {getStatusText(req.status)}
                        </span>
                      </td>
                      <td className="request-date">{req.date}</td>
                      <td>
                        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                          {req.status === "new" && (
                            <button 
                              className="btn-action btn-action-progress" 
                              onClick={() => onUpdateStatus(req.id, "in_progress")}
                              title={t.actionInProgress}
                            >
                              ⚙️
                            </button>
                          )}
                          {req.status !== "completed" && req.status !== "archived" && (
                            <button 
                              className="btn-action btn-action-complete" 
                              onClick={() => onUpdateStatus(req.id, "completed")}
                              title={t.actionComplete}
                            >
                              ✅
                            </button>
                          )}
                          {req.status !== "archived" && (
                            <button 
                              className="btn-action btn-action-archive" 
                              onClick={() => onUpdateStatus(req.id, "archived")}
                              title={t.actionArchive}
                            >
                              📦
                            </button>
                          )}
                          <button 
                            className="btn-action btn-action-delete" 
                            onClick={() => {
                              onDeleteRequest(req.id);
                              if (selectedRequest?.id === req.id) setSelectedRequest(null);
                            }}
                            title={t.actionDelete}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Request Detail Panel */}
        <div className="request-detail-panel glass">
          {selectedRequest ? (
            <div className="detail-content">
              <h3>{t.formTitle} Detayı</h3>
              <hr className="divider" />
              
              <div className="detail-group">
                <label>{t.adminRequestFrom}</label>
                <div className="detail-value highlighted-text">{selectedRequest.name} {selectedRequest.surname}</div>
              </div>

              <div className="detail-row">
                <div className="detail-group">
                  <label>{t.fieldPhone}</label>
                  <div className="detail-value">{selectedRequest.phone}</div>
                </div>
                <div className="detail-group">
                  <label>{t.fieldEmail}</label>
                  <div className="detail-value">{selectedRequest.email}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-group">
                  <label>{t.adminStatus}</label>
                  <div>
                    <span className={getStatusBadgeClass(selectedRequest.status)}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
                <div className="detail-group">
                  <label>{t.adminDate}</label>
                  <div className="detail-value">{selectedRequest.date}</div>
                </div>
              </div>

              <div className="detail-group">
                <label>{t.fieldDescription}</label>
                <div className="detail-value desc-box">{selectedRequest.description}</div>
              </div>

              <div className="detail-footer-actions">
                {selectedRequest.status === "new" && (
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      onUpdateStatus(selectedRequest.id, "in_progress");
                      setSelectedRequest({ ...selectedRequest, status: "in_progress" });
                    }}
                  >
                    {t.actionInProgress}
                  </button>
                )}
                {selectedRequest.status !== "completed" && selectedRequest.status !== "archived" && (
                  <button 
                    className="btn-success" 
                    onClick={() => {
                      onUpdateStatus(selectedRequest.id, "completed");
                      setSelectedRequest({ ...selectedRequest, status: "completed" });
                    }}
                  >
                    {t.actionComplete}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="detail-empty">
              <div className="empty-icon">📂</div>
              <p>{lang === "tr" ? "Detayları görüntülemek için bir talebe tıklayın." : "Click a request to view details."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
