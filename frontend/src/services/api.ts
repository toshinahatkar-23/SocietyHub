import axios from 'axios';

// Create a configured Axios client instance targeting the Flask backend
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000',
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

  // Resident Registration Request
  async registerRequest(requestData: {
    full_name: string;
    email: string;
    phone: string;
    block: string;
    flat_number: string;
    flat_type: string;
    password: string;
  }): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/register-request', requestData);
    return response.data;
  },

  // Registration Requests Management (Admin)
  async getRegistrationRequests(): Promise<RegistrationRequestResponse[]> {
    const response = await apiClient.get<RegistrationRequestResponse[]>('/api/registration-requests');
    return response.data;
  },

  async approveRegistrationRequest(id: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/registration-requests/${id}/approve`);
    return response.data;
  },

  async rejectRegistrationRequest(id: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/api/registration-requests/${id}/reject`);
    return response.data;
  },

  async getDashboardStats(): Promise<any> {
    const response = await apiClient.get<any>('/api/dashboard/stats');
    return response.data;
  },

  async getBills(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/api/bills');
    return response.data;
  },

  async generateBill(data: { user_id: number; billing_month: string; amount: number; due_date?: string }): Promise<any> {
    const response = await apiClient.post<any>('/api/bills', data);
    return response.data;
  },

  async payBill(billId: number): Promise<any> {
    const response = await apiClient.post<any>(`/api/bills/${billId}/pay`);
    return response.data;
  },

  async assignComplaint(id: number, data: { assigned_to: number; priority?: string }): Promise<any> {
    const response = await apiClient.post<any>(`/api/complaints/${id}/assign`, data);
    return response.data;
  },

  async updateComplaintStatus(id: number, data: { status: string; remarks?: string }): Promise<any> {
    const response = await apiClient.post<any>(`/api/complaints/${id}/status`, data);
    return response.data;
  },

  async getProfile(userId: number): Promise<any> {
    const response = await apiClient.get<any>(`/api/profile/${userId}`);
    return response.data;
  },

  async updateProfile(data: { user_id: number; name: string; email: string; phone: string }): Promise<any> {
    const response = await apiClient.post<any>('/api/profile/update', data);
    return response.data;
  },

  async changePassword(data: { user_id: number; current_password?: string; currentPassword?: string; new_password?: string; newPassword?: string }): Promise<any> {
    const payload = {
      user_id: data.user_id,
      current_password: data.current_password || data.currentPassword,
      currentPassword: data.current_password || data.currentPassword,
      new_password: data.new_password || data.newPassword,
      newPassword: data.new_password || data.newPassword
    };
    const response = await apiClient.post<any>('/api/profile/change-password', payload);
    return response.data;
  },

  async addResident(data: { name: string; email: string; phone: string; block?: string; flat_number: string; flat_type?: string; status?: string }): Promise<any> {
    const response = await apiClient.post<any>('/api/residents', data);
    return response.data;
  },

  async deleteResident(userId: number): Promise<any> {
    const response = await apiClient.delete<any>(`/api/residents/${userId}`);
    return response.data;
  },
};

export interface RegistrationRequestResponse {
  request_id: number;
  full_name: string;
  email: string;
  phone: string;
  block: string;
  flat_number: string;
  flat_type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: number | null;
}

export default apiClient;
