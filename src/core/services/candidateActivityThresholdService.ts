import { backend_url } from '../../environment';

export interface ActivityThresholds {
  low: number;
  moderate: number;
  active: number;
  superActive: number;
}

export interface LevelLabels {
  dead: string;
  low: string;
  moderate: string;
  active: string;
  superActive: string;
}

export interface LevelColors {
  dead: string;
  low: string;
  moderate: string;
  active: string;
  superActive: string;
}

export interface CandidateActivityThresholdSettings {
  _id: string;
  thresholds: ActivityThresholds;
  levelLabels: LevelLabels;
  levelColors: LevelColors;
  isActive: boolean;
  description: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateActivityPreview {
  settings: CandidateActivityThresholdSettings;
  candidates: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    activityScore: number;
    activityLevel: {
      level: string;
      color: string;
      score: number;
    };
  }>;
  levelDistribution: {
    dead: number;
    low: number;
    moderate: number;
    active: number;
    superActive: number;
  };
  totalCandidates: number;
}

export interface CandidateActivityLeaderboard {
  rank: number;
  name: string;
  profileImage?: string;
  submissions: number;
  interviews: number;
  offers: number;
  activityScore: number;
  status: string;
  statusClass: string;
}

// Get candidate activity threshold settings
export const getCandidateActivityThresholdSettings = async (): Promise<CandidateActivityThresholdSettings> => {
  const response = await fetch(`${backend_url}/api/candidate-activity-threshold`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch candidate activity threshold settings');
  }

  const result = await response.json();
  return result.data;
};

// Update candidate activity threshold settings
export const updateCandidateActivityThresholdSettings = async (settings: Partial<CandidateActivityThresholdSettings>): Promise<CandidateActivityThresholdSettings> => {
  const response = await fetch(`${backend_url}/api/candidate-activity-threshold`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update candidate activity threshold settings');
  }

  const result = await response.json();
  return result.data;
};

// Get candidate activity preview
export const getCandidateActivityPreview = async (): Promise<CandidateActivityPreview> => {
  const response = await fetch(`${backend_url}/api/candidate-activity-threshold/preview`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch candidate activity preview');
  }

  const result = await response.json();
  return result.data;
};

// Get candidate activity leaderboard with current thresholds
export const getCandidateActivityLeaderboard = async (filter: string = 'monthly', page: number = 1, limit: number = 7): Promise<{
  data: CandidateActivityLeaderboard[];
  total: number;
  page: number;
  limit: number;
  settings: {
    thresholds: ActivityThresholds;
    levelLabels: LevelLabels;
  };
}> => {
  const response = await fetch(`${backend_url}/api/candidate-activity-threshold/leaderboard?filter=${filter}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch candidate activity leaderboard');
  }

  const result = await response.json();
  return result;
};

// Get dead and low candidates with current thresholds
export const getDeadLowCandidates = async (filter: string = 'monthly', page: number = 1, limit: number = 7): Promise<{
  data: CandidateActivityLeaderboard[];
  total: number;
  page: number;
  limit: number;
  settings: {
    thresholds: ActivityThresholds;
    levelLabels: LevelLabels;
  };
}> => {
  const response = await fetch(`${backend_url}/api/candidate-activity-threshold/dead-low?filter=${filter}&page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dead and low candidates');
  }

  const result = await response.json();
  return result;
};

// Calculate activity level based on score and settings
export const calculateActivityLevel = (activityScore: number, settings: CandidateActivityThresholdSettings) => {
  const { thresholds, levelLabels, levelColors } = settings;
  
  if (activityScore >= thresholds.superActive) {
    return {
      level: levelLabels.superActive,
      color: levelColors.superActive,
      score: activityScore
    };
  } else if (activityScore >= thresholds.active) {
    return {
      level: levelLabels.active,
      color: levelColors.active,
      score: activityScore
    };
  } else if (activityScore >= thresholds.moderate) {
    return {
      level: levelLabels.moderate,
      color: levelColors.moderate,
      score: activityScore
    };
  } else if (activityScore >= thresholds.low) {
    return {
      level: levelLabels.low,
      color: levelColors.low,
      score: activityScore
    };
  } else {
    return {
      level: levelLabels.dead,
      color: levelColors.dead,
      score: activityScore
    };
  }
};

// Get activity level color for UI
export const getActivityLevelColor = (level: string): string => {
  const colorMap: { [key: string]: string } = {
    'Dead': 'danger',
    'Low': 'info',
    'Moderate': 'warning',
    'Active': 'primary',
    'Super Active': 'success'
  };
  
  return colorMap[level] || 'secondary';
};
