import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, Users, Landmark, FileText, Activity, ShieldAlert,
  Plus, Trash2, ArrowRight, UserPlus, ToggleLeft, ToggleRight, 
  RefreshCw, CheckCircle2, Shield, HardDrive, Database, Cpu, Search,
  Edit, Sparkles, Check
} from 'lucide-react';

interface AdminDashboardProps {
  onNotification?: (msg: string) => void;
  onGoBack: () => void;
}

export default function AdminDashboard({ onNotification, onGoBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'files' | 'platform'>('users');

  // --- SUB-STATE: User Management ---
  const [users, setUsers] = useState([
    { id: 1, name: 'الأستاذ مراد بوعلاق', email: 'teacher@pe.dz', role: 'teacher', status: 'نشط', classAssign: 'ابتدائية ابن خلدون' },
    { id: 2, name: 'المدير السعيد بوسالم', email: 'principal@pe.dz', role: 'principal', status: 'نشط', classAssign: 'ابتدائية ابن خلدون' },
    { id: 3, name: 'المفتش البيداغوجي رياض معمري', email: 'inspector@pe.dz', role: 'principal', status: 'نشط', classAssign: 'مقاطعة الجزائر غرب' },
    { id: 4, name: 'الأستاذة سامية يوسفي', email: 'samia@pe.dz', role: 'teacher', status: 'نشط', classAssign: 'ابتدائية الأمير عبد القادر' },
    { id: 5, name: 'المشرف الإداري حمزة علوي', email: 'hamza@pe.dz', role: 'admin', status: 'محظور', classAssign: 'مديرية التربية والتشريع' }
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'teacher', classAssign: '' });
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      onNotification?.('يرجى كتابة الاسم والبريد الإلكتروني لإضافة الحساب.');
      return;
    }
    const created = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'نشط',
      classAssign: newUser.classAssign || 'مؤسسة جديدة غير محددة'
    };
    setUsers([...users, created]);
    setNewUser({ name: '', email: '', role: 'teacher', classAssign: '' });
    setShowAddUserForm(false);
    onNotification?.(`✅ تم تسجيل حساب جديد بنجاح: ${created.name}`);
  };

  const toggleUserStatus = (id: number) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const nextStatus = u.status === 'نشط' ? 'محظور' : 'نشط';
        onNotification?.(nextStatus === 'محظور' ? `🔒 تم تجميد حساب: ${u.name}` : `🔓 تم إعادة تنشيط حساب: ${u.name}`);
        return { ...u, status: nextStatus };
      }
      return u;
    });
    setUsers(updated);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    onNotification?.('تم التطهير الكامل لبيانات الحساب المحدد من السجلات.');
  };

  // --- SUB-STATE: App Content Management ---
  const [contents, setContents] = useState([
    { id: 1, title: 'منشور وزاري رقم 441 - تنظيم الأنشطة البدنية المدرسية', type: 'مستند بيداغوجي', visits: '1,420 زيارة', status: 'مفعل' },
    { id: 2, title: 'حقيبة التدريب على حركات الإحماء والتبريد العضلي للابتدائي', type: 'دليل إسعافي', visits: '840 زيارة', status: 'مفعل' },
    { id: 3, title: 'شروحات محاكاة التشكيلات التكتيكية للأفواج الرياضية', type: 'نظام رقمي', visits: '2,110 زيارة', status: 'مفعل' }
  ]);

  const [newContent, setNewContent] = useState({ title: '', type: 'مستند بيداغوجي' });
  const [showAddContentForm, setShowAddContentForm] = useState(false);

  const handleAddContent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.title.trim()) return;
    const added = {
      id: Date.now(),
      title: newContent.title,
      type: newContent.type,
      visits: '0 زيارة',
      status: 'مفعل'
    };
    setContents([added, ...contents]);
    setNewContent({ title: '', type: 'مستند بيداغوجي' });
    setShowAddContentForm(false);
    onNotification?.(`✅ تم إدراج المحتوى المرجعي: "${added.title}" في مكتبة المنصة الكلية.`);
  };

  const handleDeleteContent = (id: number) => {
    setContents(contents.filter(c => c.id !== id));
    onNotification?.('تم إزالة المحتوى من مكتبة العرض التفاعلية.');
  };

  // --- SUB-STATE: File and Document Control ---
  const [platformFiles, setPlatformFiles] = useState([
    { id: 1, fileName: 'مذكرات_الاسترجاع_والإحماء_مراد_بوعلاق.docx', size: '1.4 MB', owner: 'teacher@pe.dz', type: 'Word Document', security: 'مفحوص وآمن' },
    { id: 2, fileName: 'مخطط_البطولة_البلدية_للجري_السريع.pdf', size: '4.2 MB', owner: 'principal@pe.dz', type: 'PDF Document', security: 'مفحوص وآمن' },
    { id: 3, fileName: 'كشف_النقاط_الفصلية_والنمو.xlsx', size: '2.1 MB', owner: 'teacher@pe.dz', type: 'Excel Spreadsheet', security: 'مفحوص وآمن' }
  ]);

  const handleDeletePlatformFile = (id: number) => {
    setPlatformFiles(platformFiles.filter(f => f.id !== id));
    onNotification?.('تم حذف الملف من مخازن التخزين السحابي للمشروع.');
  };

  // System status parameters
  const storageLimit = 10; // 10 GB
  const storageUsed = 1.25; // 1.25 GB
  const percentageUsed = (storageUsed / storageLimit) * 100;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans" dir="rtl">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-950 text-white p-6 rounded-b-[2.5rem] shadow-2xl relative mb-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 shadow-inner">
              <Settings className="text-purple-300" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-black border border-purple-500/20">
                  لوحة التحكم الكلية للنظام
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-ping" />
              </div>
              <h1 className="text-xl font-black mt-1">بوابة مدير النظام والعمليات (System Admin)</h1>
              <p className="text-xs text-purple-200 mt-0.5">التحكم في الهوية الرقمية، جرد ملفات الخادم، وتنظيم المكاتب والمحاذاة التشغيلية</p>
            </div>
          </div>
          
          <button
            onClick={onGoBack}
            className="bg-white/15 hover:bg-white/20 text-white border border-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 self-end md:self-auto cursor-pointer"
          >
            <ArrowRight size={14} />
            العودة لتبديل الحساب
          </button>
        </div>

        {/* Dynamic Admin Bento Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/10 pt-6">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-purple-200 block font-semibold">حالة الأنظمة الرقمية والربط</span>
            <span className="text-xs font-black text-emerald-300 mt-1 block flex items-center gap-1.5">
              كل الأنظمة نشطة وبكفاءة 🟢
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-purple-200 block font-semibold">استهلاك التخزين السحابي</span>
            <span className="text-xs font-black text-white mt-1 block">
              {storageUsed} GB / {storageLimit} GB ({percentageUsed.toFixed(1)}%)
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-purple-200 block font-semibold">زمن استجابة الخادم اللحظي</span>
            <span className="text-xs font-black text-emerald-400 mt-1 block">
              18 مللي ثانية (ممتاز) 📈
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-purple-200 block font-semibold">قاعدة اتصال فايربيس و SQL</span>
            <span className="text-xs font-black text-emerald-300 mt-1 block flex items-center gap-1">
              متصل ومقترن 🟢
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Horizontal Navigation and Content underneath */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        
        {/* Navigation Header Tabs (Horizontal) (no-print) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xl shadow-slate-200/40 no-print space-y-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-dashed border-slate-200 pb-3">
            <div className="text-right">
              <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block font-sans">بوابة الإدارة والتأمين</span>
              <h2 className="text-sm font-black text-slate-800">تأمين وإدارة البنية التحتية والمحتوى الرقمي</h2>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">بلمسة واحدة، تحكّم بالبيانات الوطنية وسجلات الخوادم الكلية</p>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('users')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'users' 
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Users size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">إدارة الحسابات</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">تظهير وصياغة المستخدمين</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'content' 
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <FileText size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">تكوين المحتوى</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">زرع وتعديل المناشير والأدلة</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('files')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'files' 
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <HardDrive size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">رقابة المستندات</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">مراقبة جودة وأمن الملفات</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('platform')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'platform' 
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-700/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Activity size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">الإحصائيات الكلية</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">معاينة الحمولة وصحة المخدم</p>
              </div>
            </button>
          </div>
        </div>

        {/* Display Pane */}
        <div className="min-w-0 w-full">
          <AnimatePresence mode="wait">
            
            {/* --- TAB: USERS MANAGEMENT (إدارة المستخدمين) --- */}
            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-right space-y-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Users className="text-purple-700" />
                      لوحة إدارة الهوية الرقمية ومجموع فواعل التطبيق
                    </h2>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">تسجيل مستخدمين جدد للمؤسسات الفرعية، الإيقاف والتنشيط الموثوق لتأمين المخدم.</p>
                  </div>

                  <button
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-purple-700 hover:bg-purple-850 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-md transition duration-150 cursor-pointer"
                  >
                    <UserPlus size={15} />
                    {showAddUserForm ? 'إخفاء نموذج الإضافة' : 'إنشاء حساب مستخدم'}
                  </button>
                </div>

                {/* Quick Add User Form */}
                {showAddUserForm && (
                  <form onSubmit={handleAddUser} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 text-right animate-fadeIn">
                    <h3 className="text-xs font-black text-slate-800 mb-3 block">➕ صياغة هوية مستخدم جديد بالمنظومة:</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">الاسم الكامل للمستخدم:</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: د. كمال بن صالح"
                          value={newUser.name}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">البريد الإلكتروني المعتمد:</label>
                        <input
                          type="email"
                          required
                          placeholder="name@pe.dz"
                          value={newUser.email}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none dir-ltr text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">الرتبة والمسؤولية:</label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        >
                          <option value="teacher">أستاذ التربية البدنية</option>
                          <option value="principal">مدير مؤسسة تعليمية / مفتش بيداغوجي</option>
                          <option value="admin">مدير نظام (Admin)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">المقاطعة / التعيين الجغرافي:</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: ابتدائية ابن خلدون"
                          value={newUser.classAssign}
                          onChange={(e) => setNewUser({ ...newUser, classAssign: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 text-xs pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddUserForm(false)}
                        className="px-4 py-2 bg-slate-200 font-bold text-slate-705 rounded-lg"
                      >
                        إلغاء التراجع
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-700 font-bold text-white rounded-lg hover:bg-purple-800"
                      >
                        تثبيت ورصد بالخادم
                      </button>
                    </div>
                  </form>
                )}

                {/* Users list table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-right border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-150 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-3 text-right">الاسم والمستخدم</th>
                        <th className="p-3 text-right">البريد الإلكتروني</th>
                        <th className="p-3 text-center">الرتبة والدور</th>
                        <th className="p-3 text-center">المقاطعة المدرسية</th>
                        <th className="p-3 text-center">حالة الحساب</th>
                        <th className="p-3 text-center">العمليات والتحكم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition font-medium">
                          <td className="p-3 font-extrabold text-slate-800">{u.name}</td>
                          <td className="p-3 text-right text-slate-500 font-mono font-bold leading-none">{u.email}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                              u.role === 'principal' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {u.role === 'admin' ? 'مدير نظام (Admin)' : u.role === 'principal' ? 'مدير مؤسسة' : 'أستاذ المادة'}
                            </span>
                          </td>
                          <td className="p-3 text-center text-slate-550 font-bold">{u.classAssign}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block h-2 w-2 rounded-full ${u.status === 'نشط' ? 'bg-emerald-500' : 'bg-rose-500'} ml-1`} />
                            <span className={u.status === 'نشط' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>{u.status}</span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => toggleUserStatus(u.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition duration-150 ${
                                  u.status === 'نشط' ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {u.status === 'نشط' ? 'تجميد الحساب' : 'إعادة التنشيط'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition duration-150"
                                title="إقالة دائمة"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* --- TAB: CONTENT CONFIG (إضافة وتعديل وحذف المحتوى) --- */}
            {activeTab === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-right space-y-4"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <FileText className="text-purple-700" />
                      بناء وتحديث المرجعية والمناشير الوزارية بالحقيبة الكلية
                    </h2>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">صياغة أو سحب المحتوى والمنشورات البيداغوجية، لجعلها مرئية لكافة الأساتذة في تدرجاتهم.</p>
                  </div>

                  <button
                    onClick={() => setShowAddContentForm(!showAddContentForm)}
                    className="bg-purple-700 hover:bg-purple-850 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-md transition duration-150 cursor-pointer"
                  >
                    <Plus size={15} />
                    {showAddContentForm ? 'إخفاء الإدراج' : 'إدراج سند مرجعي'}
                  </button>
                </div>

                {/* Form to insert content item */}
                {showAddContentForm && (
                  <form onSubmit={handleAddContent} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 text-right animate-fadeIn">
                    <h3 className="text-xs font-black text-slate-800 mb-3 block">✍️ إدخال منشور بيداغوجي / دليل تدبيري للمادة:</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">اسم وعنوان المستند التربوي المضاف:</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: التوزيع السنوي لمقاطع الأنشطة - السنة الثانية ابتدائي"
                          value={newContent.title}
                          onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-550 mb-1">صنف ومجال المستند:</label>
                        <select
                          value={newContent.type}
                          onChange={(e) => setNewContent({ ...newContent, type: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                        >
                          <option value="مستند بيداغوجي">مستند بيداغوجي وتدرج</option>
                          <option value="دليل إسعافي">دليل بيداغوجي وإسعافي</option>
                          <option value="بروتوكول سلامة">بروتوكول سلامة وحماية الملاعب</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddContentForm(false)}
                        className="px-4 py-2 bg-slate-200 font-bold text-slate-705 rounded-lg"
                      >
                        إلغاء التراجع
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-700 font-bold text-white rounded-lg hover:bg-purple-800"
                      >
                        بث للأجهزة والمنصة
                      </button>
                    </div>
                  </form>
                )}

                {/* List of contents */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-700 block mb-2">إدارة المراجع المطروحة حالياً بالمنصة لأولاف الأساتذة:</span>
                  {contents.map((item) => (
                    <div key={item.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between text-xs hover:shadow-md transition">
                      <div className="text-right">
                        <span className="inline-block text-[10px] font-extrabold bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md mb-1 border border-purple-100/50">
                          {item.type}
                        </span>
                        <h4 className="font-extrabold text-slate-805 mt-0.5">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">مرات المعاينة والتحميل: {item.visits} • مؤشر الحالة: {item.status} 🟢</p>
                      </div>

                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition duration-150"
                        title="إزالة للأبد"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- TAB: FILE CONTROL (إدارة الملفات) --- */}
            {activeTab === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-right space-y-4"
              >
                <div className="border-b border-slate-100 pb-3">
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <HardDrive className="text-purple-700" />
                    المطالعة السحابية الكلية وإدارة الملفات المرفوعة رقمياً
                  </h2>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">تفقد صحة الملفات المحملة بالحقيبة الشخصية من قبل الأساتذة، ومراقبة استهلاك المساحات المخصصة والموثوقية البدنية.</p>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs font-black text-slate-700 block">شواهد الملفات النشطة على خادمنا السحابي:</span>
                  {platformFiles.map((file) => (
                    <div key={file.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between text-xs hover:shadow-sm duration-150 transition">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 text-purple-800 rounded-xl font-bold font-mono">
                          FILE
                        </div>
                        <div className="text-right">
                          <h4 className="font-extrabold text-slate-800 line-clamp-1">{file.fileName}</h4>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">حجم الملف: {file.size} • المودع: {file.owner} • النوع المعتمد: {file.type}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-emerald-50 text-emerald-850 px-2.5 py-1 rounded-full border border-emerald-100 font-bold">
                          {file.security} ✓
                        </span>
                        
                        <button
                          onClick={() => handleDeletePlatformFile(file.id)}
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="حذف تفادياً للمساحات"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* --- TAB: APP GENERAL PERFORMANCE (الإحصائيات العامة) --- */}
            {activeTab === 'platform' && (
              <motion.div
                key="platform"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                className="space-y-4 text-right"
              >
                {/* Platform performance stats dashboard */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Cpu className="text-purple-700" size={18} />
                      معاينة اللياقة التشغيلية والتقنية لخوادم الحقيبة
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold mt-0.5">لوحة نظام المراقبة الفنية التلقائية لعمليات الاستعلام وقواعد البيانات والـ API.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 block font-bold">معدل تشغيل الخادم الكلي</span>
                      <span className="text-lg font-black text-emerald-700 block mt-1 font-mono">100.0% Uptime</span>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">خوادم Cloud Run متوازنة ومستقرة تماماً.</p>
                    </div>

                    <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 block font-bold">حمل قواعد البيانات المنفصلة</span>
                      <span className="text-lg font-black text-blue-700 block mt-1 font-mono">0.02% Load</span>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">الاستعلامات تتم بذاكرة تخزين موقت آمنة وسريعة.</p>
                    </div>

                    <div className="border border-slate-100 p-4 rounded-2xl bg-slate-50/50">
                      <span className="text-[10px] text-slate-400 block font-bold">إجمالي طلبات الـ API اليومية</span>
                      <span className="text-lg font-black text-purple-750 text-purple-700 block mt-1 font-mono">3,240 request</span>
                      <p className="text-[9px] text-slate-400 mt-1 font-bold">حجم استدعاءات ممتازة وموزعة بكفاءة بوزارتنا.</p>
                    </div>
                  </div>

                  {/* System console simulation */}
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-[10px] font-mono text-emerald-400 text-left space-y-1 overflow-x-auto select-none">
                    <p className="font-bold text-slate-500"># SYSTEM RECOVERY DIALOGS - VERIFIED METRICS</p>
                    <p>[2026-06-14 12:00:22] - SYSTEM: BOOTED SUCCESSFULLY AT CLOUD PORT CONTAINER : 3000</p>
                    <p>[2026-06-14 12:01:05] - DATABASE: FIREBASE FIRESTORE SYNC WITH RULE GENERATOR IS ACTIVE</p>
                    <p>[2026-06-14 12:02:11] - NETWORK: CORS AND PROXYS GRACEFULLY SERVING REDIRECTS</p>
                    <p>[2026-06-14 12:03:44] - OK: VERIFIED METRICS REPORT HEALTH 100% GREEN</p>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
