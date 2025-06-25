import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Sparkles, RefreshCw } from 'lucide-react';
import { useUserProgress } from '../hooks/useUserProgress';

interface GFKProgressProps {
  user: any;
}

const GFKProgress: React.FC<GFKProgressProps> = ({ user }) => {
  const { progress, isLoading, getLevelInfo, getNextLevelInfo, refreshProgress } = useUserProgress(user);

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refreshProgress();
  };

  // Debug logging
  useEffect(() => {
    console.log('GFKProgress - User:', user?.id);
    console.log('GFKProgress - Progress data:', progress);
    console.log('GFKProgress - Loading:', isLoading);
  }, [user, progress, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // Fallback wenn kein Progress vorhanden ist
  if (!progress) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🌱</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ihr GFK-Fortschritt</h3>
              <p className="text-sm text-gray-600">Du beginnst deine GFK-Reise</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-xs text-gray-500">Umformulierungen</div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-600">Anfänger</span>
            <span className="text-xs text-gray-500">0% abgeschlossen</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-green-400 w-0"></div>
          </div>
        </div>
        
        <div className="bg-white/60 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Motivation</span>
          </div>
          <p className="text-sm text-gray-600">
            Starten Sie mit Ihrer ersten GFK-Transformation! 🌱
          </p>
        </div>
      </div>
    );
  }

  const levelInfo = getLevelInfo(progress.current_level);
  const nextLevelInfo = getNextLevelInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-purple-100"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${levelInfo.bgColor} rounded-xl flex items-center justify-center`}>
            <span className="text-2xl">{levelInfo.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Ihr GFK-Fortschritt</h3>
            <p className="text-sm text-gray-600">{levelInfo.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-600">{progress.total_transformations}</div>
          <div className="text-xs text-gray-500">Umformulierungen</div>
          <button
            onClick={handleRefresh}
            className="mt-2 p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Level Badge */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-semibold ${levelInfo.color}`}>
            {progress.current_level}
          </span>
          <span className="text-xs text-gray-500">
            {progress.level_progress}% abgeschlossen
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.level_progress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-2 rounded-full ${levelInfo.bgColor.replace('bg-', 'bg-gradient-to-r from-').replace('-100', '-400')} to-${levelInfo.color.replace('text-', '')}-300`}
          />
        </div>
      </div>

      {/* Next Level Info */}
      {nextLevelInfo && nextLevelInfo.remaining > 0 && (
        <div className="bg-white/60 rounded-xl p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Nächster Meilenstein</span>
          </div>
          <p className="text-sm text-gray-600">
            Noch <span className="font-semibold text-purple-600">{nextLevelInfo.remaining}</span> Umformulierungen bis zum Level "{nextLevelInfo.nextLevel}"
          </p>
        </div>
      )}

      {/* Achievement Message */}
      {nextLevelInfo && nextLevelInfo.remaining === 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 mb-4 border border-yellow-200">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-800">Glückwunsch!</span>
          </div>
          <p className="text-sm text-yellow-700">
            Du hast das Level "{progress.current_level}" erreicht! 🎉
          </p>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-white/60 rounded-xl p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Motivation</span>
        </div>
        <p className="text-sm text-gray-600">
          Jede Umformulierung bringt Sie näher zu einer empathischeren Kommunikation. Weiter so! 🌱
        </p>
      </div>

      {/* Level Overview */}
      <div className="mt-6 pt-4 border-t border-purple-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Level-Übersicht</h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
          {[
            { name: 'Anfänger', icon: '🌱', threshold: 0 },
            { name: 'Fortgeschritten', icon: '🌿', threshold: 20 },
            { name: 'Profi', icon: '🌳', threshold: 50 },
            { name: 'Experte', icon: '🌟', threshold: 100 },
            { name: 'GFK Meister', icon: '👑', threshold: 200 }
          ].map((level, index) => {
            const isCompleted = progress.total_transformations >= level.threshold;
            const isCurrent = progress.current_level === level.name;
            
            return (
              <div
                key={level.name}
                className={`text-center p-2 rounded-lg ${
                  isCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : isCurrent 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="text-lg mb-1">{level.icon}</div>
                <div className="font-medium">{level.name}</div>
                <div className="text-xs opacity-75">{level.threshold}+</div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default GFKProgress; 