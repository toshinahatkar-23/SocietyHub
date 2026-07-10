import axios from 'axios';

// Create a configured Axios client instance targeting the Flask backend
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LoginResponse {
  message: string;
  user: {
    user_id: number;
    name: string;
    email: string;
    role: 'admin' | 'resident' | 'guard' | 'staff';
    phone: string;
    block?: string;
    flat_number?: string;
    flat_type?: string;
    status: 'active' | 'inactive';
  };
}

export interface ResidentResponse {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  block: string;
  flat_number: string;
  flat_type: string;
  status: 'active' | 'inactive';
}

export interface VisitorResponse {
  visitor_id: number;
  visitor_name: string;
  mobile_number: string;
  purpose: string;
  resident_name: string;
  flat_number: string;
  entry_time: string;
  exit_time: string | null;
}

export interface ComplaintResponse {
  complaint_id: number;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  remarks: string | null;
  resident_name: string;
  flat_number: string;
  assigned_staff: string | null;
  created_at: string;
}

export interface NoticeResponse {
  notice_id: number;
  title: string;
  description: string;
  category: string;
  posted_by_name: string;
  posted_on: string;
}

export const apiService = {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', { email, password });
    return response.data;
  },

  // Residents List (GET)
  async getResidents(): Promise<ResidentResponse[]> {
    const response = await apiClient.get<ResidentResponse[]>('/api/residents');
    return response.data;
  },

  // Visitors (GET & POST)
  async getVisitors(): Promise<VisitorResponse[]> {
    const response = await apiClient.get<VisitorResponse[]>('/api/visitors');
    return response.data;
  },
  
  async addVisitor(visitor: {
    visitor_name: string;
    mobile_number: string;
    purpose: string;
    visiting_user_id: number;
    logged_by: number;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/visitors', visitor);
    return response.data;
  },

  // Complaints (GET & POST)
  async getComplaints(): Promise<ComplaintResponse[]> {
    const response = await apiClient.get<ComplaintResponse[]>('/api/complaints');
    return response.data;
  },
  
  async addComplaint(complaint: {
    user_id: number;
    category: string;
    description: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/complaints', complaint);
    return response.data;
  },

  // Notices (GET & POST)
  async getNotices(): Promise<NoticeResponse[]> {
    const response = await apiClient.get<NoticeResponse[]>('/api/notices');
    return response.data;
  },
  
  async addNotice(notice: {
    title: string;
    description: string;
    category: string;
    posted_by: number;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/notices', notice);
    return response.data;
  },
};
export default apiClient;
