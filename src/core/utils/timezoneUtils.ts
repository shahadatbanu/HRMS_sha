/**
 * Frontend Timezone Utilities for Indian Standard Time (IST)
 * Handles conversion and formatting for IST display
 */

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert a date to IST
 * @param date - The date to convert
 * @returns Date converted to IST
 */
export function toISTTime(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return null;
  
  // Convert to IST
  return new Date(inputDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
}

/**
 * Get current time in IST
 * @returns Current time in IST
 */
export function getCurrentISTTime(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
}

/**
 * Format a date to IST string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string in IST
 */
export function formatToISTTime(
  date: Date | string | null | undefined, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return inputDate.toLocaleString('en-US', formatOptions);
}

/**
 * Format time only in IST
 * @param date - The date to format
 * @param use24Hour - Whether to use 24-hour format
 * @returns Formatted time string in IST
 */
export function formatTimeToIST(
  date: Date | string | null | undefined, 
  use24Hour: boolean = false
): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleTimeString('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour
  });
}

/**
 * Format date only in IST
 * @param date - The date to format
 * @param options - Additional formatting options
 * @returns Formatted date string in IST
 */
export function formatDateToIST(
  date: Date | string | null | undefined, 
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return inputDate.toLocaleDateString('en-US', formatOptions);
}

/**
 * Format interview time in IST
 * @param date - The interview date
 * @returns Formatted interview time
 */
export function formatInterviewTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleTimeString('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format interview date in IST
 * @param date - The interview date
 * @returns Formatted interview date
 */
export function formatInterviewDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleDateString('en-US', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Format submission date in IST
 * @param date - The submission date
 * @returns Formatted submission date
 */
export function formatSubmissionDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleDateString('en-US', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format attendance time in IST
 * @param date - The attendance date
 * @returns Formatted attendance time
 */
export function formatAttendanceTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleTimeString('en-US', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format attendance date in IST
 * @param date - The attendance date
 * @returns Formatted attendance date
 */
export function formatAttendanceDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  return inputDate.toLocaleDateString('en-US', {
    timeZone: IST_TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Get start of day in IST
 * @param date - The date to get start of day for
 * @returns Start of day in IST
 */
export function getStartOfDayIST(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return null;
  
  // Get the date in IST
  const centralDate = new Date(inputDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
  centralDate.setHours(0, 0, 0, 0);
  
  return centralDate;
}

/**
 * Get end of day in IST
 * @param date - The date to get end of day for
 * @returns End of day in IST
 */
export function getEndOfDayIST(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return null;
  
  // Get the date in IST
  const centralDate = new Date(inputDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
  centralDate.setHours(23, 59, 59, 999);
  
  return centralDate;
}

/**
 * Check if a date is today in IST
 * @param date - The date to check
 * @returns True if the date is today in IST
 */
export function isTodayIST(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return false;
  
  const today = getCurrentISTTime();
  const inputDateCentral = new Date(inputDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
  
  return inputDateCentral.toDateString() === today.toDateString();
}

/**
 * Get relative time in IST (e.g., "2 hours ago")
 * @param date - The date to get relative time for
 * @returns Relative time string
 */
export function getRelativeTimeUSCentral(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const inputDate = new Date(date);
  if (isNaN(inputDate.getTime())) return '';
  
  const now = getCurrentISTTime();
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Format date range for IST
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Object with formatted start and end dates
 */
export function getFormattedDateRangeUSCentral(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): { start: string; end: string } {
  return {
    start: formatToISTTime(startDate, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    end: formatToISTTime(endDate, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };
}

/**
 * Get timezone info for IST
 * @returns Timezone information
 */
export function getUSCentralTimezoneInfo(): {
  timezone: string;
  offset: string;
  isDST: boolean;
} {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
  const utcTime = new Date(now.toUTCString());
  
  const offsetMinutes = (centralTime.getTime() - utcTime.getTime()) / 60000;
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const offsetSign = offsetMinutes >= 0 ? '+' : '-';
  
  // Check if DST is active (rough approximation)
  const month = centralTime.getMonth();
  const isDST = month >= 2 && month <= 10; // March to November
  
  return {
    timezone: IST_TIMEZONE,
    offset: `UTC${offsetSign}${offsetHours}`,
    isDST
  };
}
