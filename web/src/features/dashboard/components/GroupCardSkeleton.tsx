export default function GroupCardSkeleton() {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full border border-gray-200 overflow-hidden relative"
      role="status"
      aria-busy="true"
      aria-label="Loading group card"
    >
      {/* Shimmer Effect Overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      
      {/* Header */}
      <div className="mb-4">
        <div className="h-7 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mt-2 animate-pulse"></div>
      </div>

      {/* Badges */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="h-8 bg-gray-200 rounded-full w-28 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse"></div>
      </div>

      {/* Avatars */}
      <div className="mb-4 flex items-center">
        <div className="flex -space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-10 h-10 bg-gray-200 rounded-full border-2 border-white animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            ></div>
          ))}
        </div>
        <div className="ml-3 h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
      </div>

      {/* Last Activity */}
      <div className="mt-auto mb-4">
        <div className="h-3 bg-gray-200 rounded w-36 animate-pulse"></div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-[120px] h-10 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-20 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <span className="sr-only">Loading group information, please wait...</span>
    </div>
  );
}
