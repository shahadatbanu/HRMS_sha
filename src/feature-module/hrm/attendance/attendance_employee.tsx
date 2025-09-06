import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { all_routes } from '../../router/all_routes';
import PredefinedDateRanges from '../../../core/common/datePicker';
import ImageWithBasePath from '../../../core/common/imageWithBasePath';
import ProfileImage from '../../../core/common/ProfileImage';
import Table from "../../../core/common/dataTable/index";
import CommonSelect from '../../../core/common/commonSelect';
import CollapseHeader from '../../../core/common/collapse-header/collapse-header';
import { useUser } from '../../../core/context/UserContext';
import { 
  getEmployeeAttendance, 
  getTodayAttendance, 
  checkIn, 
  checkOut, 
  getAttendanceStatistics,
  formatAttendanceForTable,
  type AttendanceRecord,
  type AttendanceStatistics
} from '../../../core/services/attendanceService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import holidayService, { Holiday } from '../../../core/services/holidayService';
import leaveService, { LeaveRecord } from '../../../core/services/leaveService';

const AttendanceEmployee = () => {
  const { user } = useUser();
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [statistics, setStatistics] = useState<AttendanceStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    sortBy: 'date' as string
  });
  const [prevWeekStats, setPrevWeekStats] = useState<AttendanceStatistics | null>(null);
  const [prevMonthStats, setPrevMonthStats] = useState<AttendanceStatistics | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [allHolidays, setAllHolidays] = useState<Holiday[]>([]);
  const [geolocationSupported, setGeolocationSupported] = useState(false);
  const [geolocationPermission, setGeolocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const today = new Date();

  // Get employee ID from current user context
  const employeeId = user?._id;

  // Get backend URL for profile images
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Geolocation helper functions
  const checkGeolocationSupport = () => {
    if ('geolocation' in navigator) {
      setGeolocationSupported(true);
      return true;
    } else {
      setGeolocationSupported(false);
      setLocationError('Geolocation is not supported by this browser');
      return false;
    }
  };

  const requestGeolocationPermission = async () => {
    if (!checkGeolocationSupport()) return false;

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      setGeolocationPermission(permission.state);
      
      permission.onchange = () => {
        setGeolocationPermission(permission.state);
      };
      
      return permission.state === 'granted';
    } catch (error) {
      console.error('Error checking geolocation permission:', error);
      return false;
    }
  };

  const getCurrentPosition = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setCurrentLocation(location);
          setLocationError(null);
          
          // Get location name
          try {
            const locationNameResult = await getLocationName(location.latitude, location.longitude);
            setLocationName(locationNameResult);
          } catch (error) {
            console.warn('Could not get location name:', error);
            setLocationName(null);
          }
          
          resolve(location);
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              setGeolocationPermission('denied');
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
            default:
              errorMessage = 'An unknown error occurred while getting location.';
              break;
          }
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Reverse geocoding function to get location name from coordinates
  const getLocationName = async (latitude: number, longitude: number): Promise<string> => {
    try {
      setLocationLoading(true);
      console.log('getLocationName called with:', { latitude, longitude });
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'HRMS-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location name');
      }
      
      const data = await response.json();
      console.log('Nominatim API response:', data);
      
      if (data.display_name) {
        // Try to get more specific location details
        let locationName = '';
        
        // Check for specific address components
        if (data.address) {
          // Try to build a more specific address
          const address = data.address;
          
          // Start with the most specific location
          if (address.road) {
            locationName = address.road;
            if (address.house_number) {
              locationName = `${address.house_number} ${locationName}`;
            }
          } else if (address.suburb) {
            locationName = address.suburb;
          } else if (address.neighbourhood) {
            locationName = address.neighbourhood;
          } else if (address.quarter) {
            locationName = address.quarter;
          }
          
          // Add city/district if we have a specific location
          if (locationName && address.city) {
            locationName += `, ${address.city}`;
          } else if (locationName && address.town) {
            locationName += `, ${address.town}`;
          } else if (address.district) {
            locationName += `, ${address.district}`;
          }
          
          // Add state if we have location details
          if (locationName && address.state) {
            locationName += `, ${address.state}`;
          }
        }
        
        // If we couldn't build a specific address, use a smarter parsing of display_name
        if (!locationName) {
          const addressParts = data.display_name.split(', ');
          
          // Look for more specific parts (avoid repetitive names)
          const specificParts = [];
          const seenNames = new Set();
          
          for (const part of addressParts) {
            if (!seenNames.has(part.toLowerCase()) && part.trim()) {
              specificParts.push(part);
              seenNames.add(part.toLowerCase());
            }
          }
          
          // Take first 4 parts for more detail, but avoid repetition
          locationName = specificParts.slice(0, 4).join(', ');
        }
        
        console.log('Final location name:', locationName);
        return locationName || 'Unknown Location';
      } else {
        return 'Unknown Location';
      }
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Location Unavailable';
    } finally {
      setLocationLoading(false);
    }
  };

  // All useEffect hooks at the top level
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize geolocation
    requestGeolocationPermission();
  }, []);

  useEffect(() => {
    async function fetchHolidays() {
      try {
        const res = await holidayService.getHolidays();
        setAllHolidays(res.data);
      } catch {
        setAllHolidays([]);
      }
    }
    fetchHolidays();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchAttendanceData();
      fetchTodayAttendance();
      fetchStatistics();
      fetchPrevPeriodStats();
    }
  }, [employeeId, filters]);

  useEffect(() => {
    if (!employeeId) return;
    (async () => {
      try {
        const res = await getAttendanceStatistics(employeeId, 'week', yesterday, endOfYesterday);
        setYesterdayStats(res.data);
      } catch {
        setYesterdayStats(null);
      }
    })();
  }, [employeeId, filters]);

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!employeeId) return;
    
    try {
      setLoading(true);
      const response = await getEmployeeAttendance(employeeId, filters);
      const formattedData = response.data.map(formatAttendanceForTable);
      setAttendanceData(formattedData);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch today's attendance
  const fetchTodayAttendance = async () => {
    if (!employeeId) return;
    
    try {
      const response = await getTodayAttendance(employeeId);
      console.log('Today attendance data:', response.data);
      setTodayAttendance(response.data);
      
      // Set location data from attendance record if available
      if (response.data?.checkIn?.locationName) {
        console.log('Setting location name from attendance:', response.data.checkIn.locationName);
        setLocationName(response.data.checkIn.locationName);
      }
      
      // Set current location from geolocation data if available
      if (response.data?.checkIn?.geolocation?.latitude && response.data?.checkIn?.geolocation?.longitude) {
        console.log('Setting current location from attendance:', response.data.checkIn.geolocation);
        setCurrentLocation({
          latitude: response.data.checkIn.geolocation.latitude,
          longitude: response.data.checkIn.geolocation.longitude
        });
      }
    } catch (error) {
      console.error('Error fetching today\'s attendance:', error);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!employeeId) return;
    
    try {
      const response = await getAttendanceStatistics(employeeId, 'month');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch previous week and month stats
  const fetchPrevPeriodStats = async () => {
    if (!employeeId) return;
    // Calculate previous week range (Sunday to Saturday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const thisSunday = new Date(now);
    thisSunday.setDate(now.getDate() - dayOfWeek);
    thisSunday.setHours(0, 0, 0, 0);
    const lastSunday = new Date(thisSunday);
    lastSunday.setDate(thisSunday.getDate() - 7);
    const lastSaturday = new Date(lastSunday);
    lastSaturday.setDate(lastSunday.getDate() + 6);
    lastSaturday.setHours(23, 59, 59, 999);
    // Calculate previous month range
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(firstOfThisMonth);
    firstOfLastMonth.setMonth(firstOfThisMonth.getMonth() - 1);
    const endOfLastMonth = new Date(firstOfThisMonth);
    endOfLastMonth.setDate(0); // last day of previous month
    endOfLastMonth.setHours(23, 59, 59, 999);
    // Fetch stats
    try {
      const weekRes = await getAttendanceStatistics(employeeId, 'week', lastSunday, lastSaturday);
      setPrevWeekStats(weekRes.data);
      const monthRes = await getAttendanceStatistics(employeeId, 'month', firstOfLastMonth, endOfLastMonth);
      setPrevMonthStats(monthRes.data);
    } catch (error) {
      setPrevWeekStats(null);
      setPrevMonthStats(null);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!employeeId) return;
    
    try {
      setCheckInLoading(true);
      setLocationError(null);
      
      let geolocation = null;
      let locationNameResult = '';
      
      // Try to get current location if geolocation is supported and permitted
      if (geolocationSupported && geolocationPermission !== 'denied') {
        try {
          geolocation = await getCurrentPosition();
          console.log('Got geolocation:', geolocation);
          
          // Get location name if we have coordinates
          if (geolocation) {
            console.log('Calling getLocationName with coordinates:', geolocation);
            locationNameResult = await getLocationName(geolocation.latitude, geolocation.longitude);
            console.log('Location name result:', locationNameResult);
            setLocationName(locationNameResult);
          }
        } catch (error) {
          console.warn('Could not get location for check-in:', error);
          // Continue with check-in even if location fails
        }
      }
      
      console.log('Final location data for check-in:', { locationNameResult, geolocation });
      
      await checkIn(employeeId, '', locationNameResult, geolocation);
      await fetchTodayAttendance();
      await fetchAttendanceData();
    } catch (error: any) {
      console.error('Error during check-in:', error);
      if (error.response?.data?.message) {
        setLocationError(error.response.data.message);
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!employeeId) return;
    
    try {
      setCheckOutLoading(true);
      setLocationError(null);
      
      let geolocation = null;
      let locationNameResult = '';
      
      // Try to get current location if geolocation is supported and permitted
      if (geolocationSupported && geolocationPermission !== 'denied') {
        try {
          geolocation = await getCurrentPosition();
          // Get location name if we have coordinates
          if (geolocation) {
            locationNameResult = await getLocationName(geolocation.latitude, geolocation.longitude);
            setLocationName(locationNameResult);
          }
        } catch (error) {
          console.warn('Could not get location for check-out:', error);
          // Continue with check-out even if location fails
        }
      }
      
      await checkOut(employeeId, '', locationNameResult, geolocation);
      await fetchTodayAttendance();
      await fetchAttendanceData();
    } catch (error: any) {
      console.error('Error during check-out:', error);
      if (error.response?.data?.message) {
        setLocationError(error.response.data.message);
      }
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Calculate percent change for today vs yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const endOfYesterday = new Date(yesterday);
  endOfYesterday.setHours(23, 59, 59, 999);
  const [yesterdayStats, setYesterdayStats] = useState<AttendanceStatistics | null>(null);

  // Calculate current production hours
  const getCurrentProductionHours = () => {
    if (!todayAttendance || !todayAttendance.checkIn || todayAttendance.status === 'Absent') return 0;
    try {
      const checkInTime = new Date(todayAttendance.checkIn.time);
      let endTime: Date;
      if (todayAttendance.checkOut && todayAttendance.checkOut.time) {
        endTime = new Date(todayAttendance.checkOut.time);
      } else {
        endTime = new Date();
      }
      // Check if checkInTime is valid
      if (isNaN(checkInTime.getTime()) || isNaN(endTime.getTime())) return 0;
      const diffHours = (endTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
      const breakHours = (todayAttendance.totalBreakTime || 0) / 60;
      const productionHours = Math.max(0, diffHours - breakHours);
      return isNaN(productionHours) ? 0 : productionHours;
    } catch (error) {
      console.error('Error calculating production hours:', error);
      return 0;
    }
  };

  // Check if employee is currently checked in
  const isCheckedIn = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut;

  // Calculate total working hours for today (including in-progress if checked in)
  let totalWorkingHours = statistics?.totalWorkingHours || 0;
  if (
    todayAttendance &&
    todayAttendance.checkIn &&
    !todayAttendance.checkOut?.time &&
    todayAttendance.status !== 'Absent'
  ) {
    const checkInTime = new Date(todayAttendance.checkIn.time);
    const now = new Date();
    const breakHours = (todayAttendance.totalBreakTime || 0) / 60;
    const inProgressHours = Math.max(0, (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) - breakHours);
    totalWorkingHours += inProgressHours;
  }

  // Calculate total working hours for this week (including in-progress if checked in and today is in this week)
  let totalWorkingHoursWeek = statistics?.totalWorkingHours || 0;
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as first day
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  if (
    todayAttendance &&
    todayAttendance.checkIn &&
    !todayAttendance.checkOut?.time &&
    todayAttendance.status !== 'Absent' &&
    today >= firstDayOfWeek &&
    today <= lastDayOfWeek
  ) {
    const checkInTime = new Date(todayAttendance.checkIn.time);
    const breakHours = (todayAttendance.totalBreakTime || 0) / 60;
    const inProgressHours = Math.max(0, (today.getTime() - checkInTime.getTime()) / (1000 * 60 * 60) - breakHours);
    totalWorkingHoursWeek += inProgressHours;
  }

  // Helper to calculate percent change and arrow
  const getPercentChange = (current: number, prev: number) => {
    if (prev === 0) return { percent: 100, up: current > 0 };
    const percent = ((current - prev) / prev) * 100;
    return { percent: Math.abs(percent), up: percent >= 0 };
  };

  // Calculate percent changes for cards
  const weekChange = getPercentChange(totalWorkingHoursWeek, prevWeekStats?.totalWorkingHours || 0);
  const monthChange = getPercentChange(statistics?.totalWorkingHours || 0, prevMonthStats?.totalWorkingHours || 0);
  const todayChange = getPercentChange(totalWorkingHours, yesterdayStats?.totalWorkingHours || 0);
  const overtimeChange = getPercentChange(
    statistics?.totalOvertimeHours || 0,
    prevMonthStats?.totalOvertimeHours || 0
  );

  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      sorter: (a: any, b: any) => a.Date.length - b.Date.length,
    },
    {
      title: "Check In",
      dataIndex: "CheckIn",
      sorter: (a: any, b: any) => a.CheckIn.length - b.CheckIn.length,
    },
    {
      title: "Location",
      dataIndex: "Location",
      render: (text: String, record: any) => {
        // Check if we have geolocation data
        const hasGeolocation = record.geolocation && 
          record.geolocation.latitude && 
          record.geolocation.longitude;
        
        if (hasGeolocation) {
          const mapUrl = `https://www.google.com/maps?q=${record.geolocation.latitude},${record.geolocation.longitude}`;
          return (
            <a 
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-decoration-none fs-12"
              title="Click to open in Google Maps"
            >
              <i className="ti ti-map-pin me-1" />
              {text || '-'}
              <i className="ti ti-external-link ms-1" />
            </a>
          );
        } else {
          return (
            <span className="text-muted fs-12">
              <i className="ti ti-map-pin me-1" />
              {text || '-'}
            </span>
          );
        }
      },
      sorter: (a: any, b: any) => (a.Location || '').length - (b.Location || '').length,
    },
    {
      title: "Status",
      dataIndex: "Status",
      render: (text: String, record: any) => (
        <span className={`badge ${text === 'Present' ? 'badge-success-transparent' : 'badge-danger-transparent'} d-inline-flex align-items-center`}>
          <i className="ti ti-point-filled me-1" />
          {record.Status}
        </span>
      ),
      sorter: (a: any, b: any) => a.Status.length - b.Status.length,
    },
    {
      title: "Check Out",
      dataIndex: "CheckOut",
      sorter: (a: any, b: any) => a.CheckOut.length - b.CheckOut.length,
    },
    {
      title: "Late",
      dataIndex: "Late",
      sorter: (a: any, b: any) => a.Late.length - b.Late.length,
    },
    {
      title: "Overtime",
      dataIndex: "Overtime",
      sorter: (a: any, b: any) => a.Overtime.length - b.Overtime.length,
    },
    {
      title: "Production Hours",
      dataIndex: "ProductionHours",
      render: (text: String, record: any) => (
        <span className={`badge d-inline-flex align-items-center badge-sm ${record.ProductionHours < '8.00'
          ? 'badge-danger'
          : record.ProductionHours >= '8.00' && record.ProductionHours <= '9.00'
            ? 'badge-success'
            : 'badge-info'
          }`}
        >
          <i className="ti ti-clock-hour-11 me-1"></i>{record.ProductionHours}
        </span>
      ),
      sorter: (a: any, b: any) => a.ProductionHours.length - b.ProductionHours.length,
    },
  ];

  // Show loading or error message if user is not logged in
  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <i className="ti ti-user-off fs-1 text-muted mb-3"></i>
              <h4>Please log in to view attendance</h4>
              <p className="text-muted">You need to be logged in to access your attendance records.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // After fetching and formatting attendanceData, override today's row with live production hours if checked in
  const todayDateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
  const liveProductionHours = getCurrentProductionHours().toFixed(2);
  const updatedAttendanceData = attendanceData.map(row => {
    if (
      row.Date === todayDateStr &&
      todayAttendance &&
      todayAttendance.checkIn &&
      !todayAttendance.checkOut?.time &&
      todayAttendance.status !== 'Absent'
    ) {
      return { ...row, ProductionHours: liveProductionHours };
    }
    return row;
  });

  // Fetch attendance and holidays for calendar (current month)
  const fetchCalendarAttendance = async (start: Date, end: Date) => {
    if (!employeeId) return;
    try {
      // Attendance events
      const filters = {
        startDate: start.toISOString().slice(0, 10),
        endDate: end.toISOString().slice(0, 10),
      };
      const response = await getEmployeeAttendance(employeeId, filters);
      const attendanceEvents = response.data.map((rec: any) => {
        let color = '#22c55e'; // Present: green
        if (rec.status === 'Absent') color = '#ef4444'; // Absent: red
        else if (rec.status === 'Late') color = '#f59e42'; // Late: orange
        else if (rec.status === 'Half Day') color = '#facc15'; // Half Day: yellow
        else if (rec.status === 'On Leave') color = '#8b5cf6'; // On Leave: purple
        return {
          title: rec.status,
          start: rec.date,
          end: rec.date,
          backgroundColor: color,
          borderColor: color,
          allDay: true,
        };
      });
      
      // Leave events
      const leaveResponse = await leaveService.getEmployeeLeaves(employeeId);
      const leaveEvents = leaveResponse.data
        .filter((leave: LeaveRecord) => leave.status === 'Approved')
        .map((leave: LeaveRecord) => ({
          title: `Leave: ${leave.leaveType}`,
          start: leave.from,
          end: leave.to,
          backgroundColor: '#8b5cf6', // purple
          borderColor: '#8b5cf6',
          textColor: '#fff',
          allDay: true,
          extendedProps: {
            type: 'leave',
            leaveType: leave.leaveType,
            reason: leave.reason
          }
        }));
      
      // Holiday events
      const holidaysRes = await holidayService.getHolidays();
      const holidays = holidaysRes.data.filter((h: Holiday) => {
        const d = new Date(h.date);
        return d >= start && d <= end;
      });
      const holidayEvents = holidays.map((h: Holiday) => ({
        title: h.name,
        start: h.date,
        end: h.date,
        backgroundColor: '#3b82f6', // blue
        borderColor: '#3b82f6',
        textColor: '#fff',
        allDay: true,
      }));
      
      setCalendarEvents([...attendanceEvents, ...leaveEvents, ...holidayEvents]);
    } catch (err) {
      setCalendarEvents([]);
    }
  };

  // On calendar view change, fetch relevant attendance
  const handleCalendarDatesSet = (arg: any) => {
    fetchCalendarAttendance(arg.start, arg.end);
  };

  // Helper: is today a holiday? (robust local date comparison)
  const isTodayHoliday = allHolidays.some(h => {
    const holidayDate = new Date(h.date);
    return (
      holidayDate.getFullYear() === today.getFullYear() &&
      holidayDate.getMonth() === today.getMonth() &&
      holidayDate.getDate() === today.getDate()
    );
  });
  const isTodaySunday = today.getDay() === 0;
  let punchMessage = '';
  if (isTodayHoliday) punchMessage = 'Today is a holiday! Enjoy your day off.';
  else if (isTodaySunday) punchMessage = 'It’s Sunday, enjoy your day off!';

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          {/* Breadcrumb */}
          <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
            <div className="my-auto mb-2">
              <h2 className="mb-1">Employee Attendance</h2>
              <nav>
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to={all_routes.adminDashboard}>
                      <i className="ti ti-smart-home" />
                    </Link>
                  </li>
                  <li className="breadcrumb-item">Employee</li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Employee Attendance
                  </li>
                </ol>
              </nav>
            </div>
            {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap ">
              <div className="me-2 mb-2">
                <div className="d-flex align-items-center border bg-white rounded p-1 me-2 icon-list">
                  <Link
                    to={all_routes.attendanceemployee}
                    className="btn btn-icon btn-sm active bg-primary text-white me-1"
                  >
                    <i className="ti ti-brand-days-counter" />
                  </Link>
                  <Link to={all_routes.attendanceadmin} className="btn btn-icon btn-sm">
                    <i className="ti ti-calendar-event" />
                  </Link>
                </div>
              </div>
              <div className="me-2 mb-2">
                <div className="dropdown">
                  <Link
                    to="#"
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
                {/* <Link
                  to="#"
                  className="btn btn-primary d-flex align-items-center"
                  data-bs-toggle="modal" data-inert={true}
                  data-bs-target="#attendance_report"
                >
                  <i className="ti ti-file-analytics me-2" />
                  Report
                </Link>
              </div>
              <div className="ms-2 head-icons">
              <CollapseHeader /> */}
              {/* </div>
            </div> } */}
          </div>
          {/* /Breadcrumb */}
          <div className="row">
            {/* Card 1: Name and punch card */}
            <div className="col-xl-4 col-lg-4 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="mb-3 text-center">
                    <h6 className="fw-medium text-gray-5 mb-2">
                      Good Morning, {user?.firstName || 'Employee'}
                    </h6>
                    <h4>{currentTime.toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}, {currentTime.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}</h4>
                  </div>
                  <div className="profile-square-lg" style={{ width: 140, height: 140, margin: '0 auto', marginBottom: 32 }}>
                    <ProfileImage
                      profileImage={user?.profileImage}
                      alt="Employee Profile"
                      className="img-fluid"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }}
                      fallbackSrc="assets/img/users/user-13.jpg"
                    />
                  </div>
                  <div style={{ marginBottom: 24 }}></div>
                  <div className="text-center">
                    <div className="badge badge-md badge-primary mb-3">
                      Production : {getCurrentProductionHours().toFixed(2)} hrs
                    </div>
                    <h6 className="fw-medium d-flex align-items-center justify-content-center mb-3">
                      <i className="ti ti-fingerprint text-primary me-1" />
                      {todayAttendance?.checkIn 
                        ? `Punch In at ${todayAttendance.formattedCheckIn}`
                        : 'Not checked in today'
                      }
                    </h6>
                    {(!todayAttendance?.checkIn && punchMessage) ? (
                      <div className="text-info fw-medium" style={{ marginTop: 16 }}>{punchMessage}</div>
                    ) :
                    (!todayAttendance?.checkIn ? (
                      <button 
                        className="btn btn-primary btn-sm w-auto"
                        style={{ minWidth: 140, margin: '0 auto', display: 'block' }}
                        onClick={handleCheckIn}
                        disabled={checkInLoading || isTodayHoliday || isTodaySunday}
                      >
                        {checkInLoading ? 'Checking In...' : 'Punch In'}
                      </button>
                    ) : todayAttendance?.checkIn && !todayAttendance?.checkOut?.time && todayAttendance?.status !== 'Absent' ? (
                      <button 
                        className="btn btn-dark btn-sm w-auto"
                        style={{ minWidth: 140, margin: '0 auto', display: 'block' }}
                        onClick={handleCheckOut}
                        disabled={checkOutLoading}
                      >
                        {checkOutLoading ? 'Checking Out...' : 'Punch Out'}
                      </button>
                    ) : todayAttendance?.checkOut?.time ? (
                      <div className="text-success">
                        <i className="ti ti-check-circle me-1" />
                        Checked out for today
                      </div>
                    ) : todayAttendance?.status === 'Absent' ? (
                      <div className="text-danger">
                        <i className="ti ti-user-x me-1" />
                        Marked as absent today
                      </div>
                    ) : null)}
                    
                    {/* Location Status Indicator */}
                    <div className="mt-3">
                      <div className="d-flex align-items-center justify-content-center mb-2">
                        <i className={`ti ${geolocationSupported ? 'ti-map-pin' : 'ti-map-pin-off'} me-2 ${geolocationSupported ? 'text-success' : 'text-muted'}`} />
                        <span className="fs-12 text-muted">
                          {geolocationSupported ? 'Location tracking enabled' : 'Location tracking not available'}
                        </span>
                      </div>
                      
                      {geolocationSupported && (
                        <div className="d-flex align-items-center justify-content-center mb-2">
                          <i className={`ti ${geolocationPermission === 'granted' ? 'ti-shield-check' : geolocationPermission === 'denied' ? 'ti-shield-x' : 'ti-shield'} me-2 ${geolocationPermission === 'granted' ? 'text-success' : geolocationPermission === 'denied' ? 'text-danger' : 'text-warning'}`} />
                          <span className="fs-12 text-muted">
                            {geolocationPermission === 'granted' ? 'Location access granted' : 
                             geolocationPermission === 'denied' ? 'Location access denied' : 
                             'Location permission pending'}
                          </span>
                        </div>
                      )}
                      
                      {currentLocation && (
                        <div className="d-flex align-items-center justify-content-center">
                          <i className="ti ti-crosshair me-2 text-info" />
                          {locationLoading ? (
                            <span className="fs-12 text-muted">
                              <i className="ti ti-loader ti-spin me-1" />
                              Getting location...
                            </span>
                          ) : (locationName || todayAttendance?.checkIn?.locationName) ? (
                            <span className="fs-12 text-muted" title={`${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`}>
                              {locationName || todayAttendance?.checkIn?.locationName}
                            </span>
                          ) : (
                            <span className="fs-12 text-muted">
                              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {locationError && (
                        <div className="alert alert-warning alert-sm mt-2 mb-0">
                          <i className="ti ti-alert-triangle me-1" />
                          <span className="fs-12">{locationError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Card 2: Big card with 4 stats cards in 2x2 grid */}
            <div className="col-xl-4 col-lg-4 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <span className="avatar avatar-sm bg-primary mb-2">
                            <i className="ti ti-clock-stop" />
                          </span>
                          <h2 className="mb-2">
                            {totalWorkingHours.toFixed(2)} / <span className="fs-20 text-gray-5"> 9</span>
                          </h2>
                          <p className="fw-medium text-truncate">Total Hours Today</p>
                          <p className="d-flex align-items-center fs-13">
                            <span className={`avatar avatar-xs rounded-circle ${todayChange.up ? 'bg-success' : 'bg-danger'} flex-shrink-0 me-2`}>
                              <i className={`ti ${todayChange.up ? 'ti-arrow-up' : 'ti-arrow-down'} fs-12`} />
                            </span>
                            <span>{todayChange.percent.toFixed(0)}% Yesterday</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <span className="avatar avatar-sm bg-dark mb-2">
                            <i className="ti ti-clock-up" />
                          </span>
                          <h2 className="mb-2">
                            {totalWorkingHoursWeek.toFixed(0) || '0'} / <span className="fs-20 text-gray-5"> 40</span>
                          </h2>
                          <p className="fw-medium text-truncate">Total Hours Week</p>
                          <p className="d-flex align-items-center fs-13">
                            <span className={`avatar avatar-xs rounded-circle ${weekChange.up ? 'bg-success' : 'bg-danger'} flex-shrink-0 me-2`}>
                              <i className={`ti ${weekChange.up ? 'ti-arrow-up' : 'ti-arrow-down'} fs-12`} />
                            </span>
                            <span>{weekChange.percent.toFixed(0)}% Last Week</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <span className="avatar avatar-sm bg-info mb-2">
                            <i className="ti ti-calendar-up" />
                          </span>
                          <h2 className="mb-2">
                            {statistics?.presentDays || '0'} / <span className="fs-20 text-gray-5"> {statistics?.totalDays || '0'}</span>
                          </h2>
                          <p className="fw-medium text-truncate">Total Hours Month</p>
                          <p className="d-flex align-items-center fs-13 text-truncate">
                            <span className={`avatar avatar-xs rounded-circle ${monthChange.up ? 'bg-success' : 'bg-danger'} flex-shrink-0 me-2`}>
                              <i className={`ti ${monthChange.up ? 'ti-arrow-up' : 'ti-arrow-down'} fs-12`} />
                            </span>
                            <span>{monthChange.percent.toFixed(0)}% Last Month</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="card bg-light h-100">
                        <div className="card-body">
                          <span className="avatar avatar-sm bg-pink mb-2">
                            <i className="ti ti-calendar-star" />
                          </span>
                          <h2 className="mb-2">
                            {statistics?.totalOvertimeHours?.toFixed(0) || '0'} / <span className="fs-20 text-gray-5"> 28</span>
                          </h2>
                          <p className="fw-medium text-truncate">Overtime this Month</p>
                          <p className="d-flex align-items-center fs-13 text-truncate">
                            <span className={`avatar avatar-xs rounded-circle ${overtimeChange.up ? 'bg-success' : 'bg-danger'} flex-shrink-0 me-2`}>
                              <i className={`ti ${overtimeChange.up ? 'ti-arrow-up' : 'ti-arrow-down'} fs-12`} />
                            </span>
                            <span>{overtimeChange.percent.toFixed(0)}% Last Month</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Card 3: Big calendar card */}
            <div className="col-xl-4 col-lg-4 d-flex">
              <div className="card flex-fill">
                <div className="card-body" style={{ height: 300, padding: 8 }}>
                  <div style={{ width: '100%', height: '100%' }}>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={calendarEvents}
                      height="100%"
                      headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: ''
                      }}
                      datesSet={handleCalendarDatesSet}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3">
              <h5>Employee Attendance</h5>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap row-gap-3">
                <div className="me-3">
                  <div className="input-icon-end position-relative">
                    <PredefinedDateRanges 
                      onDateRangeChange={(start, end) => {
                        setFilters(prev => ({
                          ...prev,
                          startDate: start.format('YYYY-MM-DD'),
                          endDate: end.format('YYYY-MM-DD')
                        }));
                      }}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-chevron-down" />
                    </span>
                  </div>
                </div>
                <div className="me-3">
                  <CommonSelect
                    className="select"
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'Present', label: 'Present' },
                      { value: 'Absent', label: 'Absent' },
                      { value: 'Late', label: 'Late' },
                      { value: 'Half Day', label: 'Half Day' }
                    ]}
                    value={filters.status ? { value: filters.status, label: filters.status } : { value: '', label: 'All Status' }}
                    onChange={(option: any) => setFilters(prev => ({ ...prev, status: option?.value || '' }))}
                  />
                </div>
                <div className="dropdown">
                  <Link
                    to="#"
                    className="dropdown-toggle btn btn-white d-inline-flex align-items-center"
                    data-bs-toggle="dropdown"
                  >
                    Sort By: {filters.sortBy === 'date' ? 'Date' : filters.sortBy === 'checkIn.time' ? 'Check In Time' : filters.sortBy === 'checkOut.time' ? 'Check Out Time' : 'Status'}
                  </Link>
                  <ul className="dropdown-menu dropdown-menu-end p-3">
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setFilters(prev => ({ ...prev, sortBy: 'date' }));
                        }}
                      >
                        Date
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setFilters(prev => ({ ...prev, sortBy: 'checkIn.time' }));
                        }}
                      >
                        Check In Time
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setFilters(prev => ({ ...prev, sortBy: 'checkOut.time' }));
                        }}
                      >
                        Check Out Time
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="#"
                        className="dropdown-item rounded-1"
                        onClick={(e) => {
                          e.preventDefault();
                          setFilters(prev => ({ ...prev, sortBy: 'status' }));
                        }}
                      >
                        Status
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <Table dataSource={updatedAttendanceData} columns={columns} Selection={false} />
              )}
            </div>
          </div>
        </div>
        <div className="footer d-sm-flex align-items-center justify-content-between border-top bg-white p-3">
          <p className="mb-0">2014 - 2025 © SmartHR.</p>
          <p>
            Designed &amp; Developed By{" "}
            <Link to="#" className="text-primary">
              Dreams
            </Link>
          </p>
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Attendance Report */}
      <div className="modal fade" id="attendance_report">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Attendance</h4>
              <button
                type="button"
                className="btn-close custom-btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="modal-body">
              <div className="card shadow-none bg-transparent-light">
                <div className="card-body pb-1">
                  <div className="row">
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Date</span>
                        <p className="text-gray-9 fw-medium">{currentTime.toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Punch in at</span>
                        <p className="text-gray-9 fw-medium">{todayAttendance?.formattedCheckIn || 'Not checked in'}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Punch out at</span>
                        <p className="text-gray-9 fw-medium">{todayAttendance?.formattedCheckOut || 'Not checked out'}</p>
                      </div>
                    </div>
                    <div className="col-sm-3">
                      <div className="mb-3">
                        <span>Status</span>
                        <p className="text-gray-9 fw-medium">{todayAttendance?.status || 'Not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card shadow-none border mb-0">
                <div className="card-body">
                  <div className="row">
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-dark-transparent me-1" />
                          Total Working hours
                        </p>
                        <h3>{statistics?.totalWorkingHours?.toFixed(1) || '0'}h</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-success me-1" />
                          Productive Hours
                        </p>
                        <h3>{statistics?.averageProductionHours?.toFixed(1) || '0'}h</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-warning me-1" />
                          Break hours
                        </p>
                        <h3>{todayAttendance?.totalBreakTime ? `${Math.floor(todayAttendance.totalBreakTime / 60)}m ${todayAttendance.totalBreakTime % 60}s` : '0m 0s'}</h3>
                      </div>
                    </div>
                    <div className="col-xl-3">
                      <div className="mb-4">
                        <p className="d-flex align-items-center mb-1">
                          <i className="ti ti-point-filled text-info me-1" />
                          Overtime
                        </p>
                        <h3>{statistics?.totalOvertimeHours?.toFixed(1) || '0'}h</h3>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-8 mx-auto">
                      <div
                        className="progress bg-transparent-dark mb-3"
                        style={{ height: 24 }}
                      >
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "18%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "5%" }}
                        />
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "28%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "17%" }}
                        />
                        <div
                          className="progress-bar bg-success rounded me-2"
                          role="progressbar"
                          style={{ width: "22%" }}
                        />
                        <div
                          className="progress-bar bg-warning rounded me-2"
                          role="progressbar"
                          style={{ width: "5%" }}
                        />
                        <div
                          className="progress-bar bg-info rounded me-2"
                          role="progressbar"
                          style={{ width: "3%" }}
                        />
                        <div
                          className="progress-bar bg-info rounded"
                          role="progressbar"
                          style={{ width: "2%" }}
                        />
                      </div>
                    </div>
                    <div className="co-md-12">
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="fs-10">06:00</span>
                        <span className="fs-10">07:00</span>
                        <span className="fs-10">08:00</span>
                        <span className="fs-10">09:00</span>
                        <span className="fs-10">10:00</span>
                        <span className="fs-10">11:00</span>
                        <span className="fs-10">12:00</span>
                        <span className="fs-10">01:00</span>
                        <span className="fs-10">02:00</span>
                        <span className="fs-10">03:00</span>
                        <span className="fs-10">04:00</span>
                        <span className="fs-10">05:00</span>
                        <span className="fs-10">06:00</span>
                        <span className="fs-10">07:00</span>
                        <span className="fs-10">08:00</span>
                        <span className="fs-10">09:00</span>
                        <span className="fs-10">10:00</span>
                        <span className="fs-10">11:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Attendance Report */}
    </>
  )
}

export default AttendanceEmployee
