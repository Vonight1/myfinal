// Base skeleton element
export function Skeleton({ className = '' }) {
  return <div className={`bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-lg ${className}`} />;
}

// Skeleton ສຳລັບ Job Card (HomePage + JobsPage)
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      <Skeleton className="h-40 rounded-none" />
      <div className="px-5 -mt-8 flex items-end justify-between gap-3">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
        <div className="flex gap-2 pb-1">
          <Skeleton className="w-12 h-3" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
      </div>
      <div className="p-5 pt-3 space-y-3">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3" />
        <Skeleton className="w-2/3 h-3" />
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-full h-10 rounded-xl mt-2" />
      </div>
    </div>
  );
}

// Skeleton grid ສຳລັບ jobs (default 6)
export function JobGridSkeleton({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <JobCardSkeleton key={i} />)}
    </div>
  );
}

// Skeleton ສຳລັບ list item (applicant, application, etc.)
export function ListItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/2 h-3" />
        </div>
        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton ສຳລັບໜ້າ profile
export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
      <Skeleton className="h-56 rounded-none" />
      <div className="px-6 -mt-10 flex items-end gap-3">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <Skeleton className="w-24 h-8 rounded-full" />
      </div>
      <div className="p-6 space-y-4">
        <Skeleton className="w-1/2 h-8" />
        <Skeleton className="w-1/3 h-4" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// Inline spinner (ນ້ອຍ, ສຳລັບ button)
export function Spinner({ size = 'sm' }) {
  const sizes = { xs: 'w-3 h-3 border-2', sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-4' };
  return <div className={`${sizes[size]} border-white/30 border-t-white rounded-full animate-spin`} />;
}

// Page loading (ກາງໜ້າ)
export function PageLoader() {
  return (
    <div className="flex justify-center py-32">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}
