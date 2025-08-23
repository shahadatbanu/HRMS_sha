import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
const todoStyles = `
  .todo-strike .form-check-label {
    text-decoration: line-through;
    color: #6c757d;
    opacity: 0.7;
  }
  
  .todo-strike {
    background-color: #f8f9fa;
    border-color: #dee2e6 !important;
  }
  
  .todo-item {
    transition: all 0.3s ease;
  }
  
  .todo-item:hover {
    background-color: #f8f9fa;
  }
`;

const AdminDashboard = () => {
  const routes = all_routes;
  const { user, isLoading } = useUser();

  const [isTodo, setIsTodo] = useState([false, false, false]);

  const [date, setDate] = useState(new Date());

  const [attendanceStats, setAttendanceStats] = useState<{ present: number; totalEmployees: number } | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  
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
  
  // Add state for todos (for Todo card)
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [todoModalOpen, setTodoModalOpen] = useState(false);

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

  useEffect(() => {
    setAttendanceLoading(true);
    getAbsenceStats()
      .then((stats) => {
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
    // fetchEmployees(); // Fetch employees data on component mount - moved to user effect
  }, []);

  // Fetch employees when user is loaded
  useEffect(() => {
    if (user && !isLoading) {
      fetchEmployees();
      fetchTodos();
    }
  }, [user, isLoading]);

  // Update chart data when attendance overview changes
  useEffect(() => {
    setChartData({
      labels: ['Late', 'Present', 'On Leave', 'Absent'],
      datasets: [
        {
          label: 'Semi Donut',
          data: [
            attendanceOverview.late,
            attendanceOverview.present,
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
        const present = data.filter((attendance: any) => attendance.status === 'Present').length;
        const late = data.filter((attendance: any) => attendance.status === 'Late').length;
        const onLeave = data.filter((attendance: any) => attendance.status === 'On Leave').length;
        const absent = data.filter((attendance: any) => attendance.status === 'Absent').length;
        const total = data.length;
        
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
      const response = await fetch(`${backend_url}/api/employees?limit=5`, {
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
  const fetchTodos = async () => {
    try {
      setTodosLoading(true);
      
      const result = await todoService.getTodos({ limit: 5 });
      setTodos(result.data);
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
    fetchTodos();
  };

  // Handle click on leave requests link
  const handleLeaveRequestsClick = () => {
    // Refresh the count before navigating
    fetchPendingLeaveRequests();
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

  //New Chart
  const [empDepartment] = useState<any>({
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
      data: [80, 110, 80, 20, 60, 100],
      name: 'Employee'
    }],
    xaxis: {
      categories: ['UI/UX', 'Development', 'Management', 'HR', 'Testing', 'Marketing'],
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
  const [semidonutData, setSemidonutData] = useState({});
  const [semidonutOptions, setSemidonutOptions] = useState({});
  const toggleTodo = (index: number) => {
    setIsTodo((prevIsTodo) => {
      const newIsTodo = [...prevIsTodo];
      newIsTodo[index] = !newIsTodo[index];
      return newIsTodo;
    });
  };
  useEffect(() => {

    const data = {
      labels: ["Ongoing", "Onhold", "Completed", "Overdue"],
      datasets: [
        {
          label: 'Semi Donut',
          data: [20, 40, 20, 10],
          backgroundColor: ['#FFC107', '#1B84FF', '#03C95A', '#E70D0D'],
          borderWidth: -10,
          borderColor: 'transparent', // Border between segments
          hoverBorderWidth: 0,   // Border radius for curved edges
          cutout: '75%',
          spacing: -30,
        },
      ],
    };

    const options = {
      rotation: -100,
      circumference: 185,
      layout: {
        padding: {
          top: -20,    // Set to 0 to remove top padding
          bottom: 20, // Set to 0 to remove bottom padding
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Hide the legend
        }
        }
    };

    setSemidonutData(data);
    setSemidonutOptions(options);
  }, []);

  const profileImg = user && user.profileImage ? `${backend_url}/uploads/${user.profileImage}` : 'assets/img/profiles/avatar-31.jpg';

  return (
    <>
      {/* Inject CSS styles for todo strike-through effect */}
      <style dangerouslySetInnerHTML={{ __html: todoStyles }} />
      
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Admin Dashboard</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Dashboard</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Admin Dashboard
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
                    Welcome Back, {isLoading ? '...' : (user ? `${user.firstName} ${user.lastName}` : 'Admin')}{" "}
                    {/* <Link to="#" className="edit-icon">
                      <i className="ti ti-edit fs-14" />
                    </Link> */}
                  </h3>
                  <p>
                    You have{" "}
                    <Link 
                      to={routes.leaveadmin} 
                      className={`text-decoration-underline cursor-pointer position-relative ${
                        leaveRequestsCount > 0 ? 'text-danger fw-bold' : 'text-primary'
                      }`}
                      style={{ cursor: 'pointer' }}
                      title={leaveRequestsCount > 0 ? `Click to view ${leaveRequestsCount} new leave requests` : 'No new leave requests'}
                      onClick={handleLeaveRequestsClick}
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
            <div className="col-xxl-8 d-flex">
              <div className="row flex-fill">
                <div className="col-md-3 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <span className="avatar rounded-circle bg-primary mb-2">
                        <i className="ti ti-calendar-share fs-16" />
                      </span>
                      <h6 className="fs-13 fw-medium text-default mb-1">
                        Attendance
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
                        <span className="fs-12 fw-medium text-success">
                          <i className="fa-solid fa-caret-up me-1" />
                          +2.1%
                        </span>
                      </h3>
                      <Link to="attendance-employee.html" className="link-default">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-md-3 d-flex">
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
                <div className="col-md-3 d-flex">
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
                <div className="col-md-3 d-flex">
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
                <div className="col-md-3 d-flex">
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
                </div>
                <div className="col-md-3 d-flex">
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
                </div>
                <div className="col-md-3 d-flex">
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
                </div>
                <div className="col-md-3 d-flex">
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
                </div>
              </div>
            </div>
            {/* /Widget Info */}
            {/* Employees By Department */}
            <div className="col-xxl-4 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Employees By Department</h5>
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
                          Last Week
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body">
                  <ReactApexChart
                    id="emp-department"
                    options={empDepartment}
                    series={empDepartment.series}
                    type="bar"
                    height={220}
                  />
                  <p className="fs-13">
                    <i className="ti ti-circle-filled me-2 fs-8 text-primary" />
                    No of Employees increased by{" "}
                    <span className="text-success fw-bold">+20%</span> from last
                    Week
                  </p>
                </div>
              </div>
            </div>
            {/* /Employees By Department */}
          </div>
          <div className="row">
            {/* Total Employee */}
            <div className="col-xxl-4 d-flex">
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
            </div>
            {/* /Total Employee */}
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
                          <ImageWithBasePath
                                src={attendance.employeeId?.profileImage || "assets/img/profiles/avatar-24.jpg"}
                            className="rounded-circle border border-2"
                            alt="img"
                          />
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
                        <ImageWithBasePath
                                    src={attendance.employeeId?.profileImage || "assets/img/profiles/avatar-29.jpg"}
                          className="rounded-circle border border-2"
                          alt="img"
                        />
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
            <div className="col-xxl-4 d-flex">
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
            </div>
            {/* /Jobs Applicants */}
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
            </div>
            {/* /Employees */}
            {/* Todo */}
            <div className="col-xxl-4 col-xl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-header pb-2 d-flex align-items-center justify-content-between flex-wrap">
                  <h5 className="mb-2">Todo</h5>
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
                      onClick={() => setTodoModalOpen(true)}
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
                      <div key={todo._id} className={`d-flex align-items-center todo-item border p-2 br-5 mb-2 ${todo.completed ? 'todo-strike' : ''}`}>
                    <i className="ti ti-grid-dots me-2" />
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                            id={`todo${todo._id}`}
                            checked={todo.completed}
                            onChange={() => toggleTodoCompletion(todo._id)}
                      />
                          <label className="form-check-label fw-medium" htmlFor={`todo${todo._id}`}>
                            {todo.title}
                      </label>
                    </div>
                  </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <i className="ti ti-checklist-off fs-1 text-muted mb-3"></i>
                      <p className="text-muted">No todos found.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Todo */}
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
      />
    </>
  );
};

export default AdminDashboard;




