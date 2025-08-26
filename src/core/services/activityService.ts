import { backend_url } from '../../environment';

export interface Activity {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  action: string;
  entityType: string;
  entityId: string;
  entityName: string;
  description: string;
  details: any;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivitiesResponse {
  success: boolean;
  data: Activity[];
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}

class ActivityService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getRecentActivities(limit: number = 10): Promise<ActivitiesResponse> {
    try {
      const response = await fetch(`${backend_url}/api/activities/recent?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }

  async getActivitiesByUser(userId: string, limit: number = 20): Promise<ActivitiesResponse> {
    try {
      const response = await fetch(`${backend_url}/api/activities/user/${userId}?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  async getActivitiesByEntity(entityType: string, entityId: string, limit: number = 20): Promise<ActivitiesResponse> {
    try {
      const response = await fetch(`${backend_url}/api/activities/entity/${entityType}/${entityId}?limit=${limit}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching entity activities:', error);
      throw error;
    }
  }

  async getAllActivities(page: number = 1, limit: number = 20, filter: string = 'all'): Promise<ActivitiesResponse> {
    try {
      const response = await fetch(`${backend_url}/api/activities/all?page=${page}&limit=${limit}&filter=${filter}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all activities:', error);
      throw error;
    }
  }

  async deleteAllActivities(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${backend_url}/api/activities/delete-all`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting all activities:', error);
      throw error;
    }
  }

  // Helper method to format activity description for display
  formatActivityDescription(activity: Activity): string {
    const action = activity.action;
    const description = activity.description;

    // Extract entity name from description for highlighting
    const entityNameMatch = description.match(/(?:for|to|Added|Updated|Created|Completed|Scheduled|Changed|Marked|Requested|Approved|Rejected)\s+([^,\s]+(?:\s+[^,\s]+)*)/);
    const entityName = entityNameMatch ? entityNameMatch[1] : activity.entityName;

    // Replace the entity name with highlighted version
    if (entityName && entityName !== activity.entityName) {
      return description.replace(entityName, `<span class="text-primary">${entityName}</span>`);
    }

    return description;
  }

  // Helper method to get activity icon based on action
  getActivityIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'employee_added': 'ti ti-user-plus',
      'employee_updated': 'ti ti-user-edit',
      'candidate_added': 'ti ti-user-plus',
      'candidate_updated': 'ti ti-user-edit',
      'candidate_assigned': 'ti ti-user-check',
      'interview_scheduled': 'ti ti-calendar-event',
      'interview_updated': 'ti ti-calendar-edit',
      'interview_stage_changed': 'ti ti-arrow-right',
      'notes_added': 'ti ti-note',
      'notes_updated': 'ti ti-note-edit',
      'attachment_added': 'ti ti-paperclip',
      'leave_requested': 'ti ti-calendar-off',
      'leave_approved': 'ti ti-check',
      'leave_rejected': 'ti ti-x',
      'attendance_marked': 'ti ti-clock',
      'todo_created': 'ti ti-list-plus',
      'todo_completed': 'ti ti-check',
      'offer_details_added': 'ti ti-file-plus',
      'offer_details_updated': 'ti ti-file-edit',
      'submission_added': 'ti ti-send',
      'submission_updated': 'ti ti-send-edit',
      'bg_check_note_added': 'ti ti-shield-check',
      'bg_check_note_updated': 'ti ti-shield-edit',
      'project_created': 'ti ti-folder-plus',
      'project_updated': 'ti ti-folder-edit'
    };

    return iconMap[action] || 'ti ti-activity';
  }

  // Helper method to get activity color based on action
  getActivityColor(action: string): string {
    const colorMap: { [key: string]: string } = {
      'employee_added': 'text-success',
      'employee_updated': 'text-info',
      'candidate_added': 'text-success',
      'candidate_updated': 'text-info',
      'candidate_assigned': 'text-primary',
      'interview_scheduled': 'text-primary',
      'interview_updated': 'text-warning',
      'interview_stage_changed': 'text-info',
      'notes_added': 'text-secondary',
      'notes_updated': 'text-secondary',
      'attachment_added': 'text-secondary',
      'leave_requested': 'text-warning',
      'leave_approved': 'text-success',
      'leave_rejected': 'text-danger',
      'attendance_marked': 'text-primary',
      'todo_created': 'text-info',
      'todo_completed': 'text-success',
      'offer_details_added': 'text-success',
      'offer_details_updated': 'text-info',
      'submission_added': 'text-primary',
      'submission_updated': 'text-warning',
      'bg_check_note_added': 'text-info',
      'bg_check_note_updated': 'text-warning',
      'project_created': 'text-success',
      'project_updated': 'text-info'
    };

    return colorMap[action] || 'text-muted';
  }

  // Helper method to get activity label based on entity type
  getActivityLabel(entityType: string): { text: string; color: string } {
    const labelMap: { [key: string]: { text: string; color: string } } = {
      'employee': { text: 'Employee', color: 'badge bg-success' },
      'candidate': { text: 'Candidate', color: 'badge bg-primary' },
      'interview': { text: 'Interview', color: 'badge bg-info' },
      'todo': { text: 'Todo', color: 'badge bg-warning' },
      'attendance': { text: 'Attendance', color: 'badge bg-secondary' },
      'leave': { text: 'Leave', color: 'badge bg-purple' },
      'project': { text: 'Project', color: 'badge bg-dark' }
    };

    return labelMap[entityType] || { text: 'Activity', color: 'badge bg-light text-dark' };
  }
}

export default new ActivityService();
