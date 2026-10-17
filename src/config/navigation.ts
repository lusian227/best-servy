import {
    LayoutDashboard,
    FolderKanban,
    Library,
    Store,
    Bot,
    Building2,
    FileText,
    ShoppingBag,
    Truck,
} from 'lucide-react';

import type { World } from '../types';

export const navItems: Array<{
    id: World;
    label: string;
    icon: typeof LayoutDashboard;
    path: string;
}> = [
        {
            id: 'workspace',
            label: 'Workspace',
            icon: LayoutDashboard,
            path: '/workspace',
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: FolderKanban,
            path: '/projects',
        },
        {
            id: 'knowledge',
            label: 'Knowledge',
            icon: Library,
            path: '/knowledge',
        },
        {
            id: 'marketplace',
            label: 'Marketplace',
            icon: Store,
            path: '/marketplace',
        },
        {
            id: 'ai',
            label: 'AI',
            icon: Bot,
            path: '/ai',
        },
        {
            id: 'company',
            label: 'Company',
            icon: Building2,
            path: '/company',
        },
        {
            id: 'records',
            label: 'Records',
            icon: FileText,
            path: '/records',
        },
        {
            id: 'procurement',
            label: 'Procurement',
            icon: ShoppingBag,
            path: '/procurement',
        },
        {
            id: 'supplier_procurement',
            label: 'Supplier Procurement',
            icon: Truck,
            path: '/supplier-procurement',
        },
    ];