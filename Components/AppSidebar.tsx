'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

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
  BriefcaseMedical
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  { title: 'Pharmacy', url: '/doctor/pharmacy', icon: BriefcaseMedical },
  { title: 'Reports', url: '/doctor/reports', icon: ClipboardPlus },
  { title: 'Services', url: '/doctor/services', icon: ServerCog },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Members', url: '/doctor/employees' },
      { title: 'Hospital Charges', url: '/doctor/settings/hospitalCharges'},
      { title: 'Bed', url: '/doctor/settings/Bed'},
      { title: 'Shift Management', url: '/doctor/settings/appointment'},
      { title: 'Vital',url:'/doctor/settings/vital'},
      { title: 'Medicine Record',url : '/doctor/settings/medicineRecord'},
      { title: 'Stats', url: '/doctor/settings/stats' },
      { title: 'Payments History', url: '/doctor/billing' },
      { title: 'App Settings', url: '/doctor/settings/config' },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [staffData, setStaffData] = useState<any>();
  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };
  const closeSidebar = () => {
    const collapseBtn = document.querySelector('[data-sidebar="trigger"]');
    if (collapseBtn) (collapseBtn as HTMLElement).click();
  };

  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={500}>
      <Sidebar collapsible="icon" className="bg-background border-r">
        <SidebarContent>
          <SidebarGroup>
            <div
              className={`flex items-center gap-3 py-4 border-b mb-4 transition-all ${
                isCollapsed ? "justify-center" : "px-3"
              }`}
            >
              {/* Avatar / Logo */}
              <Avatar className={`${isCollapsed ? "size-8" : "size-10"}`}>
                <AvatarImage
                  src={user?.hospital?.profileImage || ""}
                  alt="Clinic Logo"
                />
                <AvatarFallback className="bg-muted text-xs">
                  {user?.hospital?.name
                    ?.split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "CN"}
                </AvatarFallback>
              </Avatar>

              {/* Clinic Name + Doctor Name — only if expanded */}
              {!isCollapsed && (
                <div className="flex flex-col leading-tight">
                  <span className="font-semibold text-base text-foreground truncate">
                    {user?.hospital?.name || "Clinic Name"}
                  </span>

                  <span className="text-muted-foreground text-sm truncate">
                    Dr. {user?.userData?.name}
                  </span>
                </div>
              )}
            </div>

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
                          {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => { toggleMenu(item.title) }}

                                className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                  ${isCollapsed
                                    ? 'justify-center'
                                    : 'justify-between gap-2'
                                  }
                                  ${isActive
                                    ? 'bg-muted text-foreground font-semibold'
                                    : 'hover:bg-muted text-muted-foreground'
                                  }`}
                              >
                                <div
                                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'
                                    }`}
                                >
                                  <item.icon
                                    className={`w-5 h-5 ${isActive
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
                              <TooltipContent side="right" className="text-sm">
                                {item.title}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={() => { toggleMenu(item.title) }}

                              className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                ${isCollapsed
                                  ? 'justify-center'
                                  : 'justify-between gap-2'
                                }
                                ${isActive
                                  ? 'bg-muted text-foreground font-semibold'
                                  : 'hover:bg-muted text-muted-foreground'
                                }`}
                            >
                              <div
                                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'
                                  }`}
                              >
                                <item.icon
                                  className={`w-5 h-5 ${isActive
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
                          )}

                          {!isCollapsed && isOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                              {item.children!.map((subItem) => {
                                const isSubActive = pathname === subItem.url;
                                return (
                                  <Link
                                    key={subItem.title}
                                    href={subItem.url}
                                    onClick={() => {
                                      if (item.title === "Settings" && subItem.title === "Bed"||"hospitalCharges") {
                                        closeSidebar();
                                      }
                                    }}
                                    className={`block px-4 py-2 rounded-md text-sm transition-colors
                                      ${isSubActive
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
                        isCollapsed ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton asChild>
                              <Link
                                href={item.url!}
                                className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                  ${isCollapsed ? 'justify-center' : 'gap-2'}
                                  ${isActive
                                    ? 'bg-muted text-foreground font-semibold'
                                    : 'text-muted-foreground hover:bg-muted'
                                  }`}
                              >
                                <item.icon
                                  className={`w-5 h-5 ${isActive
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
                            <TooltipContent side="right" className="text-sm">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url!}
                              className={`flex items-center p-3 rounded-md w-full transition-all duration-150
                                ${isCollapsed ? 'justify-center' : 'gap-2'}
                                ${isActive
                                  ? 'bg-muted text-foreground font-semibold'
                                  : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                              <item.icon
                                className={`w-5 h-5 ${isActive
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
                        )
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
