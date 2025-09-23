import { AppLayout } from '@/components/layout/AppLayout'

export default function TaxManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppLayout>{children}</AppLayout>
}