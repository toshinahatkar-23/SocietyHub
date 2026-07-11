export type NoticeType = 'Emergency' | 'Maintenance' | 'Event' | 'General';

export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  author: string;
  postedAt: string;
  content: string;
  attachments?: string[];
  isBookmarked?: boolean;
}

export interface Resident {
  id: string;
  name: string;
  phone: string;
  email: string;
  block: string;
  flat: string;
  flatType: string;
  status: 'Active' | 'Inactive';
}

export type VisitorPurpose = 'Guest' | 'Maintenance' | 'Delivery' | 'Service';

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: VisitorPurpose;
  flat: string;
  entryTime: string;
  exitTime: string | null; // null means 'On-Site'
  isVerified?: boolean;
  tagline?: string;
}

export type ComplaintCategory = 'Plumbing' | 'Electrical' | 'Security' | 'Cleaning' | 'Amenities' | 'General Maintenance' | 'Others';
export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  resident: string;
  flat: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  assignedTo: string; // name or 'Unassigned'
  priority: ComplaintPriority;
  imageAttached?: string;
  reportedAt: string;
  remarks?: string;
}

export type BillingStatus = 'Paid' | 'Unpaid' | 'Overdue';

export interface MaintenanceBill {
  id: string;
  flat: string;
  residentName: string;
  billingMonth: string;
  amount: number;
  dueDate: string;
  status: BillingStatus;
}

export type TabName = 'dashboard' | 'residents' | 'requests' | 'visitors' | 'complaints' | 'maintenance' | 'notices' | 'profile';

export interface RegistrationRequest {
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
