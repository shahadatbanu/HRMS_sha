import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backend_url } from "../../../environment";
import { all_routes } from "../../../feature-module/router/all_routes";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ReactApexChart from "react-apexcharts";
import { useUser } from '../../../core/context/UserContext';
import Swal from 'sweetalert2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Candidate interface
interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  status: 'active' | 'dead' | 'hired' | 'rejected' | 'interviewed';
  performance: {
    submissionRate: number;
    engagementScore: number;
    lastActivity: Date;
    totalSubmissions: number;
    qualityScore: number;
  };
  interview: {
    scheduled: boolean;
    date?: Date;
    status?: 'scheduled' | 'completed' | 'cancelled';
    interviewer?: string;
    type?: 'phone' | 'video' | 'in-person';
  };
  jobOffer: {
    status: 'none' | 'pending' | 'sent' | 'accepted' | 'rejected';
    amount?: number;
    date?: Date;
  };
  source: string;
  experience: number;
  skills: string[];
  avatar?: string;
}

const CandidateDashboardPrototype = () => {
  const routes = all_routes;
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  // State for candidate data
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Real data from existing APIs
  const [candidatesData, setCandidatesData] = useState<any[]>([]);
  const [submissionsData, setSubmissionsData] = useState<any>(null);
  const [jobOffersData, setJobOffersData] = useState<any>(null);
  const [interviewSchedulesData, setInterviewSchedulesData] = useState<any>(null);

  // Calculate statistics from real data
  const stats = {
    totalCandidates: candidatesData.length,
    activeCandidates: candidatesData.filter(c => c.status === 'New' || c.status === 'Scheduled').length,
    deadCandidates: candidatesData.filter(c => {
      // Consider candidates dead if no activity in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(c.updatedAt || c.createdAt) < thirtyDaysAgo && c.status === 'New';
    }).length,
    hiredCandidates: candidatesData.filter(c => c.status === 'Hired').length,
    interviewedCandidates: candidatesData.filter(c => c.status === 'Interviewed').length,
    newThisWeek: candidatesData.filter(c => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(c.createdAt) > weekAgo;
    }).length,
    avgSubmissions: candidatesData.reduce((sum, c) => sum + (c.submissions?.length || 0), 0) / candidatesData.length,
    totalSubmissions: submissionsData?.totalSubmissions || 0,
    totalJobOffers: jobOffersData?.totalJobOffers || 0,
    totalInterviews: interviewSchedulesData?.totalInterviewSchedules || 0
  };

  // Chart data from real API data
  const statusDistributionData = {
    series: [
      stats.activeCandidates,
      stats.deadCandidates,
      stats.hiredCandidates,
      stats.interviewedCandidates
    ],
    options: {
      chart: {
        type: 'donut' as const,
        height: 300
      },
      labels: ['Active', 'Dead', 'Hired', 'Interviewed'],
      colors: ['#10B981', '#EF4444', '#3B82F6', '#F59E0B'],
      legend: {
        position: 'bottom' as const
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%'
          }
        }
      }
    }
  };

  const performanceChartData = {
    labels: candidatesData.slice(0, 10).map(c => `${c.firstName} ${c.lastName}`),
    datasets: [
      {
        label: 'Submissions Count',
        data: candidatesData.slice(0, 10).map(c => c.submissions?.length || 0),
        backgroundColor: candidatesData.slice(0, 10).map(c => {
          if (c.status === 'Hired') return '#10B981';
          if (c.status === 'New' || c.status === 'Scheduled') return '#3B82F6';
          if (c.status === 'Rejected') return '#EF4444';
          return '#F59E0B';
        }),
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Candidate Submissions Overview'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const submissionTrendData = {
    series: [{
      name: 'Submissions',
      data: submissionsData?.submissions || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }],
    options: {
      chart: {
        type: 'area' as const,
        height: 300
      },
      colors: ['#3B82F6'],
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth' as const
      },
      xaxis: {
        categories: submissionsData?.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      }
    }
  };

  // Fetch real data from existing APIs
  const fetchCandidatesData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch candidates
      const candidatesResponse = await fetch(`${backend_url}/api/candidates?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (candidatesResponse.ok) {
        const candidatesResult = await candidatesResponse.json();
        setCandidatesData(candidatesResult.data || []);
      }

      // Fetch submissions data
      const submissionsResponse = await fetch(`${backend_url}/api/candidates/submissions/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (submissionsResponse.ok) {
        const submissionsResult = await submissionsResponse.json();
        setSubmissionsData(submissionsResult.data);
      }

      // Fetch job offers data
      const jobOffersResponse = await fetch(`${backend_url}/api/candidates/job-offers/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobOffersResponse.ok) {
        const jobOffersResult = await jobOffersResponse.json();
        setJobOffersData(jobOffersResult.data);
      }

      // Fetch interview schedules data
      const interviewsResponse = await fetch(`${backend_url}/api/candidates/interview-schedules/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (interviewsResponse.ok) {
        const interviewsResult = await interviewsResponse.json();
        setInterviewSchedulesData(interviewsResult.data);
      }

    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatesData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
      case 'Scheduled': return 'success';
      case 'Hired': return 'primary';
      case 'Rejected': return 'danger';
      case 'Interviewed':
      case 'Offered': return 'warning';
      default: return 'secondary';
    }
  };

  const getPerformanceLevel = (submissionCount: number) => {
    if (submissionCount >= 10) return { level: 'High', color: 'success' };
    if (submissionCount >= 5) return { level: 'Medium', color: 'warning' };
    return { level: 'Low', color: 'danger' };
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-4">
          <div className="my-auto mb-2">
            <h2 className="mb-1">🎯 Candidate Dashboard</h2>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={routes.adminDashboard}>
                    <i className="ti ti-smart-home" />
                  </Link>
                </li>
                <li className="breadcrumb-item">Dashboard</li>
                <li className="breadcrumb-item active">Candidate Dashboard</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <select 
                className="form-select" 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
            <div className="me-3">
              <select 
                className="form-select" 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="dead">Dead</option>
                <option value="hired">Hired</option>
                <option value="interviewed">Interviewed</option>
              </select>
            </div>
            <button className="btn btn-primary">
              <i className="ti ti-plus me-1"></i>
              Add Candidate
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-lg bg-primary bg-opacity-10 text-primary">
                      <i className="ti ti-users fs-24"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h3 className="mb-1">{stats.totalCandidates}</h3>
                    <p className="text-muted mb-0">Total Candidates</p>
                    <small className="text-success">
                      <i className="ti ti-trending-up me-1"></i>
                      {stats.newThisWeek} new this week
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-xl-3 col-md-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-lg bg-success bg-opacity-10 text-success">
                      <i className="ti ti-target fs-24"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h3 className="mb-1">{stats.activeCandidates}</h3>
                    <p className="text-muted mb-0">Active Marketing</p>
                    <small className="text-info">
                      <i className="ti ti-target me-1"></i>
                      {stats.avgSubmissions.toFixed(1)} avg submissions
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-lg bg-danger bg-opacity-10 text-danger">
                      <i className="ti ti-alert-triangle fs-24"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h3 className="mb-1">{stats.deadCandidates}</h3>
                    <p className="text-muted mb-0">Dead Candidates</p>
                    <small className="text-danger">
                      <i className="ti ti-alert-triangle me-1"></i>
                      Need attention
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    <div className="avatar avatar-lg bg-info bg-opacity-10 text-info">
                      <i className="ti ti-trophy fs-24"></i>
                    </div>
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h3 className="mb-1">{stats.hiredCandidates}</h3>
                    <p className="text-muted mb-0">Total Hires</p>
                    <small className="text-info">
                      <i className="ti ti-trophy me-1"></i>
                      {stats.totalJobOffers} job offers
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row mb-4">
          <div className="col-xl-4 col-lg-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">📊 Status Distribution</h5>
              </div>
              <div className="card-body">
                <ReactApexChart
                  options={statusDistributionData.options}
                  series={statusDistributionData.series}
                  type="donut"
                  height={300}
                />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">📈 Performance Overview</h5>
              </div>
              <div className="card-body">
                <Chart type="bar" data={performanceChartData} options={performanceChartOptions} />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-lg-12 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">📅 Submission Trends</h5>
              </div>
              <div className="card-body">
                <ReactApexChart
                  options={submissionTrendData.options}
                  series={submissionTrendData.series}
                  type="area"
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers & Dead Candidates */}
        <div className="row mb-4">
          <div className="col-xl-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">🏆 Top Performers</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Position</th>
                        <th>Performance</th>
                        <th>Submissions</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesData
                        .sort((a, b) => (b.submissions?.length || 0) - (a.submissions?.length || 0))
                        .slice(0, 5)
                        .map((candidate) => {
                          const performance = getPerformanceLevel(candidate.submissions?.length || 0);
                          return (
                            <tr key={candidate._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ImageWithBasePath
                                    src={candidate.profileImage ? `uploads/candidates/${candidate.profileImage}` : "assets/img/profiles/avatar-01.jpg"}
                                    alt="User"
                                    className="avatar avatar-sm rounded-circle me-2"
                                    width={32}
                                    height={32}
                                  />
                                  <div>
                                    <h6 className="mb-0">{candidate.firstName} {candidate.lastName}</h6>
                                    <small className="text-muted">{candidate.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{candidate.appliedRole}</td>
                              <td>
                                <span className={`badge bg-${performance.color}`}>
                                  {performance.level}
                                </span>
                              </td>
                              <td>{candidate.submissions?.length || 0}</td>
                              <td>
                                <span className={`badge bg-${getStatusColor(candidate.status)}`}>
                                  {candidate.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">⚠️ Dead Candidates Alert</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Last Activity</th>
                        <th>Days Inactive</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidatesData
                        .filter(c => {
                          const thirtyDaysAgo = new Date();
                          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                          return new Date(c.updatedAt || c.createdAt) < thirtyDaysAgo && c.status === 'New';
                        })
                        .map((candidate) => {
                          const daysInactive = Math.floor(
                            (new Date().getTime() - new Date(candidate.updatedAt || candidate.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                          );
                          return (
                            <tr key={candidate._id}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <ImageWithBasePath
                                    src={candidate.profileImage ? `uploads/candidates/${candidate.profileImage}` : "assets/img/profiles/avatar-01.jpg"}
                                    alt="User"
                                    className="avatar avatar-sm rounded-circle me-2"
                                    width={32}
                                    height={32}
                                  />
                                  <div>
                                    <h6 className="mb-0">{candidate.firstName} {candidate.lastName}</h6>
                                    <small className="text-muted">{candidate.appliedRole}</small>
                                  </div>
                                </div>
                              </td>
                              <td>{new Date(candidate.updatedAt || candidate.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className="badge bg-danger">{daysInactive} days</span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="ti ti-refresh me-1"></i>
                                  Reactivate
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Schedule & Job Offers */}
        <div className="row mb-4">
          <div className="col-xl-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">📅 Upcoming Interviews</h5>
              </div>
              <div className="card-body">
                {candidatesData
                  .filter(c => c.interviews && c.interviews.some((i: any) => i.status === 'Scheduled'))
                  .slice(0, 5)
                  .map((candidate) => {
                    const upcomingInterview = candidate.interviews?.find((i: any) => i.status === 'Scheduled');
                    return (
                      <div key={candidate._id} className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                        <ImageWithBasePath
                          src={candidate.profileImage ? `uploads/candidates/${candidate.profileImage}` : "assets/img/profiles/avatar-01.jpg"}
                          alt="User"
                          className="avatar avatar-sm rounded-circle me-3"
                          width={40}
                          height={40}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{candidate.firstName} {candidate.lastName}</h6>
                          <p className="text-muted mb-1">{candidate.appliedRole}</p>
                          <small className="text-primary">
                            <i className="ti ti-calendar me-1"></i>
                            {new Date(upcomingInterview?.scheduledDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-info">
                            {upcomingInterview?.interviewLevel}
                          </span>
                          <br />
                          <small className="text-muted">{upcomingInterview?.interviewer}</small>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">💼 Job Offers Pipeline</h5>
              </div>
              <div className="card-body">
                {candidatesData
                  .filter(c => c.offerDetails && c.offerDetails.length > 0)
                  .slice(0, 5)
                  .map((candidate) => {
                    const latestOffer = candidate.offerDetails?.[0];
                    return (
                      <div key={candidate._id} className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                        <ImageWithBasePath
                          src={candidate.profileImage ? `uploads/candidates/${candidate.profileImage}` : "assets/img/profiles/avatar-01.jpg"}
                          alt="User"
                          className="avatar avatar-sm rounded-circle me-3"
                          width={40}
                          height={40}
                        />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{candidate.firstName} {candidate.lastName}</h6>
                          <p className="text-muted mb-1">{candidate.appliedRole}</p>
                          {latestOffer?.payRate && (
                            <small className="text-success">
                              <i className="ti ti-currency-dollar me-1"></i>
                              {latestOffer.payRate}
                            </small>
                          )}
                        </div>
                        <div className="text-end">
                          <span className={`badge bg-${getStatusColor(latestOffer?.status || 'draft')}`}>
                            {latestOffer?.status || 'draft'}
                          </span>
                          <br />
                          {latestOffer?.createdAt && (
                            <small className="text-muted">
                              {new Date(latestOffer.createdAt).toLocaleDateString()}
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent">
                <h5 className="card-title mb-0">⚡ Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 col-sm-6 col-12 mb-3">
                    <Link to={routes.candidatesGrid} className="btn btn-primary w-100">
                      <i className="ti ti-users me-2"></i>
                      View All Candidates
                    </Link>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-3">
                    <button className="btn btn-success w-100">
                      <i className="ti ti-plus me-2"></i>
                      Add New Candidate
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-3">
                    <button className="btn btn-info w-100">
                      <i className="ti ti-calendar me-2"></i>
                      Schedule Interview
                    </button>
                  </div>
                  <div className="col-md-3 col-sm-6 col-12 mb-3">
                    <button className="btn btn-warning w-100">
                      <i className="ti ti-file-export me-2"></i>
                      Export Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboardPrototype;
