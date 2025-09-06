import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { backend_url } from "../../../environment";
import { all_routes } from "../../../feature-module/router/all_routes";
import { getAbsenceStats } from "../../../core/services/attendanceSettingsService";
import leaveService from "../../../core/services/leaveService";
import todoService, { Todo } from "../../../core/services/todoService";
import TodoModal from "./TodoModal";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController,
} from "chart.js";
import ReactApexChart from "react-apexcharts";
import ProjectModals from "../../../core/modals/projectModal";
import RequestModals from "../../../core/modals/requestModal";
import { useUser } from '../../../core/context/UserContext';
import activityService, { Activity } from '../../../core/services/activityService';
import Swal from 'sweetalert2';

// TypeScript interfaces for dashboard interviews
interface DashboardInterview {
  _id: string;
  candidateId: string;
  candidateName: string;
  scheduledDate: string;
  interviewLevel: string;
  interviewer: string;
  position: string;
  status: string;
  appliedRole: string;
  candidateProfileImage?: string;
  recruiter?: {
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  interviewLink?: string;
}

interface DashboardInterviewsResponse {
  success: boolean;
  data: DashboardInterview[];
  total: number;
  message?: string;
}

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

// Add CSS styles for todo strike-through effect


const CandidateDashboard = () => {
  const routes = all_routes;
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const [isTodo, setIsTodo] = useState([false, false, false]);

  const [date, setDate] = useState(new Date());

  const [attendanceStats, setAttendanceStats] = useState<{ present: number; totalEmployees: number } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  
  // Add state for candidate statistics
  const [candidateStats, setCandidateStats] = useState({
    totalCandidates: 0,
    newCandidates: 0,
    interviewedCandidates: 0,
    hiredCandidates: 0
  });
  
  // Add state for leave requests
  const [leaveRequestsCount, setLeaveRequestsCount] = useState(0);
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(true);
  
  // Add state for late employees
  const [lateEmployeesCount, setLateEmployeesCount] = useState(0);
  const [lateEmployeesLoading, setLateEmployeesLoading] = useState(true);
  
  // Add state for absent employees
  const [absentEmployeesCount, setAbsentEmployeesCount] = useState(0);
  const [absentEmployeesLoading, setAbsentEmployeesLoading] = useState(true);
  
  // Add state for new hires
  const [newHiresCount, setNewHiresCount] = useState(0);
  const [newHiresLoading, setNewHiresLoading] = useState(true);
  
  // Add state for attendance overview
  const [attendanceOverview, setAttendanceOverview] = useState({
    total: 0,
    present: 0,
    late: 0,
    onLeave: 0,
    absent: 0
  });
  const [attendanceOverviewLoading, setAttendanceOverviewLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Add state for clock-in/out data
  const [clockInOutData, setClockInOutData] = useState({
    present: [] as any[],
    late: [] as any[],
    absent: [] as any[]
  });
  const [clockInOutLoading, setClockInOutLoading] = useState(true);
  const [selectedDesignation, setSelectedDesignation] = useState('All Designations');
  const [selectedClockDate, setSelectedClockDate] = useState('Today');
  const [employeeDesignations, setEmployeeDesignations] = useState<string[]>([]);
  
  // Add state for absent employees (for avatar placeholders)
  const [absentEmployees, setAbsentEmployees] = useState<any[]>([]);
  
  // Add state for employees (for Employees card)
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  
  // Add state for designation statistics
  const [designationStats, setDesignationStats] = useState<any[]>([]);
  const [designationStatsLoading, setDesignationStatsLoading] = useState(false);
  const [designationPercentageChange, setDesignationPercentageChange] = useState(0);
  
  // Add state for todos (for Todo card)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [todoModalOpen, setTodoModalOpen] = useState(false);
  const [currentTodoPage, setCurrentTodoPage] = useState(1);
  const [totalTodoPages, setTotalTodoPages] = useState(1);
  const [totalTodos, setTotalTodos] = useState(0);
  
  // Add state for drag and drop
  const [draggedTodo, setDraggedTodo] = useState<string | null>(null);
  const [dragOverTodo, setDragOverTodo] = useState<string | null>(null);
  
  // Add state for todo description expansion
  const [expandedTodoId, setExpandedTodoId] = useState<string | null>(null);

  // Add state for activities (for Recent Activities card)
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [lastActivitiesUpdate, setLastActivitiesUpdate] = useState<Date | null>(null);

  // Dynamic Performance Chart State
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [performanceEmployees, setPerformanceEmployees] = useState<Array<{_id: string, firstName: string, lastName: string}>>([]);
  const [performanceData, setPerformanceData] = useState<number[]>([]);
  const [originalSubmissionsData, setOriginalSubmissionsData] = useState<number[]>([]);
  const [kpiSettings, setKpiSettings] = useState<any>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('All Employees');
  const [topPerformer, setTopPerformer] = useState<{name: string, submissions: number} | null>(null);
  const [performanceDataType, setPerformanceDataType] = useState<string>('submissions');

  const [performance_chart2, setPerformanceChart2] = useState<any>({
    series: [{
      name: "performance",
      data: [20, 20, 35, 35, 40, 60, 60]
    }],
    chart: {
      height: 288,
      type: 'area',
      zoom: {
        enabled: false
      }
    },
    colors: ['#03C95A'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'straight'
    },
    title: {
      text: '',
      align: 'left'
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => {
          return val + '%'
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  })

  //Attendance ChartJs
  const [chartData, setChartData] = useState({
    labels: ['Late', 'Present', 'On Leave', 'Absent'],
    datasets: [
      {
        label: 'Semi Donut',
        data: [0, 0, 0, 0],
        backgroundColor: ['#0C4B5E', '#03C95A', '#FFC107', '#E70D0D'],
        borderWidth: 5,
        borderRadius: 10,
        borderColor: '#fff',
        hoverBorderWidth: 0,
        cutout: '60%',
      }
    ]
  });
  const [chartOptions, setChartOptions] = useState({
    rotation: -100,
    circumference: 200,
    layout: {
      padding: {
        top: -20,
        bottom: -20,
      }
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
  });

  // Add state for submissions overview
  const [submissionsData, setSubmissionsData] = useState<any[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [selectedSubmissionEmployee, setSelectedSubmissionEmployee] = useState('All Employees');
  const [submissionEmployees, setSubmissionEmployees] = useState<any[]>([]);
  const [submissionsDataType, setSubmissionsDataType] = useState<string>('submissions');

  // Add state for birthdays
  const [birthdays, setBirthdays] = useState({
    today: [] as any[],
    tomorrow: [] as any[],
    upcoming: [] as any[]
  });
  const [birthdaysLoading, setBirthdaysLoading] = useState(true);

  // Add state for interviews/schedules
  const [interviews, setInterviews] = useState<DashboardInterview[]>([]);
  const [interviewsLoading, setInterviewsLoading] = useState(true);

  // Add state for submissions chart
  const [submissionsChartData, setSubmissionsChartData] = useState<any>({
    chart: {
      height: 290,
      type: 'bar',
      stacked: false,
      toolbar: {
        show: false,
      }
    },
    colors: ['#FF6F28'],
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        endingShape: 'rounded'
      },
    },
    series: [{
      name: 'Monthly Data',
      data: []
    }],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '13px',
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: '#6B7280',
          fontSize: '13px',
        }
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      padding: {
        left: -8,
      },
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1
    },
  });

  useEffect(() => {
    setAttendanceLoading(true);
    getAbsenceStats()
      .then((stats) => {
        // Backend now provides present as onTime + late, so use it directly
        setAttendanceStats({ present: stats.present, totalEmployees: stats.totalEmployees });
      })
      .catch(() => {
        setAttendanceStats(null);
      })
      .finally(() => setAttendanceLoading(false));
    
    fetchLateEmployeesCount();
    fetchAbsentEmployeesCount();
    fetchNewHiresCount(); // Fetch new hires count on component mount
    fetchAttendanceOverview(); // Fetch attendance overview data
    fetchClockInOutData(); // Fetch clock-in/out data on component mount
    fetchEmployeeDesignations(); // Fetch employee designations on component mount
    fetchDesignationStats(); // Fetch designation statistics on component mount
    // fetchEmployees(); // Fetch employees data on component mount - moved to user effect
  }, []);

  // Fetch employees when user is loaded
  useEffect(() => {
    if (user && !isLoading) {
      fetchEmployees();
      fetchTodos(1);
    }
  }, [user, isLoading]);

  // Update chart data when attendance overview changes
  useEffect(() => {
    setChartData({
      labels: ['Late', 'On Time', 'On Leave', 'Absent'],
      datasets: [
        {
          label: 'Semi Donut',
          data: [
            attendanceOverview.late,
            attendanceOverview.present - attendanceOverview.late, // onTime = present - late
            attendanceOverview.onLeave,
            attendanceOverview.absent
          ],
          backgroundColor: ['#0C4B5E', '#03C95A', '#FFC107', '#E70D0D'],
          borderWidth: 5,
          borderRadius: 10,
          borderColor: '#fff',
          hoverBorderWidth: 0,
          cutout: '60%',
        }
      ]
    });
  }, [attendanceOverview]);

  // Update designation chart when designation stats change
  useEffect(() => {
    if (designationStats.length > 0) {
      const categories = designationStats.map(stat => stat._id);
      const data = designationStats.map(stat => stat.count);
      
      setEmpDepartment((prev: any) => ({
        ...prev,
        series: [{
          ...prev.series[0],
          data: data
        }],
        xaxis: {
          ...prev.xaxis,
          categories: categories
        }
      }));
    }
  }, [designationStats]);

  // Function to fetch pending leave requests count
  const fetchPendingLeaveRequests = async () => {
    try {
      setLeaveRequestsLoading(true);
      
      const response = await leaveService.getAllLeaveRequests({ 
        page: 1, 
        limit: 1000, // Get all to count pending ones
      });
      
      // Count only pending leave requests
      const pendingLeaves = response.data.filter((leave: any) => leave.status === 'New');
      const pendingCount = pendingLeaves.length;
      
      console.log('Leave requests count:', pendingCount);
      setLeaveRequestsCount(pendingCount);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      setLeaveRequestsCount(0);
    } finally {
      setLeaveRequestsLoading(false);
    }
  };

  // Function to fetch late employees count
  const fetchLateEmployeesCount = async () => {
    try {
      setLateEmployeesLoading(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch attendance data for today using the correct endpoint
      const response = await fetch(`${backend_url}/api/attendance?startDate=${today}&endDate=${today}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        // Count employees with 'Late' status
        const lateCount = data.filter((attendance: any) => attendance.status === 'Late').length;
        const totalCount = data.length;
        
        console.log('Late employees count:', lateCount, 'Total:', totalCount);
        setLateEmployeesCount(lateCount);
      } else {
        console.error('Error fetching attendance data');
        setLateEmployeesCount(0);
      }
    } catch (error) {
      console.error('Error fetching late employees:', error);
      setLateEmployeesCount(0);
    } finally {
      setLateEmployeesLoading(false);
    }
  };

  // Function to fetch absent employees count
  const fetchAbsentEmployeesCount = async () => {
    try {
      setAbsentEmployeesLoading(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch attendance data for today using the correct endpoint
      const response = await fetch(`${backend_url}/api/attendance?startDate=${today}&endDate=${today}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        // Count employees with 'Absent' status
        const absentCount = data.filter((attendance: any) => attendance.status === 'Absent').length;
        const totalCount = data.length;
        
        console.log('Absent employees count:', absentCount, 'Total:', totalCount);
        setAbsentEmployeesCount(absentCount);
      } else {
        console.error('Error fetching attendance data');
        setAbsentEmployeesCount(0);
      }
    } catch (error) {
      console.error('Error fetching absent employees:', error);
      setAbsentEmployeesCount(0);
    } finally {
      setAbsentEmployeesLoading(false);
    }
  };

  // Function to fetch new hires count for current month
  const fetchNewHiresCount = async () => {
    try {
      setNewHiresLoading(true);
      
      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = startOfMonth.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      // Fetch employees who joined in current month
      const response = await fetch(`${backend_url}/api/employees?startDate=${startDate}&endDate=${endDate}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Count employees who joined in current month
        const newHires = data.filter((employee: any) => {
          const joinDate = new Date(employee.joinDate);
          return joinDate >= startOfMonth && joinDate <= endOfMonth;
        });
        
        console.log('New hires count for current month:', newHires.length);
        setNewHiresCount(newHires.length);
      } else {
        console.error('Error fetching new hires data');
        setNewHiresCount(0);
      }
    } catch (error) {
      console.error('Error fetching new hires:', error);
      setNewHiresCount(0);
    } finally {
      setNewHiresLoading(false);
    }
  };

  // Function to fetch attendance overview data
  const fetchAttendanceOverview = async (date: string = selectedDate) => {
    try {
      setAttendanceOverviewLoading(true);
      
      // Fetch attendance data for the selected date using the correct endpoint
      const response = await fetch(`${backend_url}/api/attendance?startDate=${date}&endDate=${date}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        
        console.log('Raw attendance data:', data);
        
        // Count attendance by status
        const onTime = data.filter((attendance: any) => attendance.status === 'Present').length;
        const late = data.filter((attendance: any) => attendance.status === 'Late').length;
        const onLeave = data.filter((attendance: any) => attendance.status === 'On Leave').length;
        const absent = data.filter((attendance: any) => attendance.status === 'Absent').length;
        const total = data.length;
        
        // Calculate present as onTime + late (same as backend logic)
        const present = onTime + late;
        
        // Store absent employees for avatar placeholders
        const absentEmployeesData = data.filter((attendance: any) => attendance.status === 'Absent');
        setAbsentEmployees(absentEmployeesData);
        
        setAttendanceOverview({
          total,
          present,
          late,
          onLeave,
          absent
        });
        
        console.log('Attendance overview:', { total, present, late, onLeave, absent });
        console.log('Absent employees:', absentEmployeesData);
      } else {
        console.error('Error fetching attendance overview data');
        setAttendanceOverview({ total: 0, present: 0, late: 0, onLeave: 0, absent: 0 });
        setAbsentEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching attendance overview:', error);
      setAttendanceOverview({ total: 0, present: 0, late: 0, onLeave: 0, absent: 0 });
      setAbsentEmployees([]);
    } finally {
      setAttendanceOverviewLoading(false);
    }
  };

  // Function to fetch clock-in/out data
  const fetchClockInOutData = async (date: string = 'today', designation: string = 'All Designations') => {
    try {
      setClockInOutLoading(true);
      
      let targetDate = new Date().toISOString().split('T')[0];
      if (date === 'yesterday') {
        targetDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (date === 'week') {
        targetDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
      
      // Fetch attendance data for the selected date
      const response = await fetch(`${backend_url}/api/attendance?startDate=${targetDate}&endDate=${targetDate}&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        
        // Filter by designation if not "All Designations"
        let filteredData = data;
        if (designation !== 'All Designations') {
          filteredData = data.filter((attendance: any) => 
            attendance.employeeId?.designation === designation
          );
        }
        
        // Categorize attendance data
        const present = filteredData.filter((attendance: any) => attendance.status === 'Present');
        const late = filteredData.filter((attendance: any) => attendance.status === 'Late');
        const absent = filteredData.filter((attendance: any) => attendance.status === 'Absent');
        
        setClockInOutData({
          present,
          late,
          absent
        });
        
        console.log('Clock-in/out data:', { present: present.length, late: late.length, absent: absent.length });
      } else {
        console.error('Error fetching clock-in/out data');
        setClockInOutData({ present: [], late: [], absent: [] });
      }
    } catch (error) {
      console.error('Error fetching clock-in/out data:', error);
      setClockInOutData({ present: [], late: [], absent: [] });
    } finally {
      setClockInOutLoading(false);
    }
  };

  // Function to fetch employee designations
  const fetchEmployeeDesignations = async () => {
    try {
      // Fetch all employees to get unique designations
      const response = await fetch(`${backend_url}/api/employees?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.data || [];
        
        // Extract unique designations
        const designations = data
          .map((employee: any) => employee.designation)
          .filter((designation: string, index: number, arr: string[]) => 
            designation && arr.indexOf(designation) === index
          );
        
        setEmployeeDesignations(designations);
        console.log('Employee designations:', designations);
      } else {
        console.error('Error fetching employee designations');
        setEmployeeDesignations([]);
      }
    } catch (error) {
      console.error('Error fetching employee designations:', error);
      setEmployeeDesignations([]);
    }
  };

  // Function to get badge color based on department/designation
  const getDepartmentBadgeColor = (department: string): string => {
    if (!department) return 'secondary';
    
    const departmentLower = department.toLowerCase();
    
    if (departmentLower.includes('development') || departmentLower.includes('developer') || departmentLower.includes('programmer')) {
      return 'danger';
    } else if (departmentLower.includes('design') || departmentLower.includes('ui') || departmentLower.includes('ux')) {
      return 'pink';
    } else if (departmentLower.includes('marketing') || departmentLower.includes('sales')) {
      return 'info';
    } else if (departmentLower.includes('finance') || departmentLower.includes('accounting')) {
      return 'secondary';
    } else if (departmentLower.includes('hr') || departmentLower.includes('human')) {
      return 'primary';
    } else if (departmentLower.includes('manager') || departmentLower.includes('lead')) {
      return 'purple';
    } else if (departmentLower.includes('admin') || departmentLower.includes('executive')) {
      return 'warning';
    } else {
      return 'secondary';
    }
  };

  // Function to fetch designation statistics
  const fetchDesignationStats = async () => {
    setDesignationStatsLoading(true);
    try {
      console.log('Fetching designation stats...');
      const response = await fetch(`${backend_url}/api/employees/stats/designations?period=all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Designation stats response status:', response.status);
      const result = await response.json();
      console.log('Designation stats result:', result);
      if (result.success) {
        setDesignationStats(result.data.designations);
        setDesignationPercentageChange(result.data.percentageChange);
        console.log('Designation stats set successfully:', result.data.designations);
      }
    } catch (error) {
      console.error('Error fetching designation stats:', error);
    } finally {
      setDesignationStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignationStats();
  }, []); // Remove selectedDesignationPeriod dependency

  // Function to fetch employees for the Employees card
  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      
      // Only fetch if user is authenticated and has admin/HR role
      if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
        console.log('User not authenticated or not admin/HR role:', user);
        setEmployees([]);
        return;
      }
      
      console.log('Fetching employees with token:', localStorage.getItem('token'));
      
      // Fetch employees data
      const response = await fetch(`${backend_url}/api/employees?limit=7`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Employees API response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Employees API result:', result);
        
        // The API returns the array directly, not wrapped in a data property
        const data = Array.isArray(result) ? result : (result.data || []);
        console.log('Employees data array:', data);
        
        setEmployees(data);
        console.log('Employees data set successfully:', data);
      } else {
        const errorText = await response.text();
        console.error('Error fetching employees data. Status:', response.status, 'Response:', errorText);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Function to fetch todos for the Todo card
  const fetchTodos = async (page: number = 1) => {
    try {
      setTodosLoading(true);
      
      const result = await todoService.getDashboardTodos({ page });
      setTodos(result.data);
      setCurrentTodoPage(result.page);
      setTotalTodoPages(result.totalPages);
      setTotalTodos(result.total);
      console.log('Todos fetched:', result.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setTodos([]);
    } finally {
      setTodosLoading(false);
    }
  };

  // Function to toggle todo completion
  const toggleTodoCompletion = async (todoId: string) => {
    try {
      const updatedTodo = await todoService.toggleTodo(todoId);
      setTodos(prev => prev.map(todo => 
        todo._id === todoId ? updatedTodo : todo
      ));
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  // Function to handle todo creation
  const handleTodoCreated = () => {
    fetchTodos(1); // Reset to first page when new todo is created
  };

  // Function to handle todo deletion
  const handleTodoDelete = async (todoId: string) => {
    try {
      await todoService.deleteTodo(todoId);
      // Refresh current page
      fetchTodos(currentTodoPage);
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // Function to handle todo item click for description expansion
  const handleTodoClick = (todoId: string) => {
    setExpandedTodoId(expandedTodoId === todoId ? null : todoId);
  };

  // Drag and drop handlers for todos
  const handleDragStart = (e: React.DragEvent, todoId: string) => {
    setDraggedTodo(todoId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, todoId: string) => {
    e.preventDefault();
    if (draggedTodo && draggedTodo !== todoId) {
      setDragOverTodo(todoId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTodo(null);
  };

  const handleDrop = async (e: React.DragEvent, targetTodoId: string) => {
    e.preventDefault();
    if (!draggedTodo || draggedTodo === targetTodoId) {
      setDraggedTodo(null);
      setDragOverTodo(null);
      return;
    }

    try {
      // Get current todos
      const currentTodos = [...todos];
      const draggedIndex = currentTodos.findIndex(todo => todo._id === draggedTodo);
      const targetIndex = currentTodos.findIndex(todo => todo._id === targetTodoId);
      
      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedTodo(null);
        setDragOverTodo(null);
        return;
      }

      // Reorder todos
      const [draggedTodoItem] = currentTodos.splice(draggedIndex, 1);
      currentTodos.splice(targetIndex, 0, draggedTodoItem);
      
      // Update state
      setTodos(currentTodos);
      
      // TODO: Update backend to persist the new order
      // For now, we'll just update the frontend state
      
    } catch (error) {
      console.error('Error reordering todos:', error);
    } finally {
      setDraggedTodo(null);
      setDragOverTodo(null);
    }
  };

  // Handle click on leave requests link
  const handleLeaveRequestsClick = () => {
    // Refresh the count before navigating
    fetchPendingLeaveRequests();
  };

  // Performance Chart Data Fetching Functions
  const fetchPerformanceEmployees = async () => {
    try {
      const response = await fetch(`${backend_url}/api/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPerformanceEmployees(data);
      } else {
        console.error('Error fetching employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchKpiSettings = async () => {
    try {
      const response = await fetch(`${backend_url}/api/performance-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setKpiSettings(result.data);
      } else {
        console.error('Error fetching KPI settings');
      }
    } catch (error) {
      console.error('Error fetching KPI settings:', error);
    }
  };

  const fetchIndividualEmployeePerformance = async (dataType: string = 'submissions') => {
    try {
      const employeeData = [];
      
      // Determine endpoint and data key based on data type
      let endpoint = '';
      let dataKey = '';
      
      switch (dataType) {
        case 'submissions':
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=`;
          dataKey = 'submissions';
          break;
        case 'job-offers':
          endpoint = `${backend_url}/api/candidates/job-offers/dashboard?employeeId=`;
          dataKey = 'jobOffers';
          break;
        case 'interview-schedules':
          endpoint = `${backend_url}/api/candidates/interview-schedules/dashboard?employeeId=`;
          dataKey = 'interviewSchedules';
          break;
        default:
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=`;
          dataKey = 'submissions';
      }
      
      for (const employee of performanceEmployees) {
        const response = await fetch(`${endpoint}${employee._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`Employee ${employee.firstName} ${employee.lastName} (${dataType}):`, result.data[dataKey]);
          employeeData.push({
            employeeId: employee._id,
            monthlySubmissions: result.data[dataKey] || []
          });
        }
      }
      return employeeData;
    } catch (error) {
      console.error('Error fetching individual employee performance:', error);
      return [];
    }
  };

  const calculateAveragePerformance = (employeeData: any[], highKPI: number) => {
    const months = 12;
    const averagePerformance = [];
    
    console.log('Calculating average performance for', employeeData.length, 'employees with highKPI:', highKPI);
    
    for (let month = 0; month < months; month++) {
      let totalSubmissions = 0;
      let employeeCount = 0;
      
      // Sum submissions for this month across all employees
      employeeData.forEach(emp => {
        if (emp.monthlySubmissions && emp.monthlySubmissions[month] !== undefined) {
          totalSubmissions += emp.monthlySubmissions[month];
          employeeCount++;
        }
      });
      
      // Calculate average submissions for this month
      const averageSubmissions = employeeCount > 0 ? totalSubmissions / employeeCount : 0;
      
      // Calculate performance percentage based on average
      const performancePercentage = Math.min((averageSubmissions / highKPI) * 100, 100);
      
      console.log(`Month ${month}: total=${totalSubmissions}, count=${employeeCount}, avg=${averageSubmissions}, performance=${performancePercentage}%`);
      
      averagePerformance.push(performancePercentage);
    }
    
    return averagePerformance;
  };

  const calculateAverageData = (employeeData: any[]) => {
    const months = 12;
    const averageData = [];
    
    console.log('Calculating average data for tooltip for', employeeData.length, 'employees');
    
    for (let month = 0; month < months; month++) {
      let totalData = 0;
      let employeeCount = 0;
      
      employeeData.forEach(emp => {
        if (emp.monthlySubmissions && emp.monthlySubmissions[month] !== undefined) {
          totalData += emp.monthlySubmissions[month];
          employeeCount++;
        }
      });
      
      const averageDataValue = employeeCount > 0 ? totalData / employeeCount : 0;
      console.log(`Month ${month}: total=${totalData}, count=${employeeCount}, avg=${averageDataValue}`);
      averageData.push(averageDataValue);
    }
    
    return averageData;
  };

  const calculateTopPerformer = async (dataType: string = 'submissions') => {
    try {
      console.log('Calculating top performer for employees:', performanceEmployees.length, 'dataType:', dataType);
      let maxData = 0;
      let topEmployee = null;
      const currentMonth = new Date().getMonth(); // 0-11 (Jan = 0, Dec = 11)
      
      console.log('Current month:', currentMonth);
      
      // Determine endpoint and data key based on data type
      let endpoint = '';
      let dataKey = '';
      let dataLabel = '';
      
      switch (dataType) {
        case 'submissions':
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=`;
          dataKey = 'submissions';
          dataLabel = 'submissions';
          break;
        case 'job-offers':
          endpoint = `${backend_url}/api/candidates/job-offers/dashboard?employeeId=`;
          dataKey = 'jobOffers';
          dataLabel = 'job offers';
          break;
        case 'interview-schedules':
          endpoint = `${backend_url}/api/candidates/interview-schedules/dashboard?employeeId=`;
          dataKey = 'interviewSchedules';
          dataLabel = 'interview schedules';
          break;
        default:
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=`;
          dataKey = 'submissions';
          dataLabel = 'submissions';
      }
      
      for (const employee of performanceEmployees) {
        const response = await fetch(`${endpoint}${employee._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          const monthlyData = result.data[dataKey] || [];
          const currentMonthData = monthlyData[currentMonth] || 0;
          
          console.log(`${employee.firstName} ${employee.lastName}: ${currentMonthData} ${dataLabel} this month`);
          
          if (currentMonthData > maxData) {
            maxData = currentMonthData;
            topEmployee = {
              name: `${employee.firstName} ${employee.lastName}`,
              submissions: currentMonthData
            };
          }
        } else {
          console.error(`Failed to fetch data for ${employee.firstName} ${employee.lastName}`);
        }
      }
      
      console.log('Top performer result:', topEmployee);
      
      // If no one has data this month, show a fallback
      if (!topEmployee && performanceEmployees.length > 0) {
        topEmployee = {
          name: `No ${dataLabel} this month`,
          submissions: 0
        };
      }
      
      setTopPerformer(topEmployee);
    } catch (error) {
      console.error('Error calculating top performer:', error);
    }
  };

  const fetchPerformanceData = async (employeeId: string, dataType: string = 'submissions') => {
    try {
      setPerformanceLoading(true);
      
      // Determine endpoint based on data type
      let endpoint = '';
      let dataKey = '';
      
      switch (dataType) {
        case 'submissions':
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=${employeeId}`;
          dataKey = 'submissions';
          break;
        case 'job-offers':
          endpoint = `${backend_url}/api/candidates/job-offers/dashboard?employeeId=${employeeId}`;
          dataKey = 'jobOffers';
          break;
        case 'interview-schedules':
          endpoint = `${backend_url}/api/candidates/interview-schedules/dashboard?employeeId=${employeeId}`;
          dataKey = 'interviewSchedules';
          break;
        default:
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=${employeeId}`;
          dataKey = 'submissions';
      }
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const monthlyData = result.data[dataKey] || [];
        
        // Store original data for tooltip
        setOriginalSubmissionsData(monthlyData);
        
        // Calculate performance percentages if KPI settings are available
        // Map data type to KPI settings key
        const kpiKey = dataType === 'job-offers' ? 'jobOffers' : 
                      dataType === 'interview-schedules' ? 'interviews' : 'submissions';
        
        if (kpiSettings && kpiSettings[kpiKey]) {
          const highKPI = kpiSettings[kpiKey].high;
          console.log(`Performance calculation for ${dataType}:`, {
            kpiKey,
            highKPI,
            monthlyData,
            kpiSettings: kpiSettings[kpiKey]
          });
          
          let performancePercentages: number[];
          if (employeeId === 'all') {
            // For "All Employees", use the aggregated data directly from the API
            // The API already returns the total submissions for all employees
            performancePercentages = monthlyData.map((data: number) => 
              Math.min((data / highKPI) * 100, 100)
            );
            
            // For "All Employees", we don't need to calculate average data
            // The monthlyData already contains the total submissions
            setOriginalSubmissionsData(monthlyData);
          } else {
            // For individual employees, use normal calculation
            performancePercentages = monthlyData.map((data: number) => 
              Math.min((data / highKPI) * 100, 100)
            );
          }
          
          setPerformanceData(performancePercentages);
          
          // Update chart data with enhanced tooltip
          setPerformanceChart2((prev: any) => ({
            ...prev,
            series: [{
              name: "performance",
              data: performancePercentages
            }],
            tooltip: {
              y: {
                formatter: function(val: number, { dataPointIndex }: any) {
                  const isAllEmployees = employeeId === 'all';
                  const originalData = isAllEmployees ? (originalSubmissionsData[dataPointIndex] || 0) : (monthlyData[dataPointIndex] || 0);
                  const dataLabel = dataType === 'submissions' ? 'submissions' : 
                                   dataType === 'job-offers' ? 'job offers' : 'interview schedules';
                  const totalLabel = isAllEmployees ? 'total ' : '';
                  return `${val}% (${Math.round(originalData)} ${totalLabel}${dataLabel})`;
                }
              },
              style: {
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              },
              custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
                // Get month name from chart labels or fallback to month array
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = w.globals.labels && w.globals.labels[dataPointIndex] ? w.globals.labels[dataPointIndex] : monthNames[dataPointIndex];
                const performanceValue = series[seriesIndex][dataPointIndex];
                const isAllEmployees = employeeId === 'all';
                const originalData = isAllEmployees ? (originalSubmissionsData[dataPointIndex] || 0) : (monthlyData[dataPointIndex] || 0);
                
                const dataLabel = dataType === 'submissions' ? 'submissions' : 
                                 dataType === 'job-offers' ? 'job offers' : 'interview schedules';
                const totalLabel = isAllEmployees ? 'total ' : '';
                
                return `
                  <div style="
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    min-width: 180px;
                    font-family: Helvetica, Arial, sans-serif;
                    overflow: hidden;
                  ">
                    <div style="
                      background: #f8f9fa;
                      padding: 8px 12px;
                      font-weight: 600;
                      color: #6b7280;
                      font-size: 12px;
                      border-bottom: 1px solid #e5e7eb;
                    ">${month}</div>
                    <div style="padding: 12px;">
                      <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                        performance: <span style="color: #03C95A; font-weight: 600;">${Math.round(performanceValue)}%</span>
                      </div>
                      <div style="color: #6b7280; font-size: 14px;">
                        ${totalLabel}${dataLabel}: <span style="color: #374151; font-weight: 600;">${Math.round(originalData * (isAllEmployees ? 1 : 1))}</span>
                      </div>
                    </div>
                  </div>
                `;
              }
            }
          }));
        } else {
          // Fallback to raw data if KPI settings not available
          console.log(`No KPI settings available for ${dataType} (${kpiKey}):`, {
            kpiSettings,
            kpiKey,
            dataType
          });
          
          // For "All Employees", use the aggregated data directly
          if (employeeId === 'all') {
            // The monthlyData already contains the total submissions for all employees
            setOriginalSubmissionsData(monthlyData);
          } else {
            setOriginalSubmissionsData(monthlyData);
          }
          
          setPerformanceData(monthlyData);
          setPerformanceChart2((prev: any) => ({
            ...prev,
            series: [{
              name: "performance",
              data: monthlyData
            }],
            tooltip: {
              y: {
                formatter: function(val: number, { dataPointIndex }: any) {
                  const isAllEmployees = employeeId === 'all';
                  const originalData = isAllEmployees ? (originalSubmissionsData[dataPointIndex] || 0) : (monthlyData[dataPointIndex] || 0);
                  const dataLabel = dataType === 'submissions' ? 'submissions' : 
                                   dataType === 'job-offers' ? 'job offers' : 'interview schedules';
                  const totalLabel = isAllEmployees ? 'total ' : '';
                  return `${val}% (${Math.round(originalData)} ${totalLabel}${dataLabel})`;
                }
              },
              style: {
                fontSize: '14px',
                fontFamily: 'Helvetica, Arial, sans-serif'
              },
              custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
                // Get month name from chart labels or fallback to month array
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const month = w.globals.labels && w.globals.labels[dataPointIndex] ? w.globals.labels[dataPointIndex] : monthNames[dataPointIndex];
                const performanceValue = series[seriesIndex][dataPointIndex];
                const isAllEmployees = employeeId === 'all';
                const originalData = isAllEmployees ? (originalSubmissionsData[dataPointIndex] || 0) : (monthlyData[dataPointIndex] || 0);
                
                const dataLabel = dataType === 'submissions' ? 'submissions' : 
                                 dataType === 'job-offers' ? 'job offers' : 'interview schedules';
                const totalLabel = isAllEmployees ? 'total ' : '';
                
                return `
                  <div style="
                    background: #fff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    min-width: 180px;
                    font-family: Helvetica, Arial, sans-serif;
                    overflow: hidden;
                  ">
                    <div style="
                      background: #f8f9fa;
                      padding: 8px 12px;
                      font-weight: 600;
                      color: #6b7280;
                      font-size: 12px;
                      border-bottom: 1px solid #e5e7eb;
                    ">${month}</div>
                    <div style="padding: 12px;">
                      <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">
                        performance: <span style="color: #03C95A; font-weight: 600;">${Math.round(performanceValue)}%</span>
                      </div>
                      <div style="color: #6b7280; font-size: 14px;">
                        ${totalLabel}${dataLabel}: <span style="color: #374151; font-weight: 600;">${Math.round(originalData * (isAllEmployees ? 1 : 1))}</span>
                      </div>
                    </div>
                  </div>
                `;
              }
            }
          }));
        }
      } else {
        console.error('Error fetching performance data');
        setPerformanceData([]);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setPerformanceData([]);
    } finally {
      setPerformanceLoading(false);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    if (employeeId === 'all') {
      setSelectedEmployeeName('All Employees');
    } else {
      const employee = performanceEmployees.find(emp => emp._id === employeeId);
      setSelectedEmployeeName(employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee');
    }
    fetchPerformanceData(employeeId, performanceDataType);
  };

  // Fetch pending leave requests count on component mount and refresh periodically
  useEffect(() => {
    // Only fetch if user is authenticated and has admin/HR role
    if (user && (user.role === 'admin' || user.role === 'hr')) {
      fetchPendingLeaveRequests();
      
      // Refresh leave count every 30 seconds
      const interval = setInterval(() => {
        fetchPendingLeaveRequests();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch performance data when component mounts
  useEffect(() => {
    if (user && !isLoading) {
      fetchPerformanceEmployees();
      fetchKpiSettings();
      fetchPerformanceData('all', performanceDataType);
    }
  }, [user, isLoading]);

  // Calculate top performer when employees are loaded
  useEffect(() => {
    if (performanceEmployees.length > 0) {
      console.log('Triggering top performer calculation for', performanceEmployees.length, 'employees');
      calculateTopPerformer(performanceDataType);
    }
  }, [performanceEmployees, performanceDataType]);

  // Refetch performance data when KPI settings change
  useEffect(() => {
    if (kpiSettings && selectedEmployee) {
      fetchPerformanceData(selectedEmployee, performanceDataType);
    }
  }, [kpiSettings, performanceDataType]);

  //New Chart
  const [empDepartment, setEmpDepartment] = useState<any>({
    chart: {
      height: 235,
      type: 'bar',
      padding: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      toolbar: {
        show: false,
      }
    },
    fill: {
      colors: ['#F26522'], // Fill color for the bars
      opacity: 1, // Adjust opacity (1 is fully opaque)
    },
    colors: ['#F26522'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      padding: {
        top: -20,
        left: 0,
        right: 0,
        bottom: 0
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: true,
        barHeight: '35%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    series: [{
      data: [],
      name: 'Employee'
    }],
    xaxis: {
      categories: [],
      labels: {
        style: {
          colors: '#111827',
          fontSize: '13px',
        }
      }
    }
  })

  const [salesIncome] = useState<any>({
    chart: {
      height: 290,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      }
    },
    colors: ['#FF6F28', '#F8F9FA'],
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: 'all',
        horizontal: false,
        endingShape: 'rounded'
      },
    },
    series: [{
      name: 'Income',
      data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80]
    }, {
      name: 'Expenses',
      data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20]
    }],
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '13px',
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -15,
        style: {
          colors: '#6B7280',
          fontSize: '13px',
        }
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      padding: {
        left: -8,
      },
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false // Disable data labels
    },
    fill: {
      opacity: 1
    },
  })

  //Semi Donut ChartJs
  const [semidonutData, setSemidonutData] = useState({
      labels: ["Ongoing", "Onhold", "Completed", "Overdue"],
      datasets: [
        {
          label: 'Semi Donut',
          data: [20, 40, 20, 10],
          backgroundColor: ['#FFC107', '#1B84FF', '#03C95A', '#E70D0D'],
          borderWidth: -10,
        borderColor: 'transparent',
        hoverBorderWidth: 0,
          cutout: '75%',
          spacing: -30,
        },
      ],
  });
  const [semidonutOptions, setSemidonutOptions] = useState({
      rotation: -100,
      circumference: 185,
      layout: {
        padding: {
        top: -20,
        bottom: 20,
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
        display: false
      }
    }
  });
  const toggleTodo = (index: number) => {
    setIsTodo((prevIsTodo) => {
      const newIsTodo = [...prevIsTodo];
      newIsTodo[index] = !newIsTodo[index];
      return newIsTodo;
    });
  };

  const profileImg = user && user.profileImage ? `${backend_url}/uploads/${user.profileImage}` : 'assets/img/profiles/avatar-31.jpg';

  // Function to fetch submissions data from backend
  const fetchSubmissionsData = async (selectedEmployee: string = 'All Employees', dataType: string = 'submissions') => {
    try {
      setSubmissionsLoading(true);
      
      // Get employee ID from selected employee name
      let employeeId = 'all';
      if (selectedEmployee !== 'All Employees') {
        const employee = submissionEmployees.find(emp => emp.name === selectedEmployee);
        if (employee) {
          employeeId = employee.id;
        }
      }
      
      // Determine endpoint based on data type
      let endpoint = '';
      let dataKey = '';
      let seriesName = '';
      
      switch (dataType) {
        case 'submissions':
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=${employeeId}`;
          dataKey = 'submissions';
          seriesName = 'Monthly Submissions';
          break;
        case 'job-offers':
          endpoint = `${backend_url}/api/candidates/job-offers/dashboard?employeeId=${employeeId}`;
          dataKey = 'jobOffers';
          seriesName = 'Monthly Job Offers';
          break;
        case 'interview-schedules':
          endpoint = `${backend_url}/api/candidates/interview-schedules/dashboard?employeeId=${employeeId}`;
          dataKey = 'interviewSchedules';
          seriesName = 'Monthly Interview Schedules';
          break;
        default:
          endpoint = `${backend_url}/api/candidates/submissions/dashboard?employeeId=${employeeId}`;
          dataKey = 'submissions';
          seriesName = 'Monthly Submissions';
      }
      
      const response = await fetch(endpoint, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`, 
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        const { months } = result.data;
        const data = result.data[dataKey] || [];
        
        setSubmissionsData(data);
        
        // Update chart data
        const chartData = {
          ...submissionsChartData,
          series: [{
            name: seriesName,
            data: data
          }],
          xaxis: {
            ...submissionsChartData.xaxis,
            categories: months
          }
        };
        
        setSubmissionsChartData(chartData);
      } else {
        console.error(`Error fetching ${dataType} data:`, response.statusText);
        setSubmissionsData([]);
      }
    } catch (error) {
      console.error(`Error fetching ${dataType} data:`, error);
      setSubmissionsData([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Handler for data type changes
  const handleSubmissionsDataTypeChange = (dataType: string) => {
    setSubmissionsDataType(dataType);
    fetchSubmissionsData(selectedSubmissionEmployee, dataType);
  };

  // Handler for performance data type changes
  const handlePerformanceDataTypeChange = (dataType: string) => {
    setPerformanceDataType(dataType);
    fetchPerformanceData(selectedEmployee, dataType);
  };

  // Function to fetch employees for submissions filter
  const fetchSubmissionEmployees = async () => {
    try {
      const response = await fetch(`${backend_url}/api/employees?limit=1000`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const employees = await response.json();
        
        // Format employees for dropdown
        const formattedEmployees = employees.map((employee: any) => ({
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          designation: employee.designation
        }));
        
        setSubmissionEmployees(formattedEmployees);
      } else {
        console.error('Error fetching employees for submissions');
        setSubmissionEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching submission employees:', error);
      setSubmissionEmployees([]);
    }
  };

  // Function to fetch birthdays data
  const fetchBirthdays = async () => {
    try {
      setBirthdaysLoading(true);
      const response = await fetch(`${backend_url}/api/employees/birthdays/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBirthdays(result.data);
        } else {
          console.error('Error fetching birthdays:', result.message);
          setBirthdays({ today: [], tomorrow: [], upcoming: [] });
        }
      } else {
        console.error('Error fetching birthdays:', response.statusText);
        setBirthdays({ today: [], tomorrow: [], upcoming: [] });
      }
    } catch (error) {
      console.error('Error fetching birthdays:', error);
      setBirthdays({ today: [], tomorrow: [], upcoming: [] });
    } finally {
      setBirthdaysLoading(false);
    }
  };

  // Function to get badge color based on interview level
  const getInterviewBadgeColor = (level: string): string => {
    switch (level) {
      case 'L1': return 'secondary';
      case 'L2': return 'info';
      case 'L3': return 'warning';
      default: return 'secondary';
    }
  };

  // Function to format interview time
  const formatInterviewTime = (date: string) => {
    const interviewDate = new Date(date);
    return interviewDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Function to format interview date
  const formatInterviewDate = (date: string) => {
    const interviewDate = new Date(date);
    return interviewDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Function to fetch interviews data
  const fetchInterviews = async () => {
    try {
      setInterviewsLoading(true);
      const response = await fetch(`${backend_url}/api/candidates/interviews/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result: DashboardInterviewsResponse = await response.json();
        if (result.success) {
          setInterviews(result.data);
        } else {
          console.error('Error fetching interviews:', result.message);
          setInterviews([]);
        }
      } else {
        console.error('Error fetching interviews:', response.statusText);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
    } finally {
      setInterviewsLoading(false);
    }
  };

  // Function to fetch activities data
  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const result = await activityService.getRecentActivities(10);
      if (result.success) {
        setActivities(result.data);
        setLastActivitiesUpdate(new Date());
      } else {
        console.error('Error fetching activities:', result.message);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Fetch submissions data on component mount and when user is loaded
  useEffect(() => {
    if (user && !isLoading) {
      fetchSubmissionEmployees();
      fetchSubmissionsData();
      fetchBirthdays();
      fetchInterviews();
    }
  }, [user, isLoading]);

  // Update submissions data when employee filter changes
  useEffect(() => {
    if (user && !isLoading) {
      fetchSubmissionsData(selectedSubmissionEmployee, submissionsDataType);
    }
  }, [selectedSubmissionEmployee, submissionsDataType, user, isLoading]);

  // Auto-refresh activities every 30 seconds
  useEffect(() => {
    if (user && !isLoading) {
      // Initial fetch
      fetchActivities();
      
      // Set up interval for auto-refresh
      const interval = setInterval(() => {
        fetchActivities();
      }, 30000); // 30 seconds
      
      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [user, isLoading]);

  // Check if user is admin, if not redirect to appropriate page
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== 'admin') {
        // Redirect non-admin users to appropriate dashboard
        if (user.role === 'hr') {
          navigate(routes.adminDashboard); // HR can access admin dashboard
        } else if (user.role === 'employee') {
          navigate(routes.employeeDashboard);
        } else {
          navigate('/login');
        }
      }
    } else if (!isLoading && !user) {
      // No user logged in, redirect to login
      navigate('/login');
    }
  }, [user, isLoading, navigate, routes.adminDashboard, routes.employeeDashboard]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied if user is not admin or hr
  if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="text-center py-5">
            <i className="ti ti-shield-x fs-1 text-danger mb-3"></i>
            <h4 className="text-danger">Access Denied</h4>
            <p className="text-muted">You don't have permission to access this page.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Candidate Dashboard</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Dashboard</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Candidate Dashboard
                  </li>
                </ol>
              </nav>
            </div>
            {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <Link to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    <i className="ti ti-file-export me-1" />
                    Export
                  </Link>
                  <ul className="dropdown-menu  dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-pdf me-1" />
                        Export as PDF
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                      >
                        <i className="ti ti-file-type-xls me-1" />
                        Export as Excel{" "}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mb-2">
                <div className="input-icon w-120 position-relative">
                  <span className="input-icon-addon">
                    <i className="ti ti-calendar text-gray-9" />
                  </span>
                  <Calendar value={date} onChange={(e: any) => setDate(e.value)} view="year" dateFormat="yy" className="Calendar-form" />
                </div>
              </div>
              <div className="ms-2 head-icons">
                <CollapseHeader />
              </div>
            </div> */}
          </div>
          {/* /Breadcrumb */}
          {/* Welcome Wrap */}
          <div className="card border-0">
            <div className="card-body d-flex align-items-center justify-content-between flex-wrap pb-1">
              <div className="d-flex align-items-center mb-3">
                <span className="avatar avatar-xl flex-shrink-0">
                  {user && user.profileImage ? (
                    <img
                      src={profileImg}
                      className="rounded-circle"
                      alt="img"
                    />
                  ) : (
                    <ImageWithBasePath
                      src="assets/img/profiles/avatar-31.jpg"
                      className="rounded-circle"
                      alt="img"
                    />
                  )}
                </span>
                <div className="ms-3">
                  <h3 className="mb-2">
                    Welcome Back, {isLoading ? '...' : (user ? `${user.firstName} ${user.lastName}` : 'Recruiter')}{" "}
                    {/* <Link to="#" className="edit-icon">
                      <i className="ti ti-edit fs-14" />
                    </Link> */}
                  </h3>
                  <p>
                    You have{" "}
                    <Link 
                      to={routes.candidatesGrid} 
                      className={`text-decoration-underline cursor-pointer position-relative ${
                        candidateStats.totalCandidates > 0 ? 'text-primary fw-bold' : 'text-muted'
                      }`}
                      style={{ cursor: 'pointer' }}
                      title={`Click to view ${candidateStats.totalCandidates} total candidates`}
                    >
                      {leaveRequestsLoading ? (
                        <span className="spinner-border spinner-border-sm text-primary" role="status" />
                      ) : (
                        <>
                          <span className="d-inline-flex align-items-center">
                            <span className="me-1">{leaveRequestsCount}</span>
                            {leaveRequestsCount > 0 && (
                              <span 
                                className="badge rounded-pill bg-danger" 
                                style={{ 
                                  fontSize: '0.5em',
                                  padding: '2px 4px',
                                  minWidth: '12px',
                                  height: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                !
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </Link>{" "}
                    Leave Requests
                    {leaveRequestsCount > 0 && (
                      <span className="text-danger ms-1">(New)</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap mb-1">
                {/* <Link
                  to="#"
                  className="btn btn-secondary btn-md me-2 mb-2"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_project"
                >
                  <i className="ti ti-square-rounded-plus me-1" />
                  Add Project
                </Link>
                <Link
                  to="#"
                  className="btn btn-primary btn-md mb-2"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#add_leaves"
                >
                  <i className="ti ti-square-rounded-plus me-1" />
                  Add Requests
                </Link> */}
              </div>
            </div>
          </div>
          {/* /Welcome Wrap */}
          <div className="row">
            {/* Widget Info */}
            <div className="col-xxl-4 d-flex">
              <div className="row flex-fill">
                <div className="col-md-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-primary mb-2">
                        <i className="ti ti-calendar-share fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Total Present
                      </h6>
                      <h3 className="mb-3">
                        {attendanceLoading ? (
                          <span className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : attendanceStats ? (
                          `${attendanceStats.present}/${attendanceStats.totalEmployees}`
                        ) : (
                          '0/0'
                        )}
                        {" "}
                        {/* <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-up me-1" />
                          +2.1%
                        </span> */}
                      </h3>
                      <Link to="attendance-employee.html" className="link-default">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-warning mb-2">
                        <i className="ti ti-clock-exclamation fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Total Late
                      </h6>
                      <h3 className="mb-3">
                        {lateEmployeesLoading ? (
                          <span className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : lateEmployeesCount > 0 ? (
                          `${lateEmployeesCount}`
                        ) : (
                          '0'
                        )}
                        {" "}
                        <span className="fs-12 fw-medium text-warning">
                          <i className="fa-solid fa-clock me-1" />
                          Today
                        </span>
                      </h3>
                      <Link to="attendance-report.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                {/* <div className="col-md-3 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-purple mb-2">
                        <i className="ti ti-moneybag fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Earnings
                      </h6>
                      <h3 className="mb-3">
                        $2144{" "}
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-up me-1" />
                          +10.2%
                        </span>
                      </h3>
                      <Link to="expenses.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* <div className="col-md-3 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-danger mb-2">
                        <i className="ti ti-browser fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Profit This Week
                      </h6>
                      <h3 className="mb-3">
                        $5,544{" "}
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-up me-1" />
                          +2.1%
                        </span>
                      </h3>
                      <Link to="purchase-transaction.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div> */}
                <div className="col-md-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-danger mb-2">
                        <i className="ti ti-user-x fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Total Absent
                      </h6>
                      <h3 className="mb-3">
                        {absentEmployeesLoading ? (
                          <span className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : absentEmployeesCount > 0 ? (
                          `${absentEmployeesCount}`
                        ) : (
                          '0'
                        )}
                        {" "}
                        <span className="fs-12 fw-medium text-danger">
                          <i className="fa-solid fa-user-slash me-1" />
                          Today
                        </span>
                      </h3>
                      <Link to="attendance-report.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-dark mb-2">
                        <i className="ti ti-user-star fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        New Hire
                      </h6>
                      <h3 className="mb-3">
                        {newHiresLoading ? (
                          <span className="spinner-border spinner-border-sm text-primary" role="status" />
                        ) : newHiresCount > 0 ? (
                          `${newHiresCount}`
                        ) : (
                          '0'
                        )}
                        {" "}
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-calendar me-1" />
                          This Month
                        </span>
                      </h3>
                      <Link to="employees.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                {/* <div className="col-md-3 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-success mb-2">
                        <i className="ti ti-users-group fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Job Applicants
                      </h6>
                      <h3 className="mb-3">
                        98{" "}
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-up me-1" />
                          +2.1%
                        </span>
                      </h3>
                      <Link to="job-list.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div> */}
                {/* <div className="col-md-3 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-pink mb-2">
                        <i className="ti ti-checklist fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Total Tasks
                      </h6>
                      <h3 className="mb-3">
                        25/28{" "}
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-down me-1" />
                          +11.2%
                        </span>
                      </h3>
                      <Link to="tasks.html" className="link-default">
                        View All
                      </Link>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
            {/* /Widget Info */}
            {/* Employees By Department */}
            <div className="col-xxl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2">
                  <h5 className="mb-2">Employees By Designation</h5>
                </div>
                <div className="card-body">
                  {designationStatsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading designation data...</p>
                    </div>
                  ) : designationStats.length > 0 ? (
                    <>
                      <ReactApexChart
                        id="emp-department"
                        options={empDepartment}
                        series={empDepartment.series}
                        type="bar"
                        height={250}
                      />
                      <p className="fs-13">
                        <i className="ti ti-circle-filled me-2 fs-8 text-primary" />
                        No of Employees {designationPercentageChange >= 0 ? 'increased' : 'decreased'} by{" "}
                        <span className={`fw-bold ${designationPercentageChange >= 0 ? 'text-success' : 'text-danger'}`}>
                          {designationPercentageChange >= 0 ? '+' : ''}{designationPercentageChange}%
                        </span> from last month
                      </p>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-users-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No employee data available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Employees By Department */}
             {/* Todo */}
             <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <div className="d-flex align-items-center">
                    <h5 className="mb-2">Todo</h5>
                    {totalTodos >= 8 && totalTodos < 10 && (
                      <div className="ms-2">
                        <span className="badge badge-warning badge-xs">
                          <i className="ti ti-alert-triangle me-1"></i>
                          Warning: {totalTodos}/10 todos
                        </span>
                      </div>
                    )}
                    {totalTodos >= 10 && (
                      <div className="ms-2">
                        <span className="badge badge-danger badge-xs">
                          <i className="ti ti-alert-circle me-1"></i>
                          Limit reached: {totalTodos}/10
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="dropdown mb-2 me-2">
                      <Link
                        to="#"
                        className="btn btn-white border btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1" />
                        Today
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Today
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-icon btn-xs rounded-circle d-flex align-items-center justify-content-center p-0 mb-2"
                      onClick={async () => {
                        if (totalTodos >= 8 && totalTodos < 10) {
                          const result = await Swal.fire({
                            title: 'Approaching Todo Limit',
                            text: `You have ${totalTodos}/10 todos. Adding one more will trigger auto-deletion of the oldest todo.`,
                            icon: 'info',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Continue',
                            cancelButtonText: 'Cancel'
                          });
                          
                          if (result.isConfirmed) {
                            setTodoModalOpen(true);
                          }
                        } else {
                          setTodoModalOpen(true);
                        }
                      }}
                    >
                      <i className="ti ti-plus fs-16" />
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {todosLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                      <p className="mt-2 text-muted">Loading todos...</p>
                  </div>
                  ) : todos.length > 0 ? (
                    todos.map((todo, index) => (
                        <div 
                          key={todo._id} 
                          className={`todo-item border br-5 mb-2 ${
                            draggedTodo === todo._id ? 'dragging' : ''
                          } ${
                            dragOverTodo === todo._id ? 'drag-over' : ''
                          }`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, todo._id)}
                          onDragOver={(e) => handleDragOver(e, todo._id)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, todo._id)}
                        >
                          <div 
                            className="d-flex align-items-center p-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleTodoClick(todo._id)}
                          >
                            <i 
                              className="ti ti-grid-dots me-2" 
                              style={{ cursor: 'grab' }}
                            />
                            <div className="form-check flex-grow-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`todo${todo._id}`}
                                checked={todo.completed}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleTodoCompletion(todo._id);
                                }}
                              />
                              <label 
                                className="form-check-label fw-medium" 
                                htmlFor={`todo${todo._id}`}
                                style={{
                                  textDecoration: todo.completed ? 'line-through' : 'none',
                                  color: todo.completed ? '#6c757d' : 'inherit',
                                  opacity: todo.completed ? 0.7 : 1
                                }}
                              >
                                {todo.title}
                              </label>
                            </div>
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-danger p-0 ms-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTodoDelete(todo._id);
                              }}
                              title="Delete todo"
                            >
                              <i className="ti ti-trash fs-14" />
                            </button>
                          </div>
                          
                          {/* Description section */}
                          {expandedTodoId === todo._id && todo.description && (
                            <div className="px-3 pb-2 border-top">
                              <div className="mt-2">
                                <small className="text-muted d-block mb-1">
                                  <i className="ti ti-file-text me-1"></i>
                                  Description:
                                </small>
                                <p className="mb-0 text-muted small" style={{ lineHeight: '1.4' }}>
                                  {todo.description}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-checklist-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No todos found.</p>
                    </div>
                  )}
                  
                  {/* Pagination */}
                  {totalTodoPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top todo-pagination">
                      <div className="text-muted small">
                        Showing {((currentTodoPage - 1) * 5) + 1} - {Math.min(currentTodoPage * 5, totalTodos)} of {totalTodos} todos
                      </div>
                      <div className="d-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => fetchTodos(currentTodoPage - 1)}
                          disabled={currentTodoPage === 1}
                        >
                          <i className="ti ti-chevron-left" />
                        </button>
                        <span className="btn btn-sm btn-outline-secondary disabled">
                          {currentTodoPage} / {totalTodoPages}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => fetchTodos(currentTodoPage + 1)}
                          disabled={currentTodoPage === totalTodoPages}
                        >
                          <i className="ti ti-chevron-right" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Todo */}
          </div>
          <div className="row">
            {/* Total Employee */}
            {/* <div className="col-xxl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Employee Status</h5>
                  <div className="dropdown mb-2">
                    <Link to="#"
                      className="btn btn-white border btn-sm d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-calendar me-1" />
                      This Week
                    </Link>
                    <ul className="dropdown-menu  dropdown-menu-end p-3">
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                        >
                          This Month
                        </Link>
                      </li>
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                        >
                          This Week
                        </Link>
                      </li>
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                        >
                          Today
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <p className="fs-13 mb-3">Total Employee</p>
                    <h3 className="mb-3">154</h3>
                  </div>
                  <div className="progress-stacked emp-stack mb-3">
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Segment one"
                      aria-valuenow={15}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "40%" }}
                    >
                      <div className="progress-bar bg-warning" />
                    </div>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Segment two"
                      aria-valuenow={30}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "20%" }}
                    >
                      <div className="progress-bar bg-secondary" />
                    </div>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Segment three"
                      aria-valuenow={20}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "10%" }}
                    >
                      <div className="progress-bar bg-danger" />
                    </div>
                    <div
                      className="progress"
                      role="progressbar"
                      aria-label="Segment four"
                      aria-valuenow={20}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      style={{ width: "30%" }}
                    >
                      <div className="progress-bar bg-pink" />
                    </div>
                  </div>
                  <div className="border mb-3">
                    <div className="row gx-0">
                      <div className="col-6">
                        <div className="p-2 flex-fill border-end border-bottom">
                          <p className="fs-13 mb-2">
                            <i className="ti ti-square-filled text-primary fs-12 me-2" />
                            Fulltime <span className="text-gray-9">(48%)</span>
                          </p>
                          <h2 className="display-1">112</h2>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 flex-fill border-bottom text-end">
                          <p className="fs-13 mb-2">
                            <i className="ti ti-square-filled me-2 text-secondary fs-12" />
                            Contract <span className="text-gray-9">(20%)</span>
                          </p>
                          <h2 className="display-1">112</h2>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 flex-fill border-end">
                          <p className="fs-13 mb-2">
                            <i className="ti ti-square-filled me-2 text-danger fs-12" />
                            Probation <span className="text-gray-9">(22%)</span>
                          </p>
                          <h2 className="display-1">12</h2>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="p-2 flex-fill text-end">
                          <p className="fs-13 mb-2">
                            <i className="ti ti-square-filled text-pink me-2 fs-12" />
                            WFH <span className="text-gray-9">(20%)</span>
                          </p>
                          <h2 className="display-1">04</h2>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h6 className="mb-2">Top Performer</h6>
                  <div className="p-2 d-flex align-items-center justify-content-between border border-primary bg-primary-100 br-5 mb-4">
                    <div className="d-flex align-items-center overflow-hidden">
                      <span className="me-2">
                        <i className="ti ti-award-filled text-primary fs-24" />
                      </span>
                      <Link
                        to="employee-details.html"
                        className="avatar avatar-md me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-24.jpg"
                          className="rounded-circle border border-white"
                          alt="img"
                        />
                      </Link>
                      <div>
                        <h6 className="text-truncate mb-1 fs-14 fw-medium">
                          <Link to="employee-details.html">Daniel Esbella</Link>
                        </h6>
                        <p className="fs-13">IOS Developer</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="fs-13 mb-1">Performance</p>
                      <h5 className="text-primary">99%</h5>
                    </div>
                  </div>
                  <Link to="employees.html" className="btn btn-light btn-md w-100">
                    View All Employees
                  </Link>
                </div>
              </div>
            </div> */}
            {/* /Total Employee */}
            {/* Employees */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Employees</h5>
                  <Link to="employees.html" className="btn btn-light btn-md mb-2">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  {employeesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading employees...</p>
                    </div>
                  ) : employees.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                            <th>Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                          {employees.slice(0, 7).map((employee: any, index: number) => (
                            <tr key={employee._id || index}>
                              <td className={index === Math.min(6, employees.length - 1) ? 'border-0' : ''}>
                            <div className="d-flex align-items-center">
                              <Link to="#" className="avatar">
                                <ImageWithBasePath
                                      src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "assets/img/users/user-32.jpg"}
                                  className="img-fluid rounded-circle"
                                      alt={`${employee.firstName} ${employee.lastName}`}
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                      <Link to={`${routes.employeedetailsWithId.replace(':id', employee._id)}`}>
                                        {employee.firstName} {employee.lastName}
                              </Link>
                                </h6>
                                    <span className="fs-12">{employee.designation || 'Employee'}</span>
                              </div>
                            </div>
                          </td>
                              <td className={index === Math.min(6, employees.length - 1) ? 'border-0' : ''}>
                                <span className={`badge badge-${getDepartmentBadgeColor(employee.designation)}-transparent badge-xs`}>
                                  {employee.designation || 'General'}
                            </span>
                          </td>
                        </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-users-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No employees found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Employees */}
            {/* Attendance Overview */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Attendance Overview</h5>
                  <div className="dropdown mb-2">
                    <Link to="#"
                      className="btn btn-white border btn-sm d-inline-flex align-items-center"
                      data-bs-toggle="dropdown"
                    >
                      <i className="ti ti-calendar me-1" />
                      {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end p-3">
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            setSelectedDate(today);
                            fetchAttendanceOverview(today);
                          }}
                        >
                          Today
                        </Link>
                      </li>
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => {
                            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            setSelectedDate(yesterday);
                            fetchAttendanceOverview(yesterday);
                          }}
                        >
                          Yesterday
                        </Link>
                      </li>
                      <li>
                        <Link to="#"
                          className="dropdown-item rounded-1"
                          onClick={() => {
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                            setSelectedDate(weekAgo);
                            fetchAttendanceOverview(weekAgo);
                          }}
                        >
                          Last Week
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chartjs-wrapper-demo position-relative mb-4">
                    <Chart 
                      key={`attendance-chart-${attendanceOverview.total}`}
                      id="attendance-chart"
                      type="doughnut" 
                      data={chartData} 
                      options={chartOptions} 
                      className="w-full attendence-chart md:w-30rem" 
                    />
                    <div className="position-absolute text-center attendance-canvas">
                      <p className="fs-13 mb-1">Total Attendance</p>
                      <h3>{attendanceOverviewLoading ? '...' : attendanceOverview.total}</h3>
                    </div>
                  </div>
                  <h6 className="mb-3">Status</h6>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="f-13 mb-2">
                      <i className="ti ti-circle-filled text-success me-1" />
                      Present
                    </p>
                    <p className="f-13 fw-medium text-gray-9 mb-2">
                      {attendanceOverviewLoading ? '...' : attendanceOverview.total > 0 ? 
                        `${Math.round((attendanceOverview.present / attendanceOverview.total) * 100)}%` : '0%'}
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="f-13 mb-2">
                      <i className="ti ti-circle-filled text-secondary me-1" />
                      Late
                    </p>
                    <p className="f-13 fw-medium text-gray-9 mb-2">
                      {attendanceOverviewLoading ? '...' : attendanceOverview.total > 0 ? 
                        `${Math.round((attendanceOverview.late / attendanceOverview.total) * 100)}%` : '0%'}
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="f-13 mb-2">
                      <i className="ti ti-circle-filled text-warning me-1" />
                      On Leave
                    </p>
                    <p className="f-13 fw-medium text-gray-9 mb-2">
                      {attendanceOverviewLoading ? '...' : attendanceOverview.total > 0 ? 
                        `${Math.round((attendanceOverview.onLeave / attendanceOverview.total) * 100)}%` : '0%'}
                    </p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="f-13 mb-2">
                      <i className="ti ti-circle-filled text-danger me-1" />
                      Absent
                    </p>
                    <p className="f-13 fw-medium text-gray-9 mb-2">
                      {attendanceOverviewLoading ? '...' : attendanceOverview.total > 0 ? 
                        `${Math.round((attendanceOverview.absent / attendanceOverview.total) * 100)}%` : '0%'}
                    </p>
                  </div>
                  <div className="bg-light br-5 box-shadow-xs p-2 pb-0 d-flex align-items-center justify-content-between flex-wrap">
                    <div className="d-flex align-items-center">
                      <p className="mb-2 me-2">Total Absenties: {attendanceOverviewLoading ? '...' : attendanceOverview.absent}</p>
                      <div className="avatar-list-stacked avatar-group-sm mb-2">
                        {/* Dynamic avatar placeholders - only show when there are absent employees */}
                        {!attendanceOverviewLoading && absentEmployees.length > 0 && (
                          <>
                            {absentEmployees.slice(0, 4).map((attendance: any, index: number) => (
                              <span key={index} className="avatar avatar-rounded">
                          <ImageWithBasePath
                            className="border border-white"
                                  src={attendance.employeeId?.profileImage || `assets/img/profiles/avatar-${27 + index}.jpg`}
                                  alt={`${attendance.employeeId?.firstName || 'Employee'} ${attendance.employeeId?.lastName || ''}`}
                          />
                        </span>
                            ))}
                            {attendanceOverview.absent > 4 && (
                        <Link
                          className="avatar bg-primary avatar-rounded text-fixed-white fs-10"
                          to="#"
                        >
                                +{attendanceOverview.absent - 4}
                        </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <Link to={routes.attendanceadmin}
                      className="fs-13 link-primary text-decoration-underline mb-2"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* /Attendance Overview */}
            {/* Clock-In/Out */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Clock-In/Out</h5>
                  <div className="d-flex align-items-center">
                    {/* Commented out designation dropdown for simplicity
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="dropdown-toggle btn btn-white btn-sm d-inline-flex align-items-center border-0 fs-13 me-2"
                        data-bs-toggle="dropdown"
                      >
                        {selectedDesignation}
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => {
                              setSelectedDesignation('All Designations');
                              fetchClockInOutData(selectedClockDate === 'Today' ? 'today' : selectedClockDate === 'Yesterday' ? 'yesterday' : 'week', 'All Designations');
                            }}
                          >
                            All Designations
                          </Link>
                        </li>
                        {employeeDesignations.map((designation: string, index: number) => (
                          <li key={index}>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                              onClick={() => {
                                setSelectedDesignation(designation);
                                fetchClockInOutData(selectedClockDate === 'Today' ? 'today' : selectedClockDate === 'Yesterday' ? 'yesterday' : 'week', designation);
                              }}
                          >
                              {designation}
                          </Link>
                        </li>
                        ))}
                      </ul>
                    </div>
                    */}
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="btn btn-white border btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1" />
                        {selectedClockDate}
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => {
                              setSelectedClockDate('Today');
                              fetchClockInOutData('today', selectedDesignation);
                            }}
                          >
                            Today
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => {
                              setSelectedClockDate('Yesterday');
                              fetchClockInOutData('yesterday', selectedDesignation);
                            }}
                          >
                            Yesterday
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => {
                              setSelectedClockDate('This Week');
                              fetchClockInOutData('week', selectedDesignation);
                            }}
                          >
                            This Week
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {clockInOutLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading attendance data...</p>
                    </div>
                  ) : (
                  <div>
                      {/* Present Employees */}
                      {clockInOutData.present.map((attendance: any, index: number) => (
                        <div key={index} className="d-flex align-items-center justify-content-between mb-3 p-2 border border-dashed br-5">
                      <div className="d-flex align-items-center">
                            <Link to="#" className="avatar flex-shrink-0">
                          {attendance.employeeId?.profileImage ? (
                            <img
                              src={`${backend_url}/uploads/${attendance.employeeId.profileImage}`}
                              className="rounded-circle border border-2"
                              alt={`${attendance.employeeId.firstName} ${attendance.employeeId.lastName}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/assets/img/profiles/avatar-24.jpg";
                              }}
                            />
                          ) : (
                            <ImageWithBasePath
                              src="assets/img/profiles/avatar-24.jpg"
                              className="rounded-circle border border-2"
                              alt="img"
                            />
                          )}
                        </Link>
                        <div className="ms-2">
                          <h6 className="fs-14 fw-medium text-truncate">
                                {attendance.employeeId?.firstName} {attendance.employeeId?.lastName}
                          </h6>
                              <p className="fs-13">{attendance.employeeId?.designation || 'Employee'}</p>
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <Link to="#" className="link-default me-2">
                          <i className="ti ti-clock-share" />
                        </Link>
                        <span className="fs-10 fw-medium d-inline-flex align-items-center badge badge-success">
                          <i className="ti ti-circle-filled fs-5 me-1" />
                              {attendance.checkIn?.time ? 
                                new Date(attendance.checkIn.time).toLocaleTimeString('en-US', { 
                                  hour: '2-digit', 
                                  minute: '2-digit',
                                  hour12: false 
                                }) : '--:--'
                              }
                        </span>
                      </div>
                    </div>
                      ))}
                      
                      {/* Late Employees */}
                      {clockInOutData.late.length > 0 && (
                        <>
                  <h6 className="mb-2">Late</h6>
                          {clockInOutData.late.map((attendance: any, index: number) => (
                            <div key={index} className="d-flex align-items-center justify-content-between mb-3 p-2 border border-dashed br-5">
                    <div className="d-flex align-items-center">
                      <span className="avatar flex-shrink-0">
                        {attendance.employeeId?.profileImage ? (
                          <img
                            src={`${backend_url}/uploads/${attendance.employeeId.profileImage}`}
                            className="rounded-circle border border-2"
                            alt={`${attendance.employeeId.firstName} ${attendance.employeeId.lastName}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/assets/img/profiles/avatar-29.jpg";
                            }}
                          />
                        ) : (
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-29.jpg"
                            className="rounded-circle border border-2"
                            alt="img"
                          />
                        )}
                      </span>
                      <div className="ms-2">
                        <h6 className="fs-14 fw-medium text-truncate">
                                    {attendance.employeeId?.firstName} {attendance.employeeId?.lastName}{" "}
                          <span className="fs-10 fw-medium d-inline-flex align-items-center badge badge-success">
                            <i className="ti ti-clock-hour-11 me-1" />
                                      {attendance.lateMinutes || 0} Min
                          </span>
                        </h6>
                                  <p className="fs-13">{attendance.employeeId?.designation || 'Employee'}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Link to="#" className="link-default me-2">
                        <i className="ti ti-clock-share" />
                      </Link>
                      <span className="fs-10 fw-medium d-inline-flex align-items-center badge badge-danger">
                        <i className="ti ti-circle-filled fs-5 me-1" />
                                  {attendance.checkIn?.time ? 
                                    new Date(attendance.checkIn.time).toLocaleTimeString('en-US', { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: false 
                                    }) : '--:--'
                                  }
                      </span>
                    </div>
                  </div>
                          ))}
                        </>
                      )}
                      
                      {/* No Data Message */}
                      {clockInOutData.present.length === 0 && clockInOutData.late.length === 0 && (
                        <div className="text-center py-4">
                          <i className="ti ti-clock-off fs-1 text-muted mb-3"></i>
                          <p className="text-muted">No attendance data available for the selected date and department.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* View All Attendance Button - At the very bottom of the card */}
                <div className="card-footer">
                  <Link to={routes.attendanceadmin}
                    className="btn btn-light btn-md w-100"
                  >
                    View All Attendance
                  </Link>
                </div>
              </div>
            </div>
            {/* /Clock-In/Out */}
          </div>
          <div className="row">
            {/* Jobs Applicants */}
            {/* <div className="col-xxl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Jobs Applicants</h5>
                  <Link to="job-list.html" className="btn btn-light btn-md mb-2">
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  <ul
                    className="nav nav-tabs tab-style-1 nav-justified d-sm-flex d-block p-0 mb-4"
                    role="tablist"
                  >
                    <li className="nav-item" role="presentation">
                      <Link
                        className="nav-link fw-medium"
                        data-bs-toggle="tab"
                        data-bs-target="#openings"
                        aria-current="page"
                        to="#openings"
                        aria-selected="true"
                        role="tab"
                      >
                        Openings
                      </Link>
                    </li>
                    <li className="nav-item" role="presentation">
                      <Link
                        className="nav-link fw-medium active"
                        data-bs-toggle="tab"
                        data-bs-target="#applicants"
                        to="#applicants"
                        aria-selected="false"
                        tabIndex={-1}
                        role="tab"
                      >
                        Applicants
                      </Link>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div className="tab-pane fade" id="openings">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0 bg-gray-100"
                          >
                            <ImageWithBasePath
                              src="assets/img/icons/apple.svg"
                              className="img-fluid rounded-circle w-auto h-auto"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Senior IOS Developer</Link>
                            </p>
                            <span className="fs-12">No of Openings : 25 </span>
                          </div>
                        </div>
                        <Link to="#"
                          className="btn btn-light btn-sm p-0 btn-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0 bg-gray-100"
                          >
                            <ImageWithBasePath
                              src="assets/img/icons/php.svg"
                              className="img-fluid w-auto h-auto"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Junior PHP Developer</Link>
                            </p>
                            <span className="fs-12">No of Openings : 20 </span>
                          </div>
                        </div>
                        <Link to="#"
                          className="btn btn-light btn-sm p-0 btn-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0 bg-gray-100"
                          >
                            <ImageWithBasePath
                              src="assets/img/icons/react.svg"
                              className="img-fluid w-auto h-auto"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">
                                Junior React Developer{" "}
                              </Link>
                            </p>
                            <span className="fs-12">No of Openings : 30 </span>
                          </div>
                        </div>
                        <Link to="#"
                          className="btn btn-light btn-sm p-0 btn-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-0">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0 bg-gray-100"
                          >
                            <ImageWithBasePath
                              src="assets/img/icons/laravel-icon.svg"
                              className="img-fluid w-auto h-auto"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">
                                Senior Laravel Developer
                              </Link>
                            </p>
                            <span className="fs-12">No of Openings : 40 </span>
                          </div>
                        </div>
                        <Link to="#"
                          className="btn btn-light btn-sm p-0 btn-icon d-flex align-items-center justify-content-center"
                        >
                          <i className="ti ti-edit" />
                        </Link>
                      </div>
                    </div>
                    <div className="tab-pane fade show active" id="applicants">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="assets/img/users/user-09.jpg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Brian Villalobos</Link>
                            </p>
                            <span className="fs-13 d-inline-flex align-items-center">
                              Exp : 5+ Years
                              <i className="ti ti-circle-filled fs-4 mx-2 text-primary" />
                              USA
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-secondary badge-xs">
                          UI/UX Designer
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="assets/img/users/user-32.jpg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Anthony Lewis</Link>
                            </p>
                            <span className="fs-13 d-inline-flex align-items-center">
                              Exp : 4+ Years
                              <i className="ti ti-circle-filled fs-4 mx-2 text-primary" />
                              USA
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-info badge-xs">
                          Python Developer
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="assets/img/users/user-32.jpg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Stephan Peralt</Link>
                            </p>
                            <span className="fs-13 d-inline-flex align-items-center">
                              Exp : 6+ Years
                              <i className="ti ti-circle-filled fs-4 mx-2 text-primary" />
                              USA
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-pink badge-xs">
                          Android Developer
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between mb-0">
                        <div className="d-flex align-items-center">
                          <Link to="#"
                            className="avatar overflow-hidden flex-shrink-0"
                          >
                            <ImageWithBasePath
                              src="assets/img/users/user-34.jpg"
                              className="img-fluid rounded-circle"
                              alt="img"
                            />
                          </Link>
                          <div className="ms-2 overflow-hidden">
                            <p className="text-dark fw-medium text-truncate mb-0">
                              <Link to="#">Doglas Martini</Link>
                            </p>
                            <span className="fs-13 d-inline-flex align-items-center">
                              Exp : 2+ Years
                              <i className="ti ti-circle-filled fs-4 mx-2 text-primary" />
                              USA
                            </span>
                          </div>
                        </div>
                        <span className="badge badge-purple badge-xs">
                          React Developer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
            {/* /Jobs Applicants */}
            {/* Employees */}
            {/* <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Employees</h5>
                  <Link to="employees.html" className="btn btn-light btn-md mb-2">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  {employeesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">Loading employees...</p>
                    </div>
                  ) : employees.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                            <th>Designation</th>
                        </tr>
                      </thead>
                      <tbody>
                          {employees.slice(0, 5).map((employee: any, index: number) => (
                            <tr key={employee._id || index}>
                              <td className={index === Math.min(4, employees.length - 1) ? 'border-0' : ''}>
                            <div className="d-flex align-items-center">
                              <Link to="#" className="avatar">
                                <ImageWithBasePath
                                      src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "assets/img/users/user-32.jpg"}
                                  className="img-fluid rounded-circle"
                                      alt={`${employee.firstName} ${employee.lastName}`}
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                      <Link to={`${routes.employeedetailsWithId.replace(':id', employee._id)}`}>
                                        {employee.firstName} {employee.lastName}
                              </Link>
                                </h6>
                                    <span className="fs-12">{employee.designation || 'Employee'}</span>
                              </div>
                            </div>
                          </td>
                              <td className={index === Math.min(4, employees.length - 1) ? 'border-0' : ''}>
                                <span className={`badge badge-${getDepartmentBadgeColor(employee.designation)}-transparent badge-xs`}>
                                  {employee.designation || 'General'}
                            </span>
                          </td>
                        </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-users-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No employees found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div> */}
            {/* /Employees */}
            {/* Todo */}
           
            {/* /Todo */}
          </div>
          <div className="row">
            {/* Dynamic Overview Card */}
            <div className="col-xl-7 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">
                    {submissionsDataType === 'submissions' ? 'Submissions Overview' : 
                     submissionsDataType === 'job-offers' ? 'Job Offers Overview' : 'Interview Schedules Overview'}
                  </h5>
                  <div className="d-flex align-items-center">
                    <div className="dropdown mb-2 me-2">
                      <Link
                        to="#"
                        className="dropdown-toggle btn btn-white border-0 btn-sm d-inline-flex align-items-center fs-13"
                        data-bs-toggle="dropdown"
                      >
                        {submissionsDataType === 'submissions' ? 'Submissions' : 
                         submissionsDataType === 'job-offers' ? 'Job Offers' : 'Interview Schedules'}
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => handleSubmissionsDataTypeChange('submissions')}
                          >
                            Submissions
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => handleSubmissionsDataTypeChange('job-offers')}
                          >
                            Job Offers
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => handleSubmissionsDataTypeChange('interview-schedules')}
                          >
                            Interview Schedules
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="dropdown-toggle btn btn-white border-0 btn-sm d-inline-flex align-items-center fs-13"
                        data-bs-toggle="dropdown"
                      >
                        {selectedSubmissionEmployee}
                      </Link>
                      <ul className="dropdown-menu dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                            onClick={() => setSelectedSubmissionEmployee('All Employees')}
                          >
                            All Employees
                          </Link>
                        </li>
                        {submissionEmployees.map((employee: any, index: number) => (
                          <li key={index}>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                              onClick={() => setSelectedSubmissionEmployee(employee.name)}
                          >
                              {employee.name} ({employee.designation})
                          </Link>
                        </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body pb-0">
                  {submissionsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2 text-muted">
                        Loading {submissionsDataType === 'submissions' ? 'submissions' : 
                                submissionsDataType === 'job-offers' ? 'job offers' : 'interview schedules'} data...
                      </p>
                    </div>
                  ) : submissionsData.length > 0 ? (
                    <>
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <div className="d-flex align-items-center mb-1">
                      <p className="fs-13 text-gray-9 me-3 mb-0">
                        <i className="ti ti-square-filled me-2 text-primary" />
                            {submissionsDataType === 'submissions' ? 'Monthly Submissions' : 
                             submissionsDataType === 'job-offers' ? 'Monthly Job Offers' : 'Monthly Interview Schedules'}
                      </p>
                    </div>
                        <p className="fs-13 mb-1">Last Updated at {new Date().toLocaleTimeString()}</p>
                  </div>
                  <ReactApexChart
                        id="submissions-chart"
                        options={submissionsChartData}
                        series={submissionsChartData.series}
                    type="bar"
                    height={270}
                  />
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-file-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">
                        No {submissionsDataType === 'submissions' ? 'submissions' : 
                            submissionsDataType === 'job-offers' ? 'job offers' : 'interview schedules'} data available.
                      </p>
                </div>
                  )}
              </div>
            </div>
            </div>
            {/* /Dynamic Overview Card */}
            {/* Invoices */}
            {/* <div className="col-xl-5 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Invoices</h5>
                  <div className="d-flex align-items-center">
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="dropdown-toggle btn btn-white btn-sm d-inline-flex align-items-center fs-13 me-2 border-0"
                        data-bs-toggle="dropdown"
                      >
                        Invoices
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Invoices
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Paid
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Unpaid
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="btn btn-white border btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Today
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body pt-2">
                  <div className="table-responsive pt-1">
                    <table className="table table-nowrap table-borderless mb-0">
                      <tbody>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link to="invoice-details.html" className="avatar">
                                <ImageWithBasePath
                                  src="assets/img/users/user-39.jpg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link to="invoice-details.html">
                                    Redesign Website
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  #INVOO2
                                  <i className="ti ti-circle-filled fs-4 mx-1 text-primary" />
                                  Logistics
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="fs-13 mb-1">Payment</p>
                            <h6 className="fw-medium">$3560</h6>
                          </td>
                          <td className="px-0 text-end">
                            <span className="badge badge-danger-transparent badge-xs d-inline-flex align-items-center">
                              <i className="ti ti-circle-filled fs-5 me-1" />
                              Unpaid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link to="invoice-details.html" className="avatar">
                                <ImageWithBasePath
                                  src="assets/img/users/user-40.jpg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link to="invoice-details.html">
                                    Module Completion
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  #INVOO5
                                  <i className="ti ti-circle-filled fs-4 mx-1 text-primary" />
                                  Yip Corp
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="fs-13 mb-1">Payment</p>
                            <h6 className="fw-medium">$4175</h6>
                          </td>
                          <td className="px-0 text-end">
                            <span className="badge badge-danger-transparent badge-xs d-inline-flex align-items-center">
                              <i className="ti ti-circle-filled fs-5 me-1" />
                              Unpaid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link to="invoice-details.html" className="avatar">
                                <ImageWithBasePath
                                  src="assets/img/users/user-55.jpg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link to="invoice-details.html">
                                    Change on Emp Module
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  #INVOO3
                                  <i className="ti ti-circle-filled fs-4 mx-1 text-primary" />
                                  Ignis LLP
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="fs-13 mb-1">Payment</p>
                            <h6 className="fw-medium">$6985</h6>
                          </td>
                          <td className="px-0 text-end">
                            <span className="badge badge-danger-transparent badge-xs d-inline-flex align-items-center">
                              <i className="ti ti-circle-filled fs-5 me-1" />
                              Unpaid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link to="invoice-details.html" className="avatar">
                                <ImageWithBasePath
                                  src="assets/img/users/user-42.jpg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link to="invoice-details.html">
                                    Changes on the Board
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  #INVOO2
                                  <i className="ti ti-circle-filled fs-4 mx-1 text-primary" />
                                  Ignis LLP
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="fs-13 mb-1">Payment</p>
                            <h6 className="fw-medium">$1457</h6>
                          </td>
                          <td className="px-0 text-end">
                            <span className="badge badge-danger-transparent badge-xs d-inline-flex align-items-center">
                              <i className="ti ti-circle-filled fs-5 me-1" />
                              Unpaid
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-0">
                            <div className="d-flex align-items-center">
                              <Link to="invoice-details.html" className="avatar">
                                <ImageWithBasePath
                                  src="assets/img/users/user-44.jpg"
                                  className="img-fluid rounded-circle"
                                  alt="img"
                                />
                              </Link>
                              <div className="ms-2">
                                <h6 className="fw-medium">
                                  <Link to="invoice-details.html">
                                    Hospital Management
                                  </Link>
                                </h6>
                                <span className="fs-13 d-inline-flex align-items-center">
                                  #INVOO6
                                  <i className="ti ti-circle-filled fs-4 mx-1 text-primary" />
                                  HCL Corp
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <p className="fs-13 mb-1">Payment</p>
                            <h6 className="fw-medium">$6458</h6>
                          </td>
                          <td className="px-0 text-end">
                            <span className="badge badge-success-transparent badge-xs d-inline-flex align-items-center">
                              <i className="ti ti-circle-filled fs-5 me-1" />
                              Paid
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Link to="invoice.html"
                    className="btn btn-light btn-md w-100 mt-2"
                  >
                    View All
                  </Link>
                </div>
              </div>
            </div> */}
            {/* /Invoices */}
            <div className="col-xl-5 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <h5>Performance</h5>
                    <div className="d-flex align-items-center">
                      <div className="dropdown mb-2 me-2">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-white border-0 btn-sm d-inline-flex align-items-center fs-13"
                          data-bs-toggle="dropdown"
                          style={{ pointerEvents: performanceLoading ? 'none' : 'auto' }}
                        >
                          {performanceLoading ? (
                            <div className="spinner-border spinner-border-sm me-1" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : null}
                          {performanceDataType === 'submissions' ? 'Submissions' : 
                           performanceDataType === 'job-offers' ? 'Job Offers' : 'Interview Schedules'}
                        </Link>
                        <ul className="dropdown-menu dropdown-menu-end p-3">
                          <li>
                            <Link to="#"
                              className="dropdown-item rounded-1"
                              onClick={() => handlePerformanceDataTypeChange('submissions')}
                            >
                              Submissions
                            </Link>
                          </li>
                          <li>
                            <Link to="#"
                              className="dropdown-item rounded-1"
                              onClick={() => handlePerformanceDataTypeChange('job-offers')}
                            >
                              Job Offers
                            </Link>
                          </li>
                          <li>
                            <Link to="#"
                              className="dropdown-item rounded-1"
                              onClick={() => handlePerformanceDataTypeChange('interview-schedules')}
                            >
                              Interview Schedules
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="dropdown mb-2">
                        <Link
                          to="#"
                          className="dropdown-toggle btn btn-white border-0 btn-sm d-inline-flex align-items-center fs-13"
                          data-bs-toggle="dropdown"
                          style={{ pointerEvents: performanceLoading ? 'none' : 'auto' }}
                        >
                          {performanceLoading ? (
                            <div className="spinner-border spinner-border-sm me-1" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          ) : null}
                          {selectedEmployeeName}
                        </Link>
                        <ul className="dropdown-menu dropdown-menu-end p-3">
                          <li>
                            <Link to="#"
                              className="dropdown-item rounded-1"
                              onClick={() => handleEmployeeChange('all')}
                            >
                              All Employees
                            </Link>
                          </li>
                          {performanceEmployees.map((employee) => (
                            <li key={employee._id}>
                              <Link to="#"
                                className="dropdown-item rounded-1"
                                onClick={() => handleEmployeeChange(employee._id)}
                              >
                                {employee.firstName} {employee.lastName}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <span className="badge badge-soft-success me-2">
                      <i className="ti ti-crown me-1"></i>
                      Top Performer
                    </span>
                    <small className="text-muted">
                      {topPerformer ? (
                        `${topPerformer.name} (${topPerformer.submissions} ${performanceDataType === 'submissions' ? 'submissions' : 
                                                                        performanceDataType === 'job-offers' ? 'job offers' : 'interview schedules'} this month)`
                      ) : (
                        'Loading...'
                      )}
                    </small>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <div className="bg-light d-flex align-items-center rounded p-2 mb-3">
                      <h3 className="me-2">
                        {performanceLoading ? (
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : performanceData.length > 0 ? (
                          `${Math.round(performanceData[performanceData.length - 1])}%`
                        ) : (
                          '0%'
                        )}
                      </h3>
                      {performanceData.length > 1 && !performanceLoading && (
                        <span className={`badge rounded-pill me-1 ${
                          performanceData[performanceData.length - 1] > performanceData[performanceData.length - 2]
                            ? 'badge-outline-success bg-success-transparent'
                            : 'badge-outline-danger bg-danger-transparent'
                        }`}>
                          {performanceData[performanceData.length - 1] > performanceData[performanceData.length - 2] ? '+' : ''}
                          {Math.round(performanceData[performanceData.length - 1] - performanceData[performanceData.length - 2])}%
                        </span>
                      )}
                      <span>vs last month</span>
                    </div>
                    <div className="mb-2">
                      <small className="text-muted">
                        {performanceLoading ? 'Loading...' : selectedEmployeeName}
                      </small>
                    </div>
                    <ReactApexChart
                      id="performance_chart2"
                      options={performance_chart2}
                      series={performance_chart2.series}
                      type="area"
                      height={288}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {/* Projects */}
            {/* <div className="col-xxl-8 col-xl-7 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Projects</h5>
                  <div className="d-flex align-items-center">
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="btn btn-white border btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Today
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Team</th>
                          <th>Hours</th>
                          <th>Deadline</th>
                          <th>Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-001
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Office Management App
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-02.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-03.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-05.jpg"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">15/255 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={40}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "40%" }}
                              />
                            </div>
                          </td>
                          <td>12/09/2024</td>
                          <td>
                            <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              High
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-002
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">Clinic Management </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-06.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-07.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-08.jpg"
                                  alt="img"
                                />
                              </span>
                              <Link
                                className="avatar bg-primary avatar-rounded text-fixed-white fs-10 fw-medium"
                                to="#"
                              >
                                +1
                              </Link>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">15/255 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={40}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "40%" }}
                              />
                            </div>
                          </td>
                          <td>24/10/2024</td>
                          <td>
                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              Low
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-003
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Educational Platform
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-06.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-08.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-09.jpg"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">40/255 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={50}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "50%" }}
                              />
                            </div>
                          </td>
                          <td>18/02/2024</td>
                          <td>
                            <span className="badge badge-pink d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              Medium
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-004
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Chat &amp; Call Mobile App
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-11.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-12.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-13.jpg"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">35/155 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={50}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "50%" }}
                              />
                            </div>
                          </td>
                          <td>19/02/2024</td>
                          <td>
                            <span className="badge badge-danger d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              High
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-005
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Travel Planning Website
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-17.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-18.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-19.jpg"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">50/235 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={50}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "50%" }}
                              />
                            </div>
                          </td>
                          <td>18/02/2024</td>
                          <td>
                            <span className="badge badge-pink d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              Medium
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <Link to="project-details.html" className="link-default">
                              PRO-006
                            </Link>
                          </td>
                          <td>
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Service Booking Software
                              </Link>
                            </h6>
                          </td>
                          <td>
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-06.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-08.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-09.jpg"
                                  alt="img"
                                />
                              </span>
                            </div>
                          </td>
                          <td>
                            <p className="mb-1">40/255 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={50}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "50%" }}
                              />
                            </div>
                          </td>
                          <td>20/02/2024</td>
                          <td>
                            <span className="badge badge-success d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              Low
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="border-0">
                            <Link to="project-details.html" className="link-default">
                              PRO-008
                            </Link>
                          </td>
                          <td className="border-0">
                            <h6 className="fw-medium">
                              <Link to="project-details.html">
                                Travel Planning Website
                              </Link>
                            </h6>
                          </td>
                          <td className="border-0">
                            <div className="avatar-list-stacked avatar-group-sm">
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-15.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-16.jpg"
                                  alt="img"
                                />
                              </span>
                              <span className="avatar avatar-rounded">
                                <ImageWithBasePath
                                  className="border border-white"
                                  src="assets/img/profiles/avatar-17.jpg"
                                  alt="img"
                                />
                              </span>
                              <Link
                                className="avatar bg-primary avatar-rounded text-fixed-white fs-10 fw-medium"
                                to="#"
                              >
                                +2
                              </Link>
                            </div>
                          </td>
                          <td className="border-0">
                            <p className="mb-1">15/255 Hrs</p>
                            <div
                              className="progress progress-xs w-100"
                              role="progressbar"
                              aria-valuenow={45}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="progress-bar bg-primary"
                                style={{ width: "45%" }}
                              />
                            </div>
                          </td>
                          <td className="border-0">17/10/2024</td>
                          <td className="border-0">
                            <span className="badge badge-pink d-inline-flex align-items-center badge-xs">
                              <i className="ti ti-point-filled me-1" />
                              Medium
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div> */}
            {/* /Projects */}
            {/* Tasks Statistics */}
            {/* <div className="col-xxl-4 col-xl-5 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Tasks Statistics</h5>
                  <div className="d-flex align-items-center">
                    <div className="dropdown mb-2">
                      <Link
                        to="#"
                        className="btn btn-white border btn-sm d-inline-flex align-items-center"
                        data-bs-toggle="dropdown"
                      >
                        <i className="ti ti-calendar me-1" />
                        This Week
                      </Link>
                      <ul className="dropdown-menu  dropdown-menu-end p-3">
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Month
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link to="#"
                            className="dropdown-item rounded-1"
                          >
                            Today
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="chartjs-wrapper-demo position-relative mb-4">
                    <Chart type="doughnut" data={semidonutData} options={semidonutOptions} className="w-full md:w-30rem semi-donut-chart" />
                    <div className="position-absolute text-center attendance-canvas">
                      <p className="fs-13 mb-1">Total Tasks</p>
                      <h3>124/165</h3>
                    </div>
                  </div>
                  <div className="d-flex align-items-center flex-wrap">
                    <div className="border-end text-center me-2 pe-2 mb-3">
                      <p className="fs-13 d-inline-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-10 me-1 text-warning" />
                        Ongoing
                      </p>
                      <h5>24%</h5>
                    </div>
                    <div className="border-end text-center me-2 pe-2 mb-3">
                      <p className="fs-13 d-inline-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-10 me-1 text-info" />
                        On Hold{" "}
                      </p>
                      <h5>10%</h5>
                    </div>
                    <div className="border-end text-center me-2 pe-2 mb-3">
                      <p className="fs-13 d-inline-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-10 me-1 text-danger" />
                        Overdue
                      </p>
                      <h5>16%</h5>
                    </div>
                    <div className="text-center me-2 pe-2 mb-3">
                      <p className="fs-13 d-inline-flex align-items-center mb-1">
                        <i className="ti ti-circle-filled fs-10 me-1 text-success" />
                        Ongoing
                      </p>
                      <h5>40%</h5>
                    </div>
                  </div>
                  <div className="bg-dark br-5 p-3 pb-0 d-flex align-items-center justify-content-between">
                    <div className="mb-2">
                      <h4 className="text-success">389/689 hrs</h4>
                      <p className="fs-13 mb-0">Spent on Overall Tasks This Week</p>
                    </div>
                    <Link to="tasks.html"
                      className="btn btn-sm btn-light mb-2 text-nowrap"
                    >
                      View All
                    </Link>
                  </div>
                </div>
              </div>
            </div> */}
            {/* /Tasks Statistics */}
          </div>
          <div className="row">
            {/* Schedules */}
            <div className="col-xxl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Schedules</h5>
                  <Link to={routes.candidatesGrid} className="btn btn-light btn-md mb-2">
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  {interviewsLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                      <p className="mt-2 text-muted">Loading interviews...</p>
                      </div>
                  ) : interviews.length > 0 ? (
                    interviews.map((interview, index) => (
                      <div key={interview._id} className={`bg-light p-3 br-5 ${index < interviews.length - 1 ? 'mb-4' : 'mb-0'}`}>
                        <span className={`badge badge-${getInterviewBadgeColor(interview.interviewLevel)} badge-xs mb-1`}>
                          {interview.appliedRole}
                    </span>
                    <h6 className="mb-2 text-truncate">
                          Interview - {interview.candidateName}
                    </h6>
                    <div className="d-flex align-items-center flex-wrap">
                      <p className="fs-13 mb-1 me-2">
                        <i className="ti ti-calendar-event me-2" />
                            {formatInterviewDate(interview.scheduledDate)}
                      </p>
                      <p className="fs-13 mb-1">
                        <i className="ti ti-clock-hour-11 me-2" />
                            {formatInterviewTime(interview.scheduledDate)}
                      </p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between border-top mt-2 pt-3">
                      <div className="avatar-list-stacked avatar-group-sm">
                        {/* Candidate Profile Picture */}
                        <span className="avatar avatar-rounded">
                          <img
                            className="border border-white"
                            src={interview.candidateProfileImage ? `${backend_url}/uploads/candidates/${interview.candidateProfileImage}` : "assets/img/users/user-1.jpg"}
                            alt={`${interview.candidateName}`}
                            onError={(e) => {
                              e.currentTarget.src = "assets/img/users/user-1.jpg";
                            }}
                          />
                        </span>
                        {/* Recruiter Profile Picture */}
                        {interview.recruiter && (
                          <span className="avatar avatar-rounded">
                            <img
                              className="border border-white"
                              src={interview.recruiter.profileImage ? `${backend_url}/uploads/${interview.recruiter.profileImage}` : "assets/img/users/user-1.jpg"}
                              alt={`${interview.recruiter.firstName} ${interview.recruiter.lastName}`}
                              onError={(e) => {
                                e.currentTarget.src = "assets/img/users/user-1.jpg";
                              }}
                            />
                          </span>
                        )}
                      </div>
                        <Link
                            to={interview.interviewLink || `${routes.candidatesGrid}?viewCandidate=${interview.candidateId}`} 
                            className="btn btn-primary btn-xs"
                            target={interview.interviewLink ? "_blank" : undefined}
                        >
                            {interview.interviewLink ? 'Join Meeting' : 'View Details'}
                        </Link>
                      </div>
                    </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-calendar-off text-muted fs-2 mb-3"></i>
                      <p className="text-muted">No upcoming interviews scheduled</p>
                  </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Schedules */}
            {/* Recent Activities */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <div>
                    <h5 className="mb-2">Recent Activities</h5>
                    {lastActivitiesUpdate && (
                      <small className="text-muted">
                        Last updated: {lastActivitiesUpdate.toLocaleTimeString()}
                      </small>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      onClick={fetchActivities}
                      className="btn btn-light btn-md mb-2"
                      disabled={activitiesLoading}
                      title="Refresh activities"
                    >
                      <i className={`ti ${activitiesLoading ? 'ti-loader-2' : 'ti-refresh'} ${activitiesLoading ? 'animate-spin' : ''}`}></i>
                    </button>
                    <Link to={routes.activity} className="btn btn-light btn-md mb-2">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="card-body">
                  {activitiesLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading activities...</p>
                    </div>
                  ) : activities.length > 0 ? (
                    activities.slice(0, 6).map((activity) => {
                      const activityDate = new Date(activity.timestamp);
                      const timeString = activityDate.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      });
                      
                      return (
                        <div key={activity._id} className="recent-item">
                          <div className="d-flex justify-content-between">
                            <div className="d-flex align-items-center w-100">
                              <Link to="#" className="avatar flex-shrink-0">
                                {activity.user.profileImage ? (
                                  <img
                                    src={`${backend_url}/uploads/${activity.user.profileImage}`}
                                    className="rounded-circle"
                                    alt="img"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  />
                                ) : (
                                  <ImageWithBasePath
                                    src="assets/img/users/user-01.jpg"
                                    className="rounded-circle"
                                    alt="img"
                                  />
                                )}
                              </Link>
                              <div className="ms-2 flex-fill">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center gap-2">
                                    <h6 className="fs-medium text-truncate">
                                      <Link to="#">{activity.user.firstName} {activity.user.lastName}</Link>
                                    </h6>
                                    <span className={activityService.getActivityLabel(activity.entityType).color}>
                                      {activityService.getActivityLabel(activity.entityType).text}
                                    </span>
                                  </div>
                                  <p className="fs-13">{timeString}</p>
                                </div>
                                <p 
                                  className="fs-13"
                                  dangerouslySetInnerHTML={{
                                    __html: activityService.formatActivityDescription(activity)
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-activity text-muted fs-2 mb-3"></i>
                      <p className="text-muted">No recent activities</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Recent Activities */}
            {/* Birthdays */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Birthdays</h5>
                  <Link to={routes.employeeBirthdays}
                    className="btn btn-light btn-md mb-2"
                  >
                    View All
                  </Link>
                </div>
                <div className="card-body pb-1">
                  {birthdaysLoading ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                                            {/* Today's Birthdays */}
                      {birthdays.today.length > 0 && (
                        <>
                  <h6 className="mb-2">Today</h6>
                          {birthdays.today.map((employee, index) => (
                            <div key={employee._id} className="bg-light p-2 border border-dashed rounded-top mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                                  <Link to={routes.employeedetailsWithId.replace(':id', employee._id)} className="avatar">
                          <ImageWithBasePath
                                      src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "assets/img/users/user-1.jpg"}
                            className="rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2 overflow-hidden">
                                    <h6 className="fs-medium">
                                      <Link to={routes.employeedetailsWithId.replace(':id', employee._id)}>
                                        {employee.fullName}
                                      </Link>
                                    </h6>
                                    <p className="fs-13">{employee.designation}</p>
                        </div>
                      </div>
                                {/* <Link
                        to="#"
                        className="btn btn-secondary btn-xs"
                      >
                        <i className="ti ti-cake me-1" />
                        Send
                                </Link> */}
                    </div>
                  </div>
                          ))}
                        </>
                      )}

                                            {/* Tomorrow's Birthdays */}
                      {birthdays.tomorrow.length > 0 && (
                        <>
                          <h6 className="mb-2">Tomorrow</h6>
                          {birthdays.tomorrow.map((employee, index) => (
                            <div key={employee._id} className="bg-light p-2 border border-dashed rounded-top mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                                  <Link to={routes.employeedetailsWithId.replace(':id', employee._id)} className="avatar">
                          <ImageWithBasePath
                                      src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "assets/img/users/user-1.jpg"}
                            className="rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2 overflow-hidden">
                          <h6 className="fs-medium">
                                      <Link to={routes.employeedetailsWithId.replace(':id', employee._id)}>
                                        {employee.fullName}
                                      </Link>
                          </h6>
                                    <p className="fs-13">{employee.designation}</p>
                        </div>
                      </div>
                                {/* <Link
                        to="#"
                        className="btn btn-secondary btn-xs"
                      >
                        <i className="ti ti-cake me-1" />
                        Send
                                </Link> */}
                    </div>
                  </div>
                          ))}
                        </>
                      )}

                                            {/* Upcoming Birthdays */}
                      {birthdays.upcoming.length > 0 && (
                        <>
                          {birthdays.upcoming.slice(0, 3).map((employee, index) => (
                            <div key={employee._id}>
                              {index === 0 && <h6 className="mb-2">Upcoming this month</h6>}
                  <div className="bg-light p-2 border border-dashed rounded-top mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                                    <Link to={routes.employeedetailsWithId.replace(':id', employee._id)} className="avatar">
                          <ImageWithBasePath
                                        src={employee.profileImage ? `${backend_url}/uploads/${employee.profileImage}` : "assets/img/users/user-1.jpg"}
                            className="rounded-circle"
                            alt="img"
                          />
                        </Link>
                        <div className="ms-2 overflow-hidden">
                                      <h6 className="fs-medium">
                                        <Link to={routes.employeedetailsWithId.replace(':id', employee._id)}>
                                          {employee.fullName}
                                        </Link>
                          </h6>
                                      <p className="fs-13">{employee.designation}</p>
                        </div>
                      </div>
                                  <div className="text-end">
                                    <small className="text-muted">
                                      {new Date(employee.birthday).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </small>
                    </div>
                  </div>
                        </div>
                      </div>
                          ))}
                        </>
                      )}

                      {/* No birthdays message */}
                      {birthdays.today.length === 0 && birthdays.tomorrow.length === 0 && birthdays.upcoming.length === 0 && (
                        <div className="text-center py-3">
                          <p className="text-muted mb-0">No upcoming birthdays in the next 30 days</p>
                    </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* /Birthdays */}
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Modals */}
      <ProjectModals />
      <RequestModals />
      <TodoModal 
        isOpen={todoModalOpen}
        onClose={() => setTodoModalOpen(false)}
        onTodoCreated={handleTodoCreated}
        totalTodos={totalTodos}
      />
    </>
  );
};

export default CandidateDashboard;




