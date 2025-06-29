import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Target, 
  Users, 
  Award,
  Activity,
  BarChart3,
  Star,
  Zap
} from 'lucide-react';

interface UserStats {
  level_name: string;
  progress: number;
  total_transformations: number;
  weekly_activity: number;
  monthly_activity: number;
  avg_daily_usage: number;
  consistency_score: number;
  quality_score: number;
  last_activity: string;
  days_since_last_activity: number;
  level_details: {
    level_requirements: {
      next_level: string;
      remaining_transformations: number;
    };
    activity_metrics: {
      daily_avg: number;
      weekly_trend: string;
      consistency: string;
    };
    achievements: {
      first_transformation: boolean;
      regular_user: boolean;
      power_user: boolean;
      gfk_expert: boolean;
      consistency_master: boolean;
    };
  };
}

interface GlobalStats {
  total_users: number;
  total_transformations: number;
  avg_transformations_per_user: number;
  most_active_level: string;
  daily_active_users: number;
  weekly_active_users: number;
  monthly_active_users: number;
  top_performers: {
    top_5_users: Array<{
      user_id: string;
      total_transformations: number;
      level: string;
    }>;
    level_distribution: Record<string, number>;
  };
}

export default function StatisticsPage() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'global'>('personal');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUser(user);
      loadStatistics();
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        loadStatistics();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadStatistics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Load user statistics
      const { data: userData, error: userError } = await supabase
        .rpc('calculate_gfk_level', { include_stats: true });

      if (userError) throw userError;

      // Load global statistics
      const { data: globalData, error: globalError } = await supabase
        .rpc('get_global_gfk_stats');

      if (globalError) throw globalError;

      setUserStats(userData?.[0] || null);
      setGlobalStats(globalData?.[0] || null);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('Fehler beim Laden der Statistiken');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Anfänger': return 'bg-blue-100 text-blue-800';
      case 'Lernender': return 'bg-green-100 text-green-800';
      case 'Fortgeschritten': return 'bg-yellow-100 text-yellow-800';
      case 'Profi': return 'bg-orange-100 text-orange-800';
      case 'Experte': return 'bg-red-100 text-red-800';
      case 'GFK Meister': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'steigend': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'fallend': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={loadStatistics} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          GFK Statistiken
        </h1>
        <p className="text-gray-600">
          Deine Fortschritte und Erfolge in der Gewaltfreien Kommunikation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'personal' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4" />
          Persönliche Statistiken
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
            activeTab === 'global' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Community Übersicht
        </button>
      </div>

      {/* Personal Statistics */}
      {activeTab === 'personal' && userStats && (
        <div className="space-y-6">
          {/* Level Overview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <h2 className="text-xl font-bold">Dein GFK Level</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(userStats.level_name)}`}>
                    {userStats.level_name}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {userStats.total_transformations} Transformationen
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats.progress}%
                  </p>
                  <p className="text-sm text-gray-600">Fortschritt</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${userStats.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Nächstes Level: {userStats.level_details.level_requirements.next_level}
                {userStats.level_details.level_requirements.remaining_transformations > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({userStats.level_details.level_requirements.remaining_transformations} weitere nötig)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Activity Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Wöchentliche Aktivität</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.weekly_activity}
              </p>
              <p className="text-sm text-gray-600">Transformationen</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Konsistenz</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.consistency_score}%
              </p>
              <p className="text-sm text-gray-600">
                {userStats.level_details.activity_metrics.consistency}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Qualitäts-Score</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {userStats.quality_score}%
              </p>
              <p className="text-sm text-gray-600">Basierend auf Erfahrung</p>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold">Erfolge</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(userStats.level_details.achievements).map(([key, achieved]) => (
                <div key={key} className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    achieved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {achieved ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  <p className="text-xs text-gray-600 capitalize">
                    {key.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Trend */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold">Aktivitäts-Trend</h2>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {getTrendIcon(userStats.level_details.activity_metrics.weekly_trend)}
              <span className="font-medium">
                Trend: {userStats.level_details.activity_metrics.weekly_trend}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Durchschnitt pro Tag:</span>
                <span className="font-medium">
                  {userStats.level_details.activity_metrics.daily_avg.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Letzte Aktivität:</span>
                <span className="font-medium">
                  vor {userStats.days_since_last_activity} Tagen
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Statistics */}
      {activeTab === 'global' && globalStats && (
        <div className="space-y-6">
          {/* Global Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Gesamt Nutzer</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {globalStats.total_users}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Transformationen</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {globalStats.total_transformations}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Durchschnitt</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {globalStats.avg_transformations_per_user.toFixed(1)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Aktive Nutzer</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {globalStats.weekly_active_users}
              </p>
              <p className="text-sm text-gray-600">diese Woche</p>
            </div>
          </div>

          {/* Level Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Level-Verteilung</h2>
            <div className="space-y-3">
              {Object.entries(globalStats.top_performers.level_distribution || {}).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(level)}`}>
                      {level}
                    </span>
                  </div>
                  <span className="font-medium">{count} Nutzer</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Top 5 Nutzer</h2>
            <div className="space-y-3">
              {globalStats.top_performers.top_5_users?.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">Nutzer {user.user_id.slice(0, 8)}...</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level)}`}>
                        {user.level}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{user.total_transformations}</p>
                    <p className="text-sm text-gray-600">Transformationen</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 