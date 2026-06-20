import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, X, Trophy, LogOut } from 'lucide-react';

// استيراد الشاشات والمكونات الجديدة
import LoginScreen from './components/LoginScreen';
import RoleSelectionScreen from './components/RoleSelectionScreen';
import TeacherDashboard from './components/TeacherDashboard';
import AdminDashboard from './components/AdminDashboard';

// استيراد إعدادات فايربيس
import { app } from "./components/firebaseConfig";
import { getFirestore } from "firebase/firestore";

export const db = getFirestore(app);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeRole, setActiveRole] = useState<'teacher' | 'admin' | null>(null);
  
  const [currentTime, setCurrentTime] = useState<string>('');
  const [notifications, setNotifications] = useState<{ id: number; message: string }[]>([]);

  useEffect(() => {
    console.log("هل قاعدة بيانات فايربيس متصلة بالكامل؟", db);
  }, []);

  const addNotification = (message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (email: string, role: 'teacher' | 'admin') => {
    setUserEmail(email);
    setIsLoggedIn(true);
    // Force direct entry to the Teacher Dashboard as the main user interface of the app
    setActiveRole('teacher');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setActiveRole(null);
    addNotification('تم تسجيل خروجك بأمان من النظام التفاعلي للحقيبة.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <header className="bg-emerald-900 text-white py-4 px-6 shadow-xl relative no-print flex justify-between items-center z-25">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
            <Trophy className="text-emerald-400" size={18} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-black tracking-tight leading-tight">الحقيبة الرقمية الموحدة</h1>
            <p className="text-[10px] text-emerald-300 font-bold leading-none mt-0.5">قطاع التربية الوطنية والرياضة المدرسية</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-[10px] text-emerald-300 font-bold">المستخدم الحالي</span>
              <span className="text-xs font-black font-mono leading-tight">{userEmail}</span>
            </div>
          )}
          <div className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 select-none">
            {currentTime}
          </div>
        </div>

        {/* Global Floating Notification Panel */}
        <div className="fixed top-4 left-4 z-50 flex flex-col gap-2 max-w-sm w-full no-print">
          <AnimatePresence>
            {notifications.map((not) => (
              <motion.div
                key={not.id}
                initial={{ opacity: 0, x: -50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                className="bg-slate-900 border border-emerald-600/40 text-slate-100 rounded-xl p-3 shadow-xl flex items-start justify-between gap-2.5 border-r-4 border-r-emerald-500 text-right select-none"
                dir="rtl"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={15} />
                  <p className="text-xs font-bold leading-relaxed">{not.message}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== not.id))}
                  className="text-slate-400 hover:text-white mr-auto shrink-0 p-0.5 rounded hover:bg-slate-800 transition focus:outline-none cursor-pointer"
                  title="إغلاق التنبيه"
                >
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </header>

      {/* Main app routing flow based on auth states */}
      <main className="flex-1 w-full bg-slate-50 relative z-10">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoginScreen 
                onLoginSuccess={handleLoginSuccess} 
                onNotification={addNotification} 
              />
            </motion.div>
          ) : activeRole === null ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              <RoleSelectionScreen 
                onSelectRole={(role) => {
                  setActiveRole(role);
                  addNotification(`مرحباً بك في لوحة أعمال: ${
                    role === 'teacher' ? 'مدرس التربية البدنية' : 'مدير النظام'
                  }`);
                }} 
                onLogout={handleLogout}
                userEmail={userEmail}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeRole === 'teacher' && (
                <TeacherDashboard 
                  onNotification={addNotification}
                  onGoBack={() => setActiveRole(null)}
                />
              )}
              {activeRole === 'admin' && (
                <AdminDashboard 
                  onNotification={addNotification}
                  onGoBack={() => setActiveRole(null)}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Compact Brand Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs font-medium no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3" dir="rtl">
          <p>© 2026 حقيبة أستاذ التربية البدنية والرياضية الرقمية. وزارة التربية الوطنية الجزائرية.</p>
          <p className="text-slate-500 font-mono text-[10px]">خادم آلي موحد للابتدائي • تشغيل آمن 🛡️</p>
        </div>
      </footer>
    </div>
  );
}
