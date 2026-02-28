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
  Microscope,
  Ambulance
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
import { SIDEBAR_CONFIG, AppMode } from '@/lib/constants/sidebar.config';

type SidebarChildItem = {
  title: string;
  url: string;
  subject?: string;
  action?: string;
  moduleCode?: string;
};

type SidebarItem = {
  title: string;
  url?: string;
  subject?: string;
  action?: string;
  moduleCode?: string;
  icon: React.ElementType;
  children?: SidebarChildItem[];
};


export function AppSidebar({ mode, moduleData }: { mode: AppMode | undefined, moduleData?: any }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { user } = useAuth();
  const items = SIDEBAR_CONFIG[mode || "hospital"] || [];

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>({});

  const ability = useAbility();

  const modulesArray = Array.isArray(moduleData?.data)
    ? moduleData.data
    : [];

  const groupedModules = modulesArray.reduce((acc: any, curr: any) => {
    const key = curr.masterModuleCode;

    if (!acc[key]) {
      acc[key] = {
        moduleName: curr.moduleName,
        masterModuleCode: curr.masterModuleCode,
        permissions: [],
      };
    }

    if (curr.permissionSubject) {
      acc[key].permissions.push(curr.permissionSubject);
    }

    return acc;
  }, {});



  const hasModulePermission = (moduleCode?: string) => {
    if (!moduleCode) return true;

    const module = groupedModules?.[moduleCode];

    if (!module) return false; // no permissions found

    return module.permissions.length > 0;
  };


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
                  src={user?.hospital?.logo || undefined}
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

                    // 🔹 Parent module check
                    if (!hasModulePermission(item.moduleCode)) return false;

                    // 🔹 Parent ability check
                    if (!canAccess(item.subject, item.action)) return false;

                    if (item.children) {

                      // 🔹 Child level filtering (module + ability)
                      const filteredChildren = item.children.filter((child) => {

                        // Child module check
                        if (child.moduleCode && !hasModulePermission(child.moduleCode)) {
                          return false;
                        }

                        // Child ability check
                        if (!canAccess(child.subject, child.action)) {
                          return false;
                        }

                        return true;
                      });

                      // Agar koi child nahi bacha → parent hide
                      if (filteredChildren.length === 0) return false;

                      // Update children safely
                      item.children = filteredChildren;
                    }

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

