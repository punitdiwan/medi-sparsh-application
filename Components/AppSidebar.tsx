'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {  useState } from 'react';

import {
  Calendar,
  Home,
  User,
  Users2,
  NotebookPen,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Settings,
  ServerCog,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useSession } from "@/lib/auth-client";
import { useAuth } from '@/context/AuthContext';
type SidebarChildItem = {
  title: string;
  url: string;
};

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  children?: SidebarChildItem[];
};

const items: SidebarItem[] = [
  { title: 'Dashboard', url: '/doctor', icon: Home },
  { title: 'Patients', url: '/doctor/patient', icon: User },
  { title: 'Appointment', url: '/doctor/appointment', icon: Calendar },
  { title: 'Prescription', url: '/doctor/prescription', icon: NotebookPen },
  { title: 'Reports', url: '/doctor/reports', icon: ClipboardPlus },
  { title: 'Services', url: '/doctor/services', icon: ServerCog },
  { title:'Employees', url: '/doctor/employees', icon:Users2},
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Profile', url: '/doctor/settings/profile' },
      { title: 'Stats', url: '/doctor/settings/stats' },
      { title: 'Team', url: '/doctor/settings/ourTeam' },
      { title: 'App Settings', url: '/doctor/settings/config'}
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
const { state } = useSidebar();
const isCollapsed = state === 'collapsed';
  const {user}= useAuth();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [staffData,setStaffData] = useState<any>();
  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="bg-background border-r">
        <SidebarContent>
          <SidebarGroup>
            {!isCollapsed && (
              <>
                <SidebarGroupLabel className="text-foreground font-semibold text-xl">
                  {user?.hospital?.name||"Clinic Name"}
                </SidebarGroupLabel>
                <SidebarGroupLabel className="mb-2 text-muted-foreground">
                  Dr.{user?.userData?.name}
                </SidebarGroupLabel>
              </>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const hasChildren = item.children?.length ?? 0 > 0;

                  const isActive =
                    pathname === item.url ||
                    item.children?.some((child) => pathname === child.url);

                  const isOpen =
                    openMenus[item.title] ||
                    item.children?.some((child) => pathname === child.url) ||
                    false;

                  return (
                    <SidebarMenuItem key={item.title}>
                      {hasChildren ? (
                        <>
                          {/* Tooltip for collapsible menu */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleMenu(item.title)}
                                className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                  ${
                                    isCollapsed
                                      ? 'justify-center'
                                      : 'justify-between gap-2'
                                  }
                                  ${
                                    isActive
                                      ? 'bg-muted text-foreground font-semibold'
                                      : 'hover:bg-muted text-muted-foreground'
                                  }`}
                              >
                                <div
                                  className={`flex items-center ${
                                    isCollapsed ? 'justify-center' : 'gap-2'
                                  }`}
                                >
                                  <item.icon
                                    className={`w-5 h-5 ${
                                      isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                  {!isCollapsed && (
                                    <span className="truncate font-semibold">
                                      {item.title}
                                    </span>
                                  )}
                                </div>

                                {!isCollapsed &&
                                  (isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                  ))}
                              </button>
                            </TooltipTrigger>
                            {isCollapsed && (
                              <TooltipContent side="right" className="text-sm">
                                {item.title}
                              </TooltipContent>
                            )}
                          </Tooltip>

                          {!isCollapsed && isOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children!.map((subItem) => {
                                const isSubActive = pathname === subItem.url;
                                return (
                                  <Link
                                    key={subItem.title}
                                    href={subItem.url}
                                    className={`block px-4 py-2 rounded-md text-sm transition-colors
                                      ${
                                        isSubActive
                                          ? 'bg-muted text-foreground font-medium'
                                          : 'text-muted-foreground hover:bg-muted'
                                      }`}
                                  >
                                    {subItem.title}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        // Regular menu items
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url!}
                                className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                  ${isCollapsed ? 'justify-center' : 'gap-2'}
                                  ${
                                    isActive
                                      ? 'bg-muted text-foreground font-semibold'
                                      : 'text-muted-foreground hover:bg-muted'
                                  }`}
                              >
                                <item.icon
                                  className={`w-5 h-5 ${
                                    isActive
                                      ? 'text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                {!isCollapsed && (
                                  <span className="truncate font-semibold">
                                    {item.title}
                                  </span>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {isCollapsed && (
                            <TooltipContent side="right" className="text-sm">
                              {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </TooltipProvider>
  );
}
