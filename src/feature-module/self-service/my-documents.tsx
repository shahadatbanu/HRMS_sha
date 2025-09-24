import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from "../router/all_routes";
import { useUser } from '../../core/context/UserContext';

const routes = all_routes;

interface Attachment {
  fileName?: string;
  filePath: string;
  fileType?: string;
  uploadedBy?: string;
  uploadedOn?: string;
  note?: string;
}

const MyDocuments: React.FC = () => {
  const { user } = useUser();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyAttachments = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token') || '';
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/employees/me/attachments?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error('Failed to load documents');
        }
        const payload = await res.json();
        setAttachments(payload.data || []);
        setTotal(payload.total || 0);
        setTotalPages(payload.totalPages || 1);
      } catch (e: any) {
        setError(e?.message || 'Something went wrong');
        setAttachments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyAttachments();
  }, [page, limit]);

  const secureDownload = async (filePath: string) => {
    try {
      const base = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${base}/api/employees/attachments/${encodeURIComponent(filePath)}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Download failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      // Optional: surface an error toast
      // console.error('Download error', e);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h2 className="mb-1">My Documents</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.attendanceemployee}><i className="ti ti-smart-home" /></Link>
                </li>
                <li className="breadcrumb-item">Self Service</li>
                <li className="breadcrumb-item active" aria-current="page">My Documents</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="card">
          <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
            <h5 className="mb-2">Your Attachments</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Loading your documents...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger" role="alert">{error}</div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-4">
                <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                <p className="text-muted">No documents available.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-nowrap mb-0">
                  <thead>
                    <tr>
                      <th>File</th>
                      <th style={{ width: '35%' }}>Type</th>
                      <th style={{ width: '20%' }}>Uploaded On</th>
                      <th className="text-end" style={{ width: 100, whiteSpace: 'nowrap' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attachments.map((att, idx) => (
                      <tr key={`${att.filePath}-${idx}`}>
                        <td>
                          <div className="d-flex align-items-center file-name-icon">
                            <span className="avatar avatar-rounded bg-light me-2">
                              <i className="ti ti-file-description text-muted" />
                            </span>
                            <div className="text-truncate" style={{ maxWidth: '360px' }}>
                              <div className="fw-medium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={att.fileName || att.filePath}>
                                {att.fileName || att.filePath}
                              </div>
                              {att.note && <div className="fs-12 text-muted text-truncate" title={att.note}>{att.note}</div>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: 500 }} title={att.fileType || '-'}>
                            {att.fileType || '-'}
                          </div>
                        </td>
                        <td>{att.uploadedOn ? new Date(att.uploadedOn).toLocaleString() : '-'}</td>
                        <td className="text-end" style={{ width: 100, whiteSpace: 'nowrap' }}>
                          <button className="btn btn-sm btn-light" onClick={() => secureDownload(att.filePath)} title="Download">
                            <i className="ti ti-download" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {totalPages > 1 ? (
                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                  <div className="text-muted small">
                    Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                      <i className="ti ti-chevron-left" />
                    </button>
                    <span className="btn btn-sm btn-outline-secondary disabled">{page} / {totalPages}</span>
                    <button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                      <i className="ti ti-chevron-right" />
                    </button>
                  </div>
                </div>
              ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;


