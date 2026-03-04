export function ChatSkeleton() {
  return (
    <div className="space-y-6 px-1 py-2 sm:px-2">
      {/* Skeleton 1: User Message */}
      <div className="flex justify-end">
        <div className="flex w-full max-w-[90%] flex-col items-end gap-2 sm:max-w-[85%] md:max-w-[80%]">
          <div className="bg-muted/50 h-10 w-48 animate-pulse rounded-2xl sm:w-64"></div>
        </div>
      </div>

      {/* Skeleton 2: Assistant Message */}
      <div className="flex justify-start">
        <div className="flex w-full max-w-[90%] flex-col gap-3 py-2 sm:max-w-[85%] md:max-w-full">
          <div className="bg-muted/50 h-4 w-[85%] animate-pulse rounded"></div>
          <div className="bg-muted/50 h-4 w-[65%] animate-pulse rounded"></div>
          <div className="bg-muted/50 h-4 w-[90%] animate-pulse rounded"></div>
          <div className="bg-muted/50 h-4 w-[40%] animate-pulse rounded"></div>
        </div>
      </div>

      {/* Skeleton 3: User Message */}
      <div className="flex justify-end pt-4">
        <div className="flex w-full max-w-[90%] flex-col items-end gap-2 sm:max-w-[85%] md:max-w-[80%]">
          <div className="bg-muted/50 h-16 w-56 animate-pulse rounded-2xl sm:w-72"></div>
        </div>
      </div>

      {/* Skeleton 4: Assistant Message */}
      <div className="flex justify-start">
        <div className="flex w-full max-w-[90%] flex-col gap-3 py-2 sm:max-w-[85%] md:max-w-full">
          <div className="bg-muted/50 h-4 w-[95%] animate-pulse rounded"></div>
          <div className="bg-muted/50 h-4 w-[75%] animate-pulse rounded"></div>
          <div className="bg-muted/50 h-4 w-[60%] animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  );
}
