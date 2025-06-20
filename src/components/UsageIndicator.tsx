import React from 'react';
import { motion } from 'framer-motion';

interface UsageInfo {
  remaining: number;
  max: number;
}

interface UsageIndicatorProps {
  session: { type: string } | null;
  usageInfo: UsageInfo | null;
}

const UsageIndicator: React.FC<UsageIndicatorProps> = (props: UsageIndicatorProps) => {
  const { session, usageInfo } = props;
  
  // Debug logging
  console.log('UsageIndicator - session:', session);
  console.log('UsageIndicator - usageInfo:', usageInfo);
  
  // Show for non-authenticated users (anonymous, ip_fallback, or no session)
  // Only hide for authenticated users
  if (session && session.type === 'authenticated') {
    console.log('UsageIndicator - hiding for authenticated user');
    return null;
  }

  // If no usageInfo, show default values for non-authenticated users
  const remaining = usageInfo?.remaining ?? 5;
  const max = usageInfo?.max ?? 5;

  console.log('UsageIndicator - showing with remaining:', remaining, 'max:', max);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-40"
    >
      <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl px-4 py-2 border border-purple-100">
        <span className="font-medium text-purple-700 text-sm">
          {remaining} von {max} Eingaben übrig
        </span>
      </div>
    </motion.div>
  );
};

export default UsageIndicator; 