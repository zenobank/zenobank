import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/src/components/ui/sidebar';
import { NavGroup } from '@/src/components/layout/nav-group';
import { useSidebarData } from './use-sidebar-data';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarData = useSidebarData();
  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <img src={'/images/logo-black.png'} alt="Clerk" className="ml-2 w-1/2 pt-2" />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={sidebarData.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
