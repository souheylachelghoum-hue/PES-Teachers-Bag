import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, FileText, ClipboardList, Activity, Sparkles, Plus, 
  Trash2, Download, Printer, UploadCloud, Users, CheckCircle2, 
  FileCheck, Calendar, HeartHandshake, Eye, AlertTriangle, FileSpreadsheet,
  ArrowRight, Search, PlusCircle, AlertCircle, RefreshCw, LayoutDashboard,
  GraduationCap, Award, BookOpen, ChevronUp, ChevronDown
} from 'lucide-react';

import DocumentLibrary from './DocumentLibrary';
import FirstAidManager from './FirstAidManager';
import FieldSimulator from './FieldSimulator';
import FormationLog from './FormationLog';

interface TeacherDashboardProps {
  onNotification?: (msg: string) => void;
  onGoBack: () => void;
}

export default function TeacherDashboard({ onNotification, onGoBack }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'docs' | 'formation' | 'firstaid' | 'simulator'>('simulator');

  // --- Sub-states for "الألعاب والأنشطة الرياضية" ---
  const [customGames, setCustomGames] = useState<any[]>([
    {
      name: 'سباق الكرات السريعة المتدحرجة',
      grade: 'الطور الأول ابتدائي',
      objective: 'تطوير كفاءة التنسيق الثنائي البصري الحركي والتكامل الحسي والسرعة الجماعية.',
      duration: '15 دقيقة',
      materials: 'أقماع ملونة، كرات صغيرة، صافرة بيداغوجية.',
      description: 'تمرير دحرجة الكرة بمهارة وسلاسة بين الأقدام المتباعدة لجميع لاعبي الفريق للتسجيل في المرمى القمعي المصغر بنهاية الصف.'
    }
  ]);
  const [newGameName, setNewGameName] = useState('');
  const [newGameGrade, setNewGameGrade] = useState('الطور الأول ابتدائي');
  const [newGameObjective, setNewGameObjective] = useState('');
  const [newGameDuration, setNewGameDuration] = useState('20 دقيقة');
  const [newGameMaterials, setNewGameMaterials] = useState('');
  const [newGameDesc, setNewGameDesc] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('كرة اليد');

  // --- Sub-states for "المذكرات" (Lesson Plans) ---
  const [selectedMemoIndex, setSelectedMemoIndex] = useState<number>(0);
  const [memos, setMemos] = useState([
    {
      level: 'السنة الرابعة ابتدائي',
      title: 'مذكرة تنمية التوافق العضلي العصبي والسرعة الارتدادية',
      objective: 'أن يكون المتعلم قادراً على التنقل السريع وتغيير الاتجاه باستجابة فورية للإشارات الصوتية دون فقدان التوازن البدني.',
      duration: '45 دقيقة',
      part1: 'الإحماء العام (10 د): تمرين الجري الخفيف حول الملعب مع حركات تنشيط المفاصل، ثم لعبة المطاردة الجماعية.',
      part2: 'المرحلة الرئيسية (25 د): تقسيم التلاميذ لأربع قاطرات، الجري المتعرج حول الأقماع مع تمرير كرة اليد، مع التركيز على السرعة والدقة.',
      part3: 'المرحلة الختامية (10 د): المشي الهادئ والارتخاء العضلي مع تمارين التنفس الشهيق والزفير لاسترجاع الحالة الطبيعية للنبض.',
      schoolYear: '2025/2026',
      inspector: 'أ. رياض معمري'
    },
    {
      level: 'السنة الخامسة ابتدائي',
      title: 'مجموعة تمارين الاستقبال والتمرير باليد من الثبات والتحرك',
      objective: 'تمكين المتعلم من إتقان تكنيك التمرير البيني باليد بدقة للزميل من مسافات متفاوتة مع التحرك في خطوط مائلة.',
      duration: '50 دقيقة',
      part1: 'الجزء التمهيدي (10 د): الجري بالصفارة مع رفع الركبتين عالياً، وحركات تقوية معصم اليد والكتف بالكرات الطبية الخفيفة.',
      part2: 'الجزء الرئيسي (30 د): تطبيق تمرين التمريرة المرتدة بالأرض، والتمريرة الصدرية، تليها منافسة ودية مصغرة لتطبيق المهارات المكتسبة.',
      part3: 'الجزء الختامي (10 د): تشكيل دائرة جلوس، مناقشة الملاحظة البيداغوجية، تكريم الفريق الفائز بروح رياضية والانصراف في هدوء.',
      schoolYear: '2025/2026',
      inspector: 'أ. رياض معمري'
    },
    {
      level: 'السنة الثالثة ابتدائي',
      title: 'مذكرة القفز الطولي وتنمية مرونة الأطراف السفلية',
      objective: 'أن يتعلم التلميذ الارتقاء بساق واحدة والهبوط الآمن بكلتا القدمين مع ثني الركبتين لامتصاص قوة الارتطام بالرمل.',
      duration: '45 دقيقة',
      part1: 'الجزء التمهيدي (10 د): لعبة الحجل والتخطي للأطواق الملونة لتهيئة عضلات ومفاصل الساقين بروح تنافسية ممتعة.',
      part2: 'الجزء الرئيسي (25 د): الجري بمسافة اقتراب قصيرة ثم الارتقاء من لوحة القفز و الهبوط على مرتبة إسفنجية لتفادي الإصابات.',
      part3: 'الجزء الختامي (10 د): تمرين الاسترخاء الكامل (وضعية النوم على الظهر) مع تهوية وسماع توجيهات الأستاذ حول السلامة البدنية.',
      schoolYear: '2025/2026',
      inspector: 'أ. رياض معمري'
    }
  ]);

  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memoForm, setMemoForm] = useState({ ...memos[0] });

  const handleCreateMemo = () => {
    const newMemo = {
      level: 'طور ابتدائي',
      title: 'مذكرة تعليمية جديدة لم يتم تحديد موضوعها بعد',
      objective: 'تنمية اللياقة الحركية العامة للمتعلم من خلال تمرينات مخصصة.',
      duration: '45 دقيقة',
      part1: 'الإحماء (10 د): هرولة خفيفة وتمارين إطالة العضلات الكبيرة.',
      part2: 'النشاط الرئيسي (25 د): تمرينات المهارة المستهدفة بالتبادل بين المجموعات.',
      part3: 'الارتخاء والتقييم (10 د): تبريد العضلات ومناقشة النقاط الإيجابية في الحصة ومجموع التقييمات الحركية.',
      schoolYear: '2025/2026',
      inspector: 'أ. رياض معمري'
    };
    setMemos([...memos, newMemo]);
    setSelectedMemoIndex(memos.length);
    setMemoForm(newMemo);
    setIsEditingMemo(true);
    onNotification?.('تم إنشاء مخطط بيداغوجي فارغ، يرجى كتابة البيانات بالنموذج.');
  };

  const handleUpdateMemo = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = [...memos];
    updated[selectedMemoIndex] = { ...memoForm };
    setMemos(updated);
    setIsEditingMemo(false);
    onNotification?.('تم حفظ التعديلات وحوسبة الدفتر البيداغوجي بنجاح!');
  };

  const handleDeleteMemo = () => {
    if (memos.length <= 1) {
      onNotification?.('🚨 لا يمكن حذف المخطط الأخير، يجب الاحتفاظ بمسودة واحدة على الأقل.');
      return;
    }
    const filtered = memos.filter((_, i) => i !== selectedMemoIndex);
    setMemos(filtered);
    setSelectedMemoIndex(0);
    setMemoForm({ ...filtered[0] });
    onNotification?.('تم سحب المذكرة التربوية من سجل التخطيط.');
  };

  // --- Sub-states for "الاخبار والتقويم" (Evaluations) ---
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([
    { id: 1, name: 'أحمد ياسين زرقان', gender: 'ذكر', class: 'السنة الخامسة أ', speedScore: 5.4, enduranceScore: 1150, flexScore: 6, behaviorScore: 5 },
    { id: 2, name: 'سارة مهدي بوعزة', gender: 'أنثى', class: 'السنة الخامسة أ', speedScore: 6.2, enduranceScore: 920, flexScore: 9, behaviorScore: 5 },
    { id: 3, name: 'رياض بن حديد', gender: 'ذكر', class: 'السنة الخامسة ب', speedScore: 5.1, enduranceScore: 1210, flexScore: 4, behaviorScore: 4 },
    { id: 4, name: 'آمال شوشاوي', gender: 'أنثى', class: 'السنة الرابعة أ', speedScore: 6.8, enduranceScore: 850, flexScore: 10, behaviorScore: 5 },
    { id: 5, name: 'عبد المنعم قواسمية', gender: 'ذكر', class: 'السنة الرابعة ب', speedScore: 5.8, enduranceScore: 1020, flexScore: -1, behaviorScore: 3 },
    { id: 6, name: 'وسيم بوقرة', gender: 'ذكر', class: 'السنة الخامسة أ', speedScore: 8.5, enduranceScore: 600, flexScore: -3, behaviorScore: 2 }, // Needs support!
    { id: 7, name: 'منال عيسى الباي', gender: 'أنثى', class: 'السنة الخامسة ب', speedScore: 5.9, enduranceScore: 980, flexScore: 8, behaviorScore: 5 }
  ]);

  const [newStudent, setNewStudent] = useState({
    name: '',
    gender: 'ذكر',
    class: 'السنة الخامسة أ',
    speedScore: 6.0,
    enduranceScore: 1000,
    flexScore: 5,
    behaviorScore: 5
  });
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);

  // Calculate PE Grade based on criteria
  const calculateGrade = (std: typeof students[0]) => {
    // Speed grade (Ideal < 5.5s gets 5 points, max 8.5s gets 1.5 pt)
    let speedGrade = 5 - (std.speedScore - 5.0) * 1.0;
    speedGrade = Math.max(1.5, Math.min(5, speedGrade));

    // Endurance yardage (Ideal > 1100m gets 5 points, < 700m gets 1.5 pt)
    let enduranceGrade = 1.5 + ((std.enduranceScore - 700) / 400) * 3.5;
    enduranceGrade = Math.max(1.5, Math.min(5, enduranceGrade));

    // Flexibility measure cm (Ideal > +7cm gets 5 points, negative stiffness gets 1.5 pt)
    let flexGrade = 2.5 + (std.flexScore / 5) * 2.5;
    flexGrade = Math.max(1.5, Math.min(5, flexGrade));

    // Total grade = Speed (5) + Endurance (5) + Flex (5) + Behavior (5) = Max 20 points
    const total = speedGrade + enduranceGrade + flexGrade + std.behaviorScore;
    return parseFloat(total.toFixed(2));
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim()) {
      onNotification?.('يرجى كتابة اسم التلميذ لتسجيله في بطاقة التقييم البدني.');
      return;
    }
    const student = {
      id: Date.now(),
      ...newStudent
    };
    setStudents([...students, student]);
    setNewStudent({
      name: '',
      gender: 'ذكر',
      class: 'السنة الخامسة أ',
      speedScore: 6.0,
      enduranceScore: 1000,
      flexScore: 5,
      behaviorScore: 5
    });
    setShowAddStudentForm(false);
    onNotification?.(`تم إدارج التلميذ(ة): "${student.name}" واحتساب نتائجه الحركية فوراً.`);
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(s => s.id !== id));
    onNotification?.('تم حذف التلميذ من قوائم رصد النتائج.');
  };

  // --- Sub-states for "تحميل الملفات" (File Upload) ---
  const [uploadedFiles, setUploadedFiles] = useState([
    { name: 'بيداغوجيا الجيل الثاني للأطوار الثلاث.pdf', size: '2.4 MB', date: '2026-06-01', provider: 'أستاذ المادة', status: 'مؤمن بمكافح الفيروسات' },
    { name: 'قوائم الحضور والرصد - الفوج الثالث.xlsx', size: '442 KB', date: '2026-06-11', provider: 'الإدارة المدرسية', status: 'محدث تلقائيا' },
    { name: 'جداول قياس اللياقة البدنية والنمو المعتمدة رسميا.pdf', size: '1.8 MB', date: '2026-05-15', provider: 'وزارة التربية', status: 'رسمي' }
  ]);
  const [dragActive, setDragActive] = useState(false);

  const handleMockUpload = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNotification?.('⚠️ يرجى اختيار ملف حقيقي من جهازك للتحميل.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        date: new Date().toISOString().split('T')[0],
        provider: 'تحميل شخصي',
        status: 'مرفوع رقمياً'
      };
      setUploadedFiles([newFile, ...uploadedFiles]);
      onNotification?.(`✅ تم رفع وحفظ الملف "${file.name}" بنجاح في خزنة الحقيبة!`);
    }
  };

  const handleFileDelete = (name: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f.name !== name));
    onNotification?.('تم إزالة الملف المحدد من خوادم الحقيبة المؤقتة.');
  };

  // Header quick stats
  const totalStudentsCount = students.length;
  const femaleCount = students.filter(s => s.gender === 'أنثى').length;
  const maleCount = students.filter(s => s.gender === 'ذكر').length;
  const alertStudentsCount = students.filter(s => calculateGrade(s) < 13).length;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans" dir="rtl">
      {/* Top Banner with Navigation */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-b-[2.5rem] shadow-2xl relative mb-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 shadow-inner">
              <Trophy className="text-emerald-300" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-black border border-emerald-500/20">
                  حساب بيداغوجي معتمد
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h1 className="text-xl font-black mt-1">بوابة أستاذ التربية البدنية والرياضية</h1>
              <p className="text-xs text-emerald-200 mt-0.5">الملف البيداغوجي المتكامل للتخطيط، الملاحظة والمحاكاة التكتيكية الفورية</p>
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

        {/* Dynamic Teacher Stats Bento Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-white/10 pt-6">
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-emerald-200 block font-semibold">المؤسسة التعليمية</span>
            <span className="text-xs font-extrabold text-white mt-1 block">ابتدائية ابن خلدون النموذجية</span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-emerald-200 block font-semibold">إجمالي التلاميذ المرصودين</span>
            <span className="text-sm font-black text-white mt-1 block flex items-center gap-1.5">
              <Users size={14} className="text-emerald-400" />
              {120 + totalStudentsCount} تلميذ(ة)
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-emerald-200 block font-semibold">المقاطع والمذكرات النشطة</span>
            <span className="text-sm font-black text-white mt-1 block">
              {memos.length} مذكرات معتمدة
            </span>
          </div>
          <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
            <span className="text-[10px] text-emerald-200 block font-semibold">تأمين الحصة والصحة</span>
            <span className="text-xs font-black text-emerald-300 mt-1 block flex items-center gap-1">
              <CheckCircle2 size={13} className="text-emerald-400" />
              شبكة الإسعافات نشطة 🟢
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Navigation Menu (no-print) */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mb-6 no-print">
        <div className="bg-white border border-slate-200/85 rounded-3xl p-3 shadow-xl shadow-slate-200/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 px-3 pb-3 mb-2.5 border-b border-rose-50/10">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block text-right">أقسام حقيبة الأستاذ (تبديل سريع):</span>
            <span className="text-[9px] text-slate-400 font-bold text-right md:text-left">تصفح بمرونة عبر الأقسام الأربعة للمحاكاة واللوائح والتحقق بلمسة واحدة</span>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'simulator' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <Activity size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">المحاكاة وتخطيط الملاعب</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">الرسوم التكتيكية</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'docs' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <FileText size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">الوثائق التربوية</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">السجلات والتشريعات</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('firstaid')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'firstaid' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <HeartHandshake size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">الإسعافات والسلامة</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">التقرير والتأمين</p>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('formation')}
              className={`text-right px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black flex items-center gap-1.5 sm:gap-2.5 transition duration-150 cursor-pointer ${
                activeTab === 'formation' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-600 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <GraduationCap size={14} className="shrink-0" />
              <div className="text-right flex-1 min-w-0">
                <span className="block truncate text-[9px] sm:text-[11px]">مركز التكوين والترسيم</span>
                <p className="text-[7px] sm:text-[8px] font-medium opacity-80 mt-0.5 truncate">امتحان التثبيت</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full">
        <div>
          <AnimatePresence mode="wait">

            {/* --- TAB: GAMES & SPORTS ACTIVITIES --- */}
            {activeTab === 'games' && (
              <motion.div
                key="games"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
                dir="rtl"
              >
                {/* Header card */}
                <div className="bg-gradient-to-r from-cyan-800 to-indigo-900 text-white rounded-3xl p-6 shadow-lg border border-cyan-800 relative overflow-hidden">
                  <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl"></div>
                  <div className="relative">
                    <div className="inline-flex items-center gap-1 bg-cyan-800 text-cyan-200 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-cyan-500/20 mb-2">
                      <Trophy size={11} className="text-amber-400 animate-pulse" />
                      مجموعة الرياضات والألعاب الحركية للابتدائي
                    </div>
                    <h2 className="text-xl font-black">دليل الألعاب والأنشطة البدنية والرياضية المتكامل 🏟️</h2>
                    <p className="text-xs text-cyan-100 leading-relaxed mt-1 font-medium max-w-2xl">
                      فضاء بيداغوجي شامل يضم سجل القوانين الأساسية للألعاب الجماعية بالابتدائي، مكتبة غنية من التمارين والألعاب التراثية الشعبية، بالإضافة إلى منشئ الأنشطة الشخصية للحقيبة.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Right side - 2 thirds: Rules & Activities Catalog */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Module 1: Sport Rules Specs */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-3 text-right">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <BookOpen className="text-cyan-600" size={17} />
                          سجل قوانين وأدلة الألعاب المدرسية الجماعية
                        </h3>
                        <p className="text-[10px] text-slate-400">انقر للتبديل واستعراض شروط تفاعل الحصة وتدابير السلامة الوزارية المعمول بها:</p>
                      </div>

                      {/* Rule selection tabs */}
                      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-2">
                        {['كرة اليد', 'كرة السلة', 'كرة القدم', 'ألعاب القوى'].map((item, idx) => {
                          const isSel = selectedSport === item;
                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                setSelectedSport(item);
                                onNotification?.(`تم تحميل قوانين رياضة: ${item}`);
                              }}
                              className={`text-[11px] px-3 py-1.5 rounded-xl font-bold transition duration-150 cursor-pointer ${
                                isSel ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>

                      {/* Specs display sheet */}
                      {(() => {
                        const sport = selectedSport || 'كرة اليد';
                        const specs: Record<string, any> = {
                          'كرة اليد': {
                            players: '5 لاعبين رسميين لكل فريق بالابتدائي بملعب مصغر ومغلق.',
                            ball: 'مقاس رقم 1 مريح خفيف وناعم لسلامة وقناعة الصغار.',
                            dimens: 'أبعاد الملعب المصغر: 20م طولاً x 12م عرضاً بتناغم الملاعب.',
                            rules: 'لا يجوز مس الكرة بالقدم، الحد الأقصى للجري بالكرة 3 خطوات، ولا يصح المسك لأكثر من 3 ثوانٍ.',
                            safety: 'توفير أحذية مانعة للانزلاق وبساط جانبي مرن، وفحص مثبتات قوائم المرمى بصفة مستمرة.'
                          },
                          'كرة السلة': {
                            players: '5 لاعبين في الميدان بالتصنيف الدراسي لضمان تكافؤ الفرص.',
                            ball: 'مقاس رقم 5 خفيف ومطاطي محكم اللمس والصناعة.',
                            dimens: 'أبعاد ساحة الدريب: 15م طولاً x 10م عرضاً بقواطع مرنة.',
                            rules: 'تنطيط الكرة (الطبّاعة) تتابعي أثناء الحركة، ويسجل دبل دريبل كمخالفة فورية تمنح الخصم الحيازة.',
                            safety: 'تجنب القفز المفرط على أسطح رملية صلبة، وتكسية القوائم برغوة مانعة للصدمات.'
                          },
                          'كرة القدم': {
                            players: '5 إلى 7 لاعبين بما يوافق تهيئة الأفواج داخل مساحات المدرسة المتاحة.',
                            ball: 'مقاس رقم 4 خفيف لسلامة الرأس وتخفيف قوة الارتداد بدقة.',
                            dimens: 'ملعب المدرسة المصغر أو الساحة المعبدة الخالية من العقبات.',
                            rules: 'تمنع العرقلة والنزلاق الأرضي حفاظاً على سلامة الصغار، وتلعب رميات التماس بكلتا اليدين بمهارة.',
                            safety: 'تنظيف كامل للأرضية والتأكد من عدم وجود حجارة أو وصلات حديدية ومراعاة درجة الحرارة.'
                          },
                          'ألعاب القوى': {
                            players: 'متسابقون انفراديون بمسارات متوازية أو بنظام التتابع الجماعي.',
                            ball: 'عصا تتابع جوفاء دائرية خفيفة من البلاستيك اللين أو الخيزران المأمون.',
                            dimens: 'مضمار جري مستقيم بأطوال 30م، 60م أو مسلك الوثب الطويل الممهد بالرمال المبللة.',
                            rules: 'الجري خطي فردي، ورمي الجلة أو الوثب يلتزم بشروط البدء بالصافرة دون خروج عن الرواق.',
                            safety: 'توفير بساط إسفنجي سميك للهبوط بالجمباز والوثب، والحفر ممتلئة برمال نقية وخفيفة.'
                          }
                        };
                        const currentSpec = specs[sport];
                        return (
                          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-2 text-right">
                            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-200/60 font-semibold font-sans">
                              <div><strong className="text-slate-500 block text-[10px] mb-0.5">عدد اللاعبين بالفريق:</strong> <span className="text-slate-800">{currentSpec.players}</span></div>
                              <div><strong className="text-slate-500 block text-[10px] mb-0.5">المواصفات الرياضية للأداة:</strong> <span className="text-slate-800">{currentSpec.ball}</span></div>
                            </div>
                            <div className="py-1 border-b border-slate-200/60 leading-relaxed font-semibold">
                              <strong className="text-slate-500 block text-[10px] mb-0.5">أبعاد ومقاسات الملاعب:</strong>
                              <span className="text-slate-850">{currentSpec.dimens}</span>
                            </div>
                            <div className="py-1 border-b border-slate-200/60 leading-relaxed font-semibold">
                              <strong className="text-slate-500 block text-[10px] mb-0.5 font-sans">أهم قوانين اللعبة ومخالفات التنفيذ:</strong>
                              <span className="text-slate-805">{currentSpec.rules}</span>
                            </div>
                            <div className="pt-1 text-[11px] leading-relaxed font-extrabold text-cyan-800">
                              <strong>🛡️ تدابير أمن ووقاية الصغار الميدانية ومطالبات المفتش:</strong> {currentSpec.safety}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Module 2: Classic Movement Activities catalog */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                      <div className="border-b border-slate-100 pb-2 flex justify-between items-center text-right">
                        <div>
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Trophy className="text-amber-500" size={17} />
                            بنك الألعاب والوضعيات الحركية المعتمدة بالحقيبة
                          </h3>
                          <p className="text-[10px] text-slate-400">تصفح سجل الوضعيات والألعاب الميدانية لتطبيقها الفوري للفوج:</p>
                        </div>
                        <span className="text-[10px] bg-slate-150 font-black px-2.5 py-1 rounded-lg text-slate-700">
                          {3 + customGames.length} وضعيات
                        </span>
                      </div>

                      {/* Predefined Games Deck */}
                      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                        {[
                          {
                            name: 'سباق التتابع والسرعة (Athletics)',
                            grade: 'الطور الثاني والثالث ابتدائي',
                            objective: 'تنمية السرعة الانفجارية والتوافق الحركي ونقل عصا التتابع بسلام.',
                            duration: '20 دقيقة',
                            materials: 'خطوط الركض ومضمار أملس، عصا تتابع دائرية آمنة، صافرة التوقيت وبطاقات.',
                            description: 'يجري التلميذ بأقصى سرعة لمسافة 30 متراً ثم يسلم العصا لزميله بمهارة داخل منطقة التسليم دون رميها.'
                          },
                          {
                            name: 'تحدي الحجل والتوازن الجماعي الخلالي',
                            grade: 'الطور الأول ابتدائي',
                            objective: 'تحسين التوازن الديناميكي وتقوية العضلات الباسطة للأطراف السفلية.',
                            duration: '15 دقيقة',
                            materials: 'أطواق ملونة متباعدة بـ 50 سم، صحون رياضية ملونة وقابلة للارتكاز.',
                            description: 'الحجل المتتابع على قدم واحدة بشكل زجزاجي عبر الأطواق، والهبوط الآمن بكلا القدمين عند خط النهاية.'
                          },
                          {
                            name: 'الألعاب التراثية الشعبية - لعبة "المرقد" التفاعلية الحيوية',
                            grade: 'جميع المستويات بالطور الابتدائي',
                            objective: 'تنمية قوة الملاحظة، الاستجابة السريعة للمؤثرات الصوتية والتموقع السليم.',
                            duration: '20 دقيقة',
                            materials: 'لا يتطلب أدوات خاصة، ساحة مدرسة مهيأة وخالية من المعوقات.',
                            description: 'لعبة وطنية تراثية غنية تجمع التنافس، حيث ينتظر المتعلم إشارة الأستاذ بالصافرة للنهوض السريع والجري لتفادي المطاردة.'
                          },
                          ...customGames
                        ].map((game, i) => (
                          <div key={i} className="p-4 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-2 text-right hover:border-cyan-400 hover:bg-slate-50/80 transition duration-150 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1 bg-cyan-500 h-full" />
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-black text-slate-900">{game.name}</h4>
                              <span className="text-[9px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded-full shrink-0">
                                {game.grade}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                              <strong>الهدف البيداغوجي:</strong> {game.objective}
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold block">
                              <strong>طبيعة ومراحل تسيير النشاط:</strong> {game.description}
                            </p>
                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold pt-2 border-t border-slate-200/60">
                              <span>⏱️ مدة النشاط: {game.duration}</span>
                              <span>📦 التجهيزات المطلوبة: {game.materials}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Left side: Game Creator Form */}
                  <div className="lg:col-span-12 xl:col-span-5">
                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-right">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                          <PlusCircle className="text-cyan-600" size={18} />
                          مبتكر الأنشطة والألعاب الرياضية المخصصة ✍️
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold">صمم ووثّق لعبة حركية بيداغوجية لتخزينها الفوري بنظام الملف الحركي:</p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-650 mb-1">اسم النشاط أو اللعبة الحركية:</label>
                          <input
                            type="text"
                            placeholder="مثال: سباق تفادي الأقماع السداسي"
                            value={newGameName}
                            onChange={(e) => setNewGameName(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-650 mb-1">المستوى والطور المستهدف:</label>
                            <select
                              value={newGameGrade}
                              onChange={(e) => setNewGameGrade(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-cyan-500 font-bold"
                            >
                              <option value="الطور الأول ابتدائي">الطور الأول ابتدائي</option>
                              <option value="الطور الثاني ابتدائي">الطور الثاني ابتدائي</option>
                              <option value="الطور الثالث ابتدائي">الطور الثالث ابتدائي</option>
                              <option value="جميع مستويات الابتدائي">جميع مستويات الابتدائي</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-slate-650 mb-1">المدة التقديرية للعب:</label>
                            <input
                              type="text"
                              placeholder="مثال: 15 دقيقة"
                              value={newGameDuration}
                              onChange={(e) => setNewGameDuration(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-semibold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-650 mb-1">الأهداف والقدرات البدنية المستهدفة:</label>
                          <textarea
                            rows={2}
                            placeholder="مثال: تنمية مهارة المرونة الفردية والارتقاء السليم وحفظ توازن الحركات البدنية"
                            value={newGameObjective}
                            onChange={(e) => setNewGameObjective(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-semibold resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-650 mb-1">التجهيزات والمعدات الرياضية المطلوبة:</label>
                          <input
                            type="text"
                            placeholder="مثال: أقماع ملونة، أطواق مسطحة، ربطات حاصرة للأيدي"
                            value={newGameMaterials}
                            onChange={(e) => setNewGameMaterials(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-slate-650 mb-1">طبيعة ومراحل وخطوات تسيير النشاط:</label>
                          <textarea
                            rows={3}
                            placeholder="اكتب بالتفصيل خطوات اللعب، حركات التلاميذ وكيفية احتساب النقاط..."
                            value={newGameDesc}
                            onChange={(e) => setNewGameDesc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-250 rounded-xl p-3 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:border-cyan-500 font-semibold resize-none"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (!newGameName.trim() || !newGameObjective.trim() || !newGameDesc.trim()) {
                              onNotification?.('⚠️ يرجى تعبئة اسم النشاط والهدف ومجريات اللعب أولاً لقيد الرياضة.');
                              return;
                            }
                            const addedGame = {
                              name: newGameName,
                              grade: newGameGrade,
                              objective: newGameObjective,
                              duration: newGameDuration,
                              materials: newGameMaterials || 'أدوات بدنية بسيطة',
                              description: newGameDesc
                            };
                            setCustomGames([addedGame, ...customGames]);
                            setNewGameName('');
                            setNewGameObjective('');
                            setNewGameMaterials('');
                            setNewGameDesc('');
                            onNotification?.(`✅ تم بنجاح ابتكار قيد اللعبة الرياضية: "${newGameName}" بالحقيبة!`);
                          }}
                          className="w-full bg-gradient-to-l from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs py-3 rounded-xl shadow-md duration-150 transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <PlusCircle size={15} />
                          حفظ وإدراج اللعبة بالمنصة
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB: FORMATION LOG --- */}
            {activeTab === 'formation' && (
              <motion.div
                key="formation"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <FormationLog onNotification={onNotification} />
              </motion.div>
            )}

            {/* --- TAB: DOCUMENTS --- */}
            {activeTab === 'docs' && (
              <motion.div
                key="docs"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <DocumentLibrary onNotification={onNotification} />
              </motion.div>
            )}

            {/* --- TAB: FIRST AID --- */}
            {activeTab === 'firstaid' && (
              <motion.div
                key="firstaid"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
              >
                <FirstAidManager onNotification={onNotification} />
              </motion.div>
            )}

            {/* --- TAB: PLAYGROUND SIMULATOR --- */}
            {activeTab === 'simulator' && (
              <motion.div
                key="simulator"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm"
              >
                <div className="mb-4">
                  <h2 className="text-lg font-black text-slate-900">محاكي الملاعب والأنشطة الرياضية الذكي</h2>
                  <p className="text-[11px] text-slate-500 font-bold mt-0.5">خطط الوضعيات والتشكيلات التكتيكية للأفواج برسم ديناميكي وتمرير مباشر للكرة.</p>
                </div>
                <FieldSimulator onNotification={onNotification} />
              </motion.div>
            )}

            {/* --- TAB: MEMORANDUM (LESSON PLANNER) --- */}
            {activeTab === 'memos' && (
              <motion.div
                key="memos"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Print layout of current selected memo */}
                <div className="print-only bg-white p-8 border-2 border-slate-700 text-slate-900 leading-relaxed rounded-lg">
                  <div className="text-center font-bold border-b-2 border-slate-800 pb-4 mb-4">
                    <p className="text-sm">الجمهورية الجزائرية الديمقراطية الشعبية</p>
                    <p className="text-sm">وزارة التربية الوطنية - مديرية التربية لولاية الجزائر</p>
                    <p className="text-base font-black mt-2">البطاقة التربوية والبيداغوجية الرسمية للحصة الرياضية</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs mb-4 font-bold">
                    <div>المؤسسة: ابتدائية ابن خلدون النموذجية</div>
                    <div>المستوى: {memos[selectedMemoIndex]?.level}</div>
                    <div>الموسم الدراسي: 2025 / 2026</div>
                    <div>الأستاذ المعد: مراد بوعلاق</div>
                  </div>
                  <div className="border border-slate-800 p-3 mb-4 rounded">
                    <h3 className="font-black text-sm mb-1">عنوان الحصة / الموضوع:</h3>
                    <p className="text-xs">{memos[selectedMemoIndex]?.title}</p>
                  </div>
                  <div className="border border-slate-800 p-3 mb-4 rounded bg-slate-50">
                    <h3 className="font-black text-xs mb-1">الكفاءة المستهدفة والمقاصد التعلمية:</h3>
                    <p className="text-xs leading-relaxed">{memos[selectedMemoIndex]?.objective}</p>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="border border-slate-600 p-2.5 rounded">
                      <strong>1. المرحلة التمهيدية (الإحماء والتحضير):</strong>
                      <p className="mt-1">{memos[selectedMemoIndex]?.part1}</p>
                    </div>
                    <div className="border border-slate-600 p-2.5 rounded">
                      <strong>2. المرحلة الرئيسية (التطبيق المهارى والتعلم):</strong>
                      <p className="mt-1">{memos[selectedMemoIndex]?.part2}</p>
                    </div>
                    <div className="border border-slate-600 p-2.5 rounded">
                      <strong>3. المرحلة الختامية (الارتخاء والتقييم):</strong>
                      <p className="mt-1">{memos[selectedMemoIndex]?.part3}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm no-print">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <ClipboardList className="text-emerald-600" />
                        صانع وموثق المذكرات اليومية وحصص التعلم
                      </h2>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">صمم، حدّث، واطبع مذكراتك الرياضية حسب مناهج الجيل الثاني للابتدائي في لحظات.</p>
                    </div>
                    <button
                      onClick={handleCreateMemo}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-md transition duration-150 cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      إضافة مذكرة جديدة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Left List Pane */}
                    <div className="md:col-span-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl max-h-[450px] overflow-y-auto space-y-2">
                      <span className="text-[9px] font-black text-slate-400 block px-2 leading-tight">المسودات والمذكرات المحفوظة ({memos.length}):</span>
                      {memos.map((memo, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedMemoIndex(idx);
                            setMemoForm({ ...memo });
                            setIsEditingMemo(false);
                          }}
                          className={`p-3 rounded-xl border-2 text-right cursor-pointer transition ${
                            selectedMemoIndex === idx 
                              ? 'bg-emerald-50 border-emerald-500' 
                              : 'bg-white border-transparent hover:border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] bg-emerald-100/50 text-emerald-800 px-2 py-0.5 rounded-md font-bold block w-fit mb-1">{memo.level}</span>
                          <h4 className="text-xs font-black text-slate-800 line-clamp-1">{memo.title}</h4>
                          <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1 leading-relaxed">{memo.objective}</p>
                        </div>
                      ))}
                    </div>

                    {/* Right Details View */}
                    <div className="md:col-span-2 border border-slate-200 rounded-2xl p-4 min-h-[400px] flex flex-col justify-between" id="memo-details">
                      {!isEditingMemo ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-extrabold px-3 py-1 rounded-full">
                                {memos[selectedMemoIndex]?.level}
                              </span>
                              <h3 className="text-base font-black text-slate-900 mt-2.5">{memos[selectedMemoIndex]?.title}</h3>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() => {
                                  setMemoForm({ ...memos[selectedMemoIndex] });
                                  setIsEditingMemo(true);
                                }}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-700 rounded-lg text-xs font-bold transition duration-150 tooltip"
                                title="تعديل المذكرة"
                              >
                                ✏️ تعديل
                              </button>
                              <button
                                onClick={() => window.print()}
                                className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1"
                                title="طباعة رسمية بطابع أفق A4"
                              >
                                <Printer size={13} />
                                طباعة
                              </button>
                              <button
                                onClick={handleDeleteMemo}
                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition duration-150"
                                title="سحب المخطط"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-dashed border-slate-100 pt-3 space-y-3 text-xs leading-relaxed">
                            <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-50/50">
                              <strong className="text-emerald-950 font-black block mb-1">🎯 الهدف والغاية التعلمية لحصة المادة:</strong>
                              <p className="text-slate-700 font-medium">{memos[selectedMemoIndex]?.objective}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <strong className="text-slate-800 font-black block mb-1">⏱️ جزء أول: مرحلة التمهيد والإحماء (10 دقائق):</strong>
                              <p className="text-slate-600 font-medium">{memos[selectedMemoIndex]?.part1}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <strong className="text-slate-800 font-black block mb-1">⏱️ جزء ثانٍ: مرحلة التطبيق الرئيسي (25 دقيقة):</strong>
                              <p className="text-slate-600 font-medium">{memos[selectedMemoIndex]?.part2}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <strong className="text-slate-800 font-black block mb-1">⏱️ جزء ثالث: الهدوء والتحليل الختامي (10 دقائق):</strong>
                              <p className="text-slate-600 font-medium">{memos[selectedMemoIndex]?.part3}</p>
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 flex justify-between">
                            <span>📅 الموسم الدراسي الحالي: {memos[selectedMemoIndex]?.schoolYear}</span>
                            <span>👤 بموافقة المفتش البيداغوجي: {memos[selectedMemoIndex]?.inspector}</span>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleUpdateMemo} className="space-y-3.5 text-right">
                          <h4 className="text-xs font-black text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
                            <span>✏️ تعديل صياغة المخطط التربوي الحالي:</span>
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">المستوى التعليمي:</label>
                              <input
                                type="text"
                                required
                                value={memoForm.level}
                                onChange={(e) => setMemoForm({ ...memoForm, level: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">عنوان موضوع الحصة:</label>
                              <input
                                type="text"
                                required
                                value={memoForm.title}
                                onChange={(e) => setMemoForm({ ...memoForm, title: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">الغاية العامة والكفاءة البيداغوجية المستهدفة:</label>
                            <textarea
                              rows={2}
                              required
                              value={memoForm.objective}
                              onChange={(e) => setMemoForm({ ...memoForm, objective: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">تفاصيل مرحلة الإحماء والتهيئة (10 دقائق):</label>
                            <textarea
                              rows={2}
                              required
                              value={memoForm.part1}
                              onChange={(e) => setMemoForm({ ...memoForm, part1: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">تفاصيل المحتوى الحركي والنشاط الرئيسي (25 دقيقة):</label>
                            <textarea
                              rows={2}
                              required
                              value={memoForm.part2}
                              onChange={(e) => setMemoForm({ ...memoForm, part2: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">تفاصيل مرحلة استخلاص النتائج والتهدئة (10 دقائق):</label>
                            <textarea
                              rows={2}
                              required
                              value={memoForm.part3}
                              onChange={(e) => setMemoForm({ ...memoForm, part3: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:bg-white"
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                            <button
                              type="button"
                              onClick={() => setIsEditingMemo(false)}
                              className="px-3 py-1.5 bg-slate-100 font-bold rounded-lg text-slate-600 hover:bg-slate-200"
                            >
                              إلغاء
                            </button>
                            <button
                              type="submit"
                              className="px-3.5 py-1.5 bg-emerald-600 font-bold text-white rounded-lg hover:bg-emerald-700"
                            >
                              حفظ بطاقة المذكرة
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB: TESTS & EVALUATION --- */}
            {activeTab === 'evals' && (
              <motion.div
                key="evals"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-600" />
                        سجل تقييم ورصد كشوف النقاط الحركية
                      </h2>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">رصد آلي وتلقائي للمؤشرات البدنية: سرعة 30م، الجري المستمر 6د، والمرونة بالـ cm.</p>
                    </div>

                    <button
                      onClick={() => setShowAddStudentForm(!showAddStudentForm)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-md transition duration-150 cursor-pointer"
                    >
                      <PlusCircle size={15} />
                      {showAddStudentForm ? 'إخفاء نموذج التسجيل' : 'تسجيل قياس لتلميذ جديد'}
                    </button>
                  </div>

                  {/* Add Student Form */}
                  {showAddStudentForm && (
                    <form onSubmit={handleAddStudent} className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl mb-5 text-right animate-fadeIn">
                      <h3 className="text-xs font-black text-slate-800 mb-3 block">➕ إدخال تلميذ جديد ورصد مهاراته البدنية:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">الاسم الكامل للتلميذ(ة):</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: يوسف بكار"
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">الجنس:</label>
                          <select
                            value={newStudent.gender}
                            onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            <option value="ذكر">ذكر</option>
                            <option value="أنثى">أنثى</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">الفوج التربوي والصف:</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: السنة الرابعة أ"
                            value={newStudent.class}
                            onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">سرعة 30م (ثواني):</label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={newStudent.speedScore}
                            onChange={(e) => setNewStudent({ ...newStudent, speedScore: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">تحمل الجري 6 د (أمتار):</label>
                          <input
                            type="number"
                            step="10"
                            required
                            value={newStudent.enduranceScore}
                            onChange={(e) => setNewStudent({ ...newStudent, enduranceScore: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-550 mb-1">المرونة البدنية بـ cm (+/-):</label>
                          <input
                            type="number"
                            required
                            value={newStudent.flexScore}
                            onChange={(e) => setNewStudent({ ...newStudent, flexScore: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">السلوك وارتداء البذلة (/5):</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            required
                            value={newStudent.behaviorScore}
                            onChange={(e) => setNewStudent({ ...newStudent, behaviorScore: parseInt(e.target.value) || 5 })}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-2 border-t">
                        <button
                          type="button"
                          onClick={() => setShowAddStudentForm(false)}
                          className="px-4 py-2 bg-slate-200 font-bold text-slate-700 rounded-lg"
                        >
                          إلغاء التراجع
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 font-bold text-white rounded-lg hover:bg-emerald-700"
                        >
                          تخزين رصد الدرجات
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Criteria info alert panel */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs font-bold font-sans">
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-600 text-white text-[10px]">1</span>
                      <span className="text-slate-700 leading-tight">معايير الوزارة المعتمدة: مجموع مؤشر السرعة القصوى والتحمل.</span>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-emerald-600 text-white text-[10px]">2</span>
                      <span className="text-slate-700 leading-tight">سلوك التلميذ، والروح الرياضية تسهم بـ 5 نقاط مباشرة.</span>
                    </div>
                    <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={15} className="text-rose-600" />
                      <span className="text-rose-800 leading-tight">يتم رصد {alertStudentsCount} متعلم(ة) متأخرين حركياً للمعالجة البيداغوجية.</span>
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="mb-4 relative">
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="ابحث عن تلميذ بالاسم أو الفوج..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Student Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner bg-slate-50/50">
                    <table className="w-full text-right border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="p-3 text-right">الاسم واللقب</th>
                          <th className="p-3 text-center">الفوج الدراسي</th>
                          <th className="p-3 text-center">اختبار سرعة 30م</th>
                          <th className="p-3 text-center">اختبار الجري 6دد</th>
                          <th className="p-3 text-center">المرونة بالـ (cm)</th>
                          <th className="p-3 text-center">الانضباط البذلة /5</th>
                          <th className="p-3 text-center">المعدل الإجمالي /20</th>
                          <th className="p-3 text-center">الحالة الإحصائية</th>
                          <th className="p-3 text-center">العمليات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students
                          .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.class.includes(studentSearch))
                          .map((std) => {
                            const avgGrade = calculateGrade(std);
                            const needsSupport = avgGrade < 13;
                            return (
                              <tr key={std.id} className="border-b border-slate-100 hover:bg-white transition font-medium">
                                <td className="p-3 font-extrabold text-slate-800 flex items-center gap-2">
                                  <span className={`block h-2 w-2 rounded-full ${std.gender === 'ذكر' ? 'bg-blue-400' : 'bg-pink-400'}`} />
                                  {std.name}
                                </td>
                                <td className="p-3 text-center text-slate-500 font-bold">{std.class}</td>
                                <td className="p-3 text-center text-slate-600 font-mono font-bold">{std.speedScore} ثانية</td>
                                <td className="p-3 text-center text-slate-600 font-mono font-bold">{std.enduranceScore} م</td>
                                <td className="p-3 text-center text-slate-600 font-mono font-bold">{std.flexScore >= 0 ? `+${std.flexScore}` : std.flexScore} سم</td>
                                <td className="p-3 text-center text-slate-600 font-mono font-bold">{std.behaviorScore} ن</td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-1 rounded-lg text-xs font-black font-mono ${
                                    avgGrade >= 17 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                                    avgGrade >= 14 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    needsSupport ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-slate-50 text-slate-700'
                                  }`}>
                                    {avgGrade} / 20
                                  </span>
                                </td>
                                <td className="p-3 text-center font-bold">
                                  {needsSupport ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                      🚨 بحاجة لمعالجة حركية
                                    </span>
                                  ) : avgGrade >= 16.5 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                      ⭐ موهبة رياضية
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      ✅ متوافق وممتاز
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteStudent(std.id)}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition duration-150"
                                    title="حذف السجل"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* --- TAB: FILE UPLOADS --- */}
            {activeTab === 'uploads' && (
              <motion.div
                key="uploads"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                  <div className="flex flex-col gap-1 border-b border-slate-100 pb-4 mb-5 text-right">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <UploadCloud className="text-emerald-600" />
                      مركز رفع، حفظ ومشاركة ملفات الحصص الرقمية
                    </h2>
                    <p className="text-xs text-slate-500 font-bold">يمكن للأستاذ رفع مذكرات معدلة بصيغة Word، جداول Excel للغيابات، أو ملفات المنشورات الوزارية.</p>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        const file = e.dataTransfer.files[0];
                        const newFile = {
                          name: file.name,
                          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
                          date: new Date().toISOString().split('T')[0],
                          provider: 'تحميل إسقاط يدوي',
                          status: 'مرفوع رقمياً'
                        };
                        setUploadedFiles([newFile, ...uploadedFiles]);
                        onNotification?.(`✅ تم إسقاط ومزامنة الملف "${file.name}" بالحقيبة!`);
                      }
                    }}
                    className={`border-3 border-dashed rounded-2xl p-8 text-center transition duration-150 flex flex-col items-center justify-center cursor-pointer ${
                      dragActive ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-500 bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="pe-doc-uploader"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="pe-doc-uploader" className="cursor-pointer flex flex-col items-center justify-center">
                      <UploadCloud size={48} className="text-slate-400 mb-3 animate-bounce" />
                      <p className="text-xs font-black text-slate-800">اسحب الملفات وأفلتها هنا للمزامنة، أو تصفح ملفات جهازك</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">تنسيقات مقبولة: PDF, Docx, xlsx, Pptx (الحد الأقصى 15MB)</p>
                      <span className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-md transition">
                        تصفح جهاز الكمبيوتر الخاص بك
                      </span>
                    </label>
                  </div>

                  {/* Upload List */}
                  <div className="mt-8">
                    <span className="text-xs font-black text-slate-700 block mb-3 text-right">سجل ملفاتك الرقمية المصنفة بالحقيبة:</span>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs hover:shadow-md transition">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl font-bold">
                              📄
                            </div>
                            <div className="text-right">
                              <h4 className="font-extrabold text-slate-800 line-clamp-1">{file.name}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">الحجم: {file.size} • تاريخ الرفع: {file.date} • المصدر: {file.provider}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full border border-emerald-200/50 font-bold block">
                              {file.status} 🟢
                            </span>
                            <button
                              onClick={() => onNotification?.(`جاري تنزيل الملف المساعد: ${file.name}`)}
                              className="p-2 hover:bg-slate-250 text-slate-600 rounded-lg transition"
                              title="تنزيل الملف"
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => handleFileDelete(file.name)}
                              className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                              title="إزالة المستند"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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
