import {
    LayoutDashboard,
    FolderKanban,
    Library,
    Store,
    Bot,
    Building2,
    FileText  // ✅ ADDED: For Records
} from 'lucide-react';

export const navItems = [
    {
        id: 'workspace',
        label: 'Workspace',
        icon: LayoutDashboard,
        path: '/workspace'
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: FolderKanban,
        path: '/projects'
    },
    {
        id: 'knowledge',
        label: 'Knowledge',
        icon: Library,
        path: '/knowledge'
    },
    {
        id: 'marketplace',
        label: 'Marketplace',
        icon: Store,
        path: '/marketplace'
    },
    {
        id: 'ai',
        label: 'AI',
        icon: Bot,
        path: '/ai'
    },
    {
        id: 'company',
        label: 'Company',
        icon: Building2,
        path: '/company'
    },
    // ✅ ADDED: Records as 7th world
    {
        id: 'records',
        label: 'Records',
        icon: FileText,
        path: '/records'
    }
];