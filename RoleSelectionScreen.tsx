import React from 'react';
import { motion } from 'motion/react';
import { Shield, BookOpen, UserCheck, Star, Trophy, Users, LayoutDashboard, Settings, LogOut } from 'lucide-react';

interface RoleSelectionScreenProps {
  onSelectRole: (role: 'teacher' | 'admin') => void;
  onLogout: () => void;
  userEmail: string;
}

export default function RoleSelectionScreen({ onSelectRole, onLogout, userEmail }: RoleSelectionScreenProps) {
  const roles = [
    {
      id: 'teacher' as const,
      title: 'أستاذ التربية البدنية والرياضية',
      description: 'إدارة وتخطيط الحصص الدراسية، تشغيل محاكيات الملاعب والخطط التكتيكية، إعداد المذكرات ومقاييس الاختبارات البدنية للطلاب، ومعالجة تقارير الإسعافات الفورية.',
      badge: 'الواجهة البيداغوجية والتدريبية',
      color: 'from-emerald-600 to-teal-700 shadow-emerald-600/10 hover:shadow-emerald-600/30 border-emerald-500/20 hover:border-emerald-500',
      iconBg: 'bg-emerald-50 text-emerald-600',
      icon: Trophy,
      bullet: ['مكتبة الوثائق الرسمية والمناهج', 'مولد ومعد المذكرات اليومية', 'محاكي تكتيك وتسيير الأفواج الفريد', 'بطاقة النقاط والتقويم المهاري المحوسب']
    },
    {
      id: 'admin' as const,
      title: 'مدير النظام (Admin)',
      description: 'التحكم العام في قواعد البيانات والمشتركين، تهيئة الملفات والمستندات بوزارة التربية، وتتبع مؤشرات استخدام المنصة وصحة سير المخدمات الفورية.',
      badge: 'واجهة التحكم والعمليات الكبرى',
      color: 'from-purple-600 to-indigo-800 shadow-purple-600/10 hover:shadow-purple-600/30 border-purple-500/20 hover:border-purple-500',
      iconBg: 'bg-purple-50 text-purple-600',
      icon: Settings,
      bullet: ['إدارة حسابات الأساتذة والمديرين', 'إدراج، تعديل وحذف المحاضر الرسمية', 'سجل مراقبة سلامة الخوادم والأداء', 'إحصائيات المنصة الكلية لمفتشية المادة']
    }
  ];

  return (
    <div className="min-h-[85vh] py-10 px-4 md:px-8 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center font-sans" dir="rtl">
      {/* Soft background decor */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-100/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl w-full text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/50 mb-3 text-xs font-bold shadow-sm">
          <Star size={14} className="fill-emerald-600 text-emerald-600 animate-spin" />
          <span>بوابة الدعم البيداغوجي الموحدة</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">اختر نوع حسابك للولوج للوحة العمل</h1>
        <p className="text-slate-500 text-xs font-semibold mt-1.5 max-w-xl mx-auto">
          مرحباً بك مجدداً. تم تحديد هويتك كـ (<span className="text-emerald-700 font-bold">{userEmail}</span>). يرجى اختيار البيئة المناسبة لتخصصك بضغطة زر واحدة:
        </p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {roles.map((role, idx) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              whileHover={{ y: -6 }}
              className="bg-white border-2 border-slate-200/60 rounded-3xl p-6 shadow-lg flex flex-col justify-between hover:shadow-2xl hover:border-slate-350 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="absolute -right-3 -top-3 w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-slate-200/10 rounded-full scale-150 pointer-events-none" />
              
              <div>
                {/* Badge */}
                <span className={`inline-block text-[10px] font-black px-3 py-1 bg-slate-100 rounded-full text-slate-700 tracking-wide mb-4`}>
                  {role.badge}
                </span>

                {/* Head */}
                <div className="flex items-center gap-3.5 mb-4">
                  <div className={`p-3 rounded-2xl ${role.iconBg} font-black shadow-md`}>
                    <Icon size={25} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-800 transition">
                    {role.title}
                  </h3>
                </div>

                {/* Desc */}
                <p className="text-xs text-slate-500 leading-relaxed mb-5 font-medium text-right font-sans">
                  {role.description}
                </p>

                {/* Bullet items list */}
                <div className="border-t border-slate-100 pt-4 mb-6">
                  <span className="text-[10px] font-bold text-slate-400 block mb-2 text-right">أهم الأدوات والوحدات المدمجة:</span>
                  <ul className="space-y-1.5 text-right">
                    {role.bullet.map((b, i) => (
                      <li key={i} className="text-xs text-slate-705 font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectRole(role.id)}
                className={`w-full py-3 px-4 rounded-xl text-white font-extrabold text-xs bg-gradient-to-l ${role.color} hover:contrast-125 transition active:scale-[0.98] duration-150 flex items-center justify-center gap-2 cursor-pointer`}
              >
                <span>دخول لوحة العمل</span>
                <span className="font-sans font-bold">←</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Logout button */}
      <button
        onClick={onLogout}
        className="mt-10 px-5 py-2.5 rounded-xl border-2 border-rose-500/20 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-2 duration-150 cursor-pointer"
      >
        <LogOut size={15} />
        <span>تسجيل الخروج من البوابة التربوية</span>
      </button>
    </div>
  );
}
