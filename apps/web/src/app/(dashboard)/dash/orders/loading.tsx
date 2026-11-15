import { PageContainer } from '@/components/app/page-container';
import { TableSkeleton } from '@/components/dashboard/system-states';
import { Skeleton } from '@/components/ui/skeleton';

/** Orders loading state: 00.07 "Loading · orders table" skeleton under a skeleton header. */
export default function OrdersLoading() {
  return (
    <PageContainer>
      <div className="hidden flex-col gap-2 lg:flex">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>
      <div className="flex gap-3 overflow-hidden">
        {[60, 90, 110, 80, 90].map((w, i) => (
          <Skeleton key={i} className="h-7 shrink-0 rounded-pill" style={{ width: w }} />
        ))}
      </div>
      <TableSkeleton rows={6} />
    </PageContainer>
  );
}
