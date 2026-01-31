'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

import {
  Calendar,
  Home,
  User,
  Users2,
  Bed,
  NotebookPen,
  ChevronDown,
  ChevronUp,
  ClipboardPlus,
  Settings,
  ServerCog,
  BriefcaseMedical,
  TestTube,
  FlaskConical,
  Microscope
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useSession } from "@/lib/auth-client";
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAbility } from "@/components/providers/AbilityProvider";

type SidebarChildItem = {
  title: string;
  url: string;
  subject?: string;
  action?: string;
};

type SidebarItem = {
  title: string;
  url?: string;
  subject?: string;
  action?: string;
  icon: React.ElementType;
  children?: SidebarChildItem[];
};

const items: SidebarItem[] = [
  { title: 'Dashboard', url: '/doctor', icon: Home },
  { title: 'Patients', url: '/doctor/patient', icon: User, subject: 'patient', action: 'read', },
  { title: 'Appointment', url: '/doctor/appointment', icon: Calendar, subject: 'appointment', action: 'read', },
  { title: 'IPD-In Patient', url: '/doctor/IPD', icon: Bed, subject: 'ipd', action: 'read' },
  { title: 'Prescription', url: '/doctor/prescription', icon: NotebookPen, subject: 'prescription', action: 'read', },
  {
    title: 'Pharmacy',
    icon: BriefcaseMedical,
    children: [
      { title: 'Billing', url: '/doctor/pharmacy', subject: 'billing', action: 'read', },
      { title: 'Medicines', url: '/doctor/pharmacy/medicine', subject: 'pharmacyMedicine', action: 'read', },
      { title: 'Stock', url: '/doctor/pharmacy/purchase', subject: 'stock', action: 'read', },
    ],
  },
  {
    title: 'Pathology',
    icon: FlaskConical,
    children: [
      { title: 'Billing', url: '/doctor/pathology', subject: 'PathologyBilling', action: 'read', },
      { title: 'Payments', url: '/doctor/pathology/payments', subject: 'PathologyBilling', action: 'read', },
      { title: 'Pathology Test', url: '/doctor/pathology/pathologyTest', subject: 'PathologyTest', action: 'read', },
    ],
  },
  {
    title: 'Radiology',
    icon: Microscope,
    children: [
      { title: 'Billing', url: '/doctor/radiology', subject: 'RadiologyBilling', action: 'read', },
      { title: 'Radiology Test', url: '/doctor/radiology/radiologyTest', subject: 'RadiologyTest', action: 'read', },
    ],
  },
  {
    title: 'Reports', url: '/doctor/reports', icon: ClipboardPlus, subject: 'reports',
    action: 'read',
  },
  {
    title: 'Services', url: '/doctor/services', icon: ServerCog, subject: 'services',
    action: 'read',
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Members', url: '/doctor/employees', subject: 'members', action: 'read', },
      { title: 'Hospital Charges', url: '/doctor/settings/hospitalCharges', subject: 'hospitalCharger', action: 'read', },
      { title: 'Bed', url: '/doctor/settings/Bed', subject: 'bed', action: 'read', },
      { title: 'Shift Management', url: '/doctor/settings/shifts', subject: 'doctorShift', action: 'read', },
      { title: 'Symptoms', url: '/doctor/settings/symptom', subject: 'symptoms', action: 'read' },
      { title: 'Vital', url: '/doctor/settings/vital', subject: 'vitals', action: 'read', },
      { title: 'Operations', url: '/doctor/settings/operations', subject: 'operation', action: 'read' },
      { title: 'Medicine Record', url: '/doctor/settings/medicineRecord', subject: 'medicineRedord', action: 'read', },
      { title: 'Pathology', url: '/doctor/settings/pathology', subject: 'pathologySettings', action: 'read' },
      { title: 'Radiology', url: '/doctor/settings/radiology', subject: 'radiologySettings', action: 'read' },
      { title: 'Stats', url: '/doctor/settings/stats', subject: 'stats', action: 'read', },
      { title: 'Payments History', url: '/doctor/billing', subject: 'payment', action: 'read', },
      { title: 'App Settings', url: '/doctor/settings/config', subject: 'appSetting', action: 'read', },
      { title: 'Roles', url: '/doctor/settings/roles', subject: 'role', action: 'read', },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user } = useAuth();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({});
  const [staffData, setStaffData] = useState<any>();

  const ability = useAbility();

  const canAccess = (
    subject?: string,
    action: string = 'read'
  ) => {
    if (!subject) return true; // dashboard, public items
    return ability.can(action, subject);
  };
  const filterItemsByPermission = (items: SidebarItem[]) => {
    return items
      .map((item) => {
        if (!canAccess(item.subject, item.action)) return null;

        if (item.children) {
          const filteredChildren = item.children.filter((child) =>
            canAccess(child.subject, child.action)
          );

          if (filteredChildren.length === 0) return null;

          return { ...item, children: filteredChildren };
        }

        return item;
      })
      .filter(Boolean) as SidebarItem[];
  };

  // Close all popovers when route changes
  useEffect(() => {
    setOpenPopovers({});
  }, [pathname]);

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
  // Recursive check for active item (works for nested submenus)
  const isItemActive = (item: SidebarItem | SidebarChildItem): boolean => {
    if (item.url) {
      // For exact URL match or when it's the base path
      if (pathname === item.url) return true;
      // For child pages, check if pathname starts with the URL and has more segments
      if (pathname.startsWith(item.url + '/')) return true;
    }
    if ('children' in item && item.children) {
      return item.children.some((child) => isItemActive(child));
    }
    return false;
  };
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={500}>
      <Sidebar collapsible="icon" className="bg-background border-r">
        <SidebarContent>
          <SidebarGroup>
            <div
              className={`flex items-center gap-3 py-4 border-b mb-4 transition-all ${isCollapsed ? "justify-center" : "px-3"
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
                {filterItemsByPermission(items)
                  .filter((item) => {
                    // parent permission
                    if (!canAccess(item.subject, item.action)) return false;

                    // agar children hain to unko bhi filter karo
                    if (item.children) {
                      item.children = item.children.filter((child) =>
                        canAccess(child.subject, child.action)
                      );
                    }

                    // agar children empty ho gaye → parent hide
                    if (item.children && item.children.length === 0) return false;

                    return true;
                  })
                  .map((item) => {

                    const hasChildren = (item.children?.length ?? 0) > 0;
                    const isActive = isItemActive(item);
                    // If the user has explicitly toggled this menu, respect that value.
                    // Otherwise default to open when the current route makes it active.
                    const isOpen = Object.prototype.hasOwnProperty.call(openMenus, item.title)
                      ? openMenus[item.title]
                      : isItemActive(item);


                    return (
                      <SidebarMenuItem key={item.title}>
                        {hasChildren ? (
                          <>
                            {/* Popover for collapsible menu when collapsed */}
                            {isCollapsed ? (
                              <Popover
                                open={openPopovers[item.title] || false}
                                onOpenChange={(open) => {
                                  setOpenPopovers((prev) => ({
                                    ...prev,
                                    [item.title]: open,
                                  }));
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button
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
                                </PopoverTrigger>
                                <PopoverContent
                                  side="right"
                                  align="start"
                                  className="w-48 p-2"
                                  onMouseLeave={() => {
                                    setOpenPopovers((prev) => ({
                                      ...prev,
                                      [item.title]: false,
                                    }));
                                  }}
                                >
                                  <div className="space-y-1">
                                    <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                                      {item.title}
                                    </div>
                                    {item.children!.map((subItem) => {
                                      const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + '/');
                                      return (
                                        <Link
                                          key={subItem.title}
                                          href={subItem.url}
                                          className={`block px-2 py-1.5 rounded-md text-sm transition-colors
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
                                </PopoverContent>
                              </Popover>
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
                                  const isSubActive = pathname === subItem.url || pathname.startsWith(subItem.url + '/');
                                  return (
                                    <Link
                                      key={subItem.title}
                                      href={subItem.url}
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
