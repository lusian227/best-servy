import { ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';
import { navItems } from '../../config/navigation';

interface SidebarProps {
    activeWorld: string;
    onSelectWorld: (world: string) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
    user: { name: string; role: string; avatar?: string };
}

const Sidebar = ({ activeWorld, onSelectWorld, collapsed, onToggleCollapse, user }: SidebarProps) => {
    const handleNavigation = (worldId: string) => {
        onSelectWorld(worldId);
    };

    return (
        <aside
            className={`
        bg-[#1e1e2e] text-white h-screen sticky top-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        flex flex-col border-r border-[#2a2a3d]
      `}
        >
            {/* Logo & Toggle */}
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a3d]">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <Hexagon size={24} className="text-[#4CAF50]" />
                        <span className="font-bold text-lg tracking-tight">EngineerOS</span>
                    </div>
                )}
                <button
                    onClick={onToggleCollapse}
                    className="p-1 hover:bg-[#2a2a3d] rounded-md transition"
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = activeWorld === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item.id)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                    transition-all duration-200 w-full
                    ${isActive
                                            ? 'bg-[#4CAF50] text-white'
                                            : 'text-gray-300 hover:bg-[#2a2a3d] hover:text-white'
                                        }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                    title={collapsed ? item.label : ''}
                                >
                                    <item.icon size={20} />
                                    {!collapsed && <span className="text-sm">{item.label}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Bottom section (user profile) */}
            <div className="border-t border-[#2a2a3d] p-4">
                {!collapsed ? (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{user.role || 'Engineer'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#4CAF50] flex items-center justify-center text-white font-bold">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;