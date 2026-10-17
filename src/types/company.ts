// src/types/company.ts

export interface Company {
  id: string;
  name: string;
  ownerId?: string;

  // Basic info
  industry?: string;
  size?: string;           // ✅ ADDED - e.g., 'Small', 'Medium', 'Large'
  description?: string;    // ✅ ADDED - company description
  logo?: string;
  website?: string;

  // Contact info
  email?: string;          // ✅ ADDED - company email
  phone?: string;          // ✅ ADDED - company phone
  address?: string;        // ✅ ADDED - company address

  // Metadata
  foundedAt?: string;      // ✅ ADDED - founding date

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CompanyMember {
  id: string;
  companyId: string;
  userId: string;

  // Personal info
  name?: string;
  email?: string;          // ✅ ADDED - member email
  title?: string;          // ✅ ADDED - job title
  department?: string;     // ✅ ADDED - department

  // Role
  role: 'admin' | 'manager' | 'engineer' | 'member' | 'viewer';


  // Metadata
  joinedAt: string;
}

export interface CompanyWorkspace {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CompanyActivity {
  id: string;
  companyId: string;
  type: string;
  description?: string;
  message?: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;    // ✅ ADD THIS
}

export interface CompanyMetrics {
  totalProjects: number;
  totalMembers: number;
  totalWorkspaces: number;
  activeProjects: number;
  completionRate: number;
  totalRecords?: number;
  totalDecisions?: number;
  recentActivity?: CompanyActivity[];  // ✅ ADD THIS   // ✅ ADDED - used in CompanyRepository
}