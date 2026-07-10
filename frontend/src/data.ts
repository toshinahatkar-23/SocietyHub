import { Notice, Resident, Visitor, Complaint, MaintenanceBill } from './types';

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    type: 'Emergency',
    title: 'Water Supply Interruption - All Blocks',
    author: 'Society Office',
    postedAt: '10 mins ago',
    content: 'Due to a main pipeline burst near the entry gate, water supply will be suspended for all blocks from 2:00 PM to 6:00 PM today. Our team is working on it.',
    attachments: ['1 Attachment'],
    isBookmarked: false
  },
  {
    id: 'not-2',
    type: 'Maintenance',
    title: 'Elevator Service Schedule: Block C',
    author: 'Maintenance Head',
    postedAt: '2 hours ago',
    content: 'Elevator No. 2 in Block C will be under routine maintenance on Saturday between 10:00 AM and 1:00 PM. Please use Elevator No. 1 during this period.',
    isBookmarked: true
  },
  {
    id: 'not-3',
    type: 'Event',
    title: 'Annual General Meeting (AGM) 2026',
    author: 'Society Secretary',
    postedAt: 'Yesterday',
    content: 'This is to inform all residents that the Annual General Meeting for the financial year 2025-26 will be held on March 15th in the Society Clubhouse. Agenda is attached.',
    attachments: ['Meeting_Agenda.pdf'],
    isBookmarked: false
  }
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'RES-1092',
    name: 'Arjun Kapoor',
    phone: '+91 98765 43210',
    email: 'arjun.k@example.com',
    block: 'Block A',
    flat: '402',
    flatType: '3BHK',
    status: 'Active'
  },
  {
    id: 'RES-1105',
    name: 'Sneha Nair',
    phone: '+91 98221 00445',
    email: 'sneha.nair@example.com',
    block: 'Block B',
    flat: '201',
    flatType: '2BHK',
    status: 'Inactive'
  },
  {
    id: 'RES-1122',
    name: 'Rahul Mehra',
    phone: '+91 91122 33445',
    email: 'mehra.rahul@example.com',
    block: 'Block A',
    flat: '105',
    flatType: '1BHK',
    status: 'Active'
  },
  {
    id: 'RES-1134',
    name: 'Priya Das',
    phone: '+91 88776 65544',
    email: 'priya.d@example.com',
    block: 'Block C',
    flat: '804',
    flatType: '3BHK',
    status: 'Active'
  }
];

export const INITIAL_VISITORS: Visitor[] = [
  {
    id: 'vis-1',
    name: 'Amit Kumar',
    phone: '+91 98765 43210',
    purpose: 'Guest',
    flat: 'B-402',
    entryTime: '10:15 AM',
    exitTime: null,
    isVerified: true,
    tagline: 'ID Verified'
  },
  {
    id: 'vis-2',
    name: 'Rajesh Electrician',
    phone: '+91 91234 56789',
    purpose: 'Maintenance',
    flat: 'A-1104',
    entryTime: '09:45 AM',
    exitTime: '11:20 AM',
    tagline: 'Service Professional'
  },
  {
    id: 'vis-3',
    name: 'Zomato Delivery',
    phone: '+91 88877 66554',
    purpose: 'Delivery',
    flat: 'C-201',
    entryTime: '11:05 AM',
    exitTime: null,
    isVerified: true,
    tagline: 'Order #9822'
  },
  {
    id: 'vis-4',
    name: 'Sunita Mehta',
    phone: '+91 99000 11223',
    purpose: 'Guest',
    flat: 'B-402',
    entryTime: '08:30 AM',
    exitTime: '10:10 AM',
    tagline: 'Frequent Visitor'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: '#CMP-1024',
    resident: 'Anika Sharma',
    flat: '402-B',
    category: 'Plumbing',
    description: 'Leaking faucet in the main bathroom sink since morning. Water is slowly accumulating on the floor.',
    status: 'Open',
    assignedTo: 'Unassigned',
    priority: 'High',
    reportedAt: 'Oct 24, 2023'
  },
  {
    id: '#CMP-1022',
    resident: 'Robert Wilson',
    flat: '105-A',
    category: 'Electrical',
    description: 'Power flicker in the corridor and lift lobby area. Occurring every few minutes.',
    status: 'In Progress',
    assignedTo: 'Rajesh Kumar',
    priority: 'Medium',
    reportedAt: 'Oct 24, 2023'
  },
  {
    id: '#CMP-1019',
    resident: 'Meera Patel',
    flat: '901-D',
    category: 'Security',
    description: 'Unidentified visitor seen wandering near tower B basement parking area.',
    status: 'Resolved',
    assignedTo: 'Sanjay Singh',
    priority: 'Critical',
    reportedAt: 'Oct 23, 2023'
  },
  {
    id: '#CMP-1018',
    resident: 'Liam Johnson',
    flat: '202-C',
    category: 'Cleaning',
    description: 'Trash collection missed for the third floor corridor today. Needs immediate cleanup.',
    status: 'Open',
    assignedTo: 'Unassigned',
    priority: 'Low',
    reportedAt: 'Oct 23, 2023'
  }
];

export const INITIAL_BILLS: MaintenanceBill[] = [
  {
    id: 'bill-1',
    flat: 'A-102',
    residentName: 'Jane Smith',
    billingMonth: 'Oct 2023',
    amount: 250.00,
    dueDate: 'Oct 15, 2023',
    status: 'Paid'
  },
  {
    id: 'bill-2',
    flat: 'B-405',
    residentName: 'Michael Chen',
    billingMonth: 'Oct 2023',
    amount: 250.00,
    dueDate: 'Oct 15, 2023',
    status: 'Overdue'
  },
  {
    id: 'bill-3',
    flat: 'C-201',
    residentName: 'Sarah Miller',
    billingMonth: 'Oct 2023',
    amount: 250.00,
    dueDate: 'Oct 15, 2023',
    status: 'Unpaid'
  },
  {
    id: 'bill-4',
    flat: 'A-303',
    residentName: 'Robert Wilson',
    billingMonth: 'Oct 2023',
    amount: 250.00,
    dueDate: 'Oct 15, 2023',
    status: 'Paid'
  },
  {
    id: 'bill-5',
    flat: 'D-101',
    residentName: 'Sanjay Singh',
    billingMonth: 'Oct 2023',
    amount: 250.00,
    dueDate: 'Oct 15, 2023',
    status: 'Overdue'
  }
];
