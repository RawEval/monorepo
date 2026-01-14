import { SidebarLayout } from '@/components/layout/sidebar-layout';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SidebarLayout>{children}</SidebarLayout>;
}
