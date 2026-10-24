import {
  LayoutDashboard, GitPullRequest, PackageCheck, RotateCcw, Boxes,
  Building2, History, Users, FileText, Package, ClipboardList, User,
} from 'lucide-react';

export const NAV = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/requests', label: 'Requests', icon: GitPullRequest },
    { to: '/admin/borrowed', label: 'Borrowed', icon: PackageCheck },
    { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
    { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
    { to: '/admin/facilities', label: 'Facilities', icon: Building2 },
    { to: '/admin/history', label: 'History', icon: History },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
  ],
  student: [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/equipment', label: 'Equipments', icon: Package },
    { to: '/student/requests', label: 'My Request', icon: ClipboardList },
    { to: '/student/history', label: 'My History', icon: History },
    { to: '/student/profile', label: 'Profile', icon: User },
  ],
};