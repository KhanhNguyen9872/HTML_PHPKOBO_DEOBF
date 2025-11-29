import { motion } from 'framer-motion'

export default function PreviewSkeleton() {
  return (
    <div className="flex flex-col border border-bw-gray-d dark:border-bw-gray-3 rounded-sm bg-bw-white dark:bg-bw-gray-2 shadow-sm flex-1 min-h-[300px] sm:min-h-[400px] md:min-h-[520px]">
      {/* Header skeleton */}
      <div className="px-3 sm:px-5 py-2 sm:py-3 bg-bw-gray-f dark:bg-bw-gray-3 border-b border-bw-gray-d dark:border-bw-gray-3">
        <div className="flex justify-between items-center">
          <motion.div
            className="h-4 w-20 bg-bw-gray-d dark:bg-bw-gray-7 rounded"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-7 w-7 bg-bw-gray-d dark:bg-bw-gray-7 rounded-sm"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Preview content skeleton */}
      <div className="flex-1 bg-bw-gray-f dark:bg-bw-gray-1 p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <motion.div
            className="h-8 bg-bw-gray-d dark:bg-bw-gray-7 rounded"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="h-4 bg-bw-gray-d dark:bg-bw-gray-7 rounded"
                style={{ width: `${Math.random() * 30 + 70}%` }}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <motion.div
            className="h-32 bg-bw-gray-d dark:bg-bw-gray-7 rounded"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>
      </div>
    </div>
  )
}

