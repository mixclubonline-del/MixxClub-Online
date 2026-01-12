import { motion } from 'framer-motion';

export function BazaarSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header skeleton */}
      <div className="pt-32 pb-8 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 animate-pulse" />
        <div className="w-64 h-12 mx-auto mb-4 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-96 h-6 mx-auto rounded-lg bg-white/5 animate-pulse" />
      </div>

      {/* Search skeleton */}
      <div className="px-4 md:px-8 py-4">
        <div className="max-w-5xl mx-auto">
          <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 h-12 rounded-lg bg-white/5 animate-pulse" />
              <div className="w-[180px] h-12 rounded-lg bg-white/5 animate-pulse" />
              <div className="w-[180px] h-12 rounded-lg bg-white/5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
                  <div className="w-16 h-6 rounded-full bg-white/10 animate-pulse" />
                </div>
                <div className="aspect-video rounded-xl bg-white/5 animate-pulse" />
                <div className="w-3/4 h-5 rounded bg-white/10 animate-pulse" />
                <div className="w-full h-4 rounded bg-white/5 animate-pulse" />
                <div className="flex justify-between items-center">
                  <div className="w-16 h-8 rounded bg-white/10 animate-pulse" />
                  <div className="w-20 h-6 rounded-full bg-white/5 animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse" />
                  <div className="flex-1 h-10 rounded-lg bg-white/10 animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
