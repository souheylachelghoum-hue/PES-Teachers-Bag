import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Mail, Trophy, Award, Sparkles, LogIn, ChevronLeft } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (email: string, role: 'teacher' | 'admin') => void;
  onNotification?: (msg: string) => void;
}

export default function LoginScreen({ onLoginSuccess, onNotification }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Quick account options for the evaluation committee
  const demoAccounts = [
    { label: 'أستاذ التربية البدنية', email: 'teacher@pe.dz', pass: '123456', role: 'teacher' as const, color: 'border-emerald-500 hover:bg-emerald-50 text-emerald-700 bg-emerald-50/20' },
    { label: 'مدير النظام (Admin)', email: 'admin@pe.dz', pass: '123456', role: 'admin' as const, color: 'border-purple-500 hover:bg-purple-50 text-purple-700 bg-purple-50/20' }
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
    onNotification?.(`تم ملء بيانات الدخول لـ: ${acc.label}`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('يرجى كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);

    // Simulate authentication lag
    setTimeout(() => {
      setIsLoading(false);
      
      // Determine role based on email context
      let role: 'teacher' | 'admin' = 'teacher';
      const cleanEmail = email.toLowerCase().trim();
      
      if (cleanEmail === 'admin@pe.dz' || cleanEmail.includes('admin')) {
        role = 'admin';
      }

      onNotification?.('تم تسجيل الدخول بنجاح! مرحباً بك في بوابتك التربوية.');
      onLoginSuccess(email, role);
    }, 750);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50/50 via-white to-slate-100/40 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Rings */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        {/* App Whistle & Trophy Visual Logo */}
        <div className="flex items-center gap-4 mb-6 border-b border-dashed border-slate-200 pb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Trophy className="text-white" size={28} />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">حقيبة أستاذ التربية البدنية</h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1 leading-tight">النظام الرقمي البيداغوجي الشامل لمدرسي ومديري المادة</p>
          </div>
        </div>

        <div className="border-b border-dashed border-slate-200 pb-2 mb-4">
          <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Lock className="text-emerald-600" size={18} />
            بوابة تسجيل الدخول الآمن
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 mb-4 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المعتمد:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="name@school-pe.dz"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور الخاصة بالمستخدم:</label>
              <div className="relative">
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pr-10 pl-4 py-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-[0.98] duration-150 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>تسجيل الدخول للنظام</span>
              </>
            )}
          </button>
        </form>

        {/* Evaluation Committee Helper */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-1.5 mb-3 text-emerald-700 font-bold text-xs bg-emerald-50/50 p-2 rounded-lg justify-center">
            <Sparkles size={14} className="text-emerald-500" />
            <span>تسهيل محاكاة أدوار العرض والتقييم:</span>
          </div>
          <p className="text-[11px] text-slate-500 font-bold mb-3.5 text-center leading-relaxed">
            لأغراض العرض المباشر أمام لجنة التحكيم الموقرة، انقر على أي حساب لتعبئة البيانات والدخول فوراً للاطلاع على ميزاته المتكاملة:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoAccounts.map((acc, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleQuickLogin(acc)}
                className={`w-full text-right p-2.5 rounded-xl border border-dashed hover:border-solid text-xs font-extrabold flex justify-between items-center transition duration-150 cursor-pointer ${acc.color}`}
              >
                <span>{acc.label}</span>
                <span className="font-mono text-[10px] opacity-75 flex items-center gap-1">
                  {acc.email} <ChevronLeft size={10} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
