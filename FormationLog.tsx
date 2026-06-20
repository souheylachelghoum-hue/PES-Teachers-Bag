import { useEffect, useState } from "react";
import { db } from "../App";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { 
  Award, 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ClipboardList, 
  UserCheck, 
  GraduationCap, 
  RefreshCw 
} from 'lucide-react';

interface FormationLogProps {
  onNotification?: (msg: string) => void;
}

export default function FormationLog({ onNotification }: FormationLogProps) {
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Checklist for teacher registration portfolio (امتحان الترسيم الشامل)
  const defaultChecklist = [
    { id: 'daily_notebook', label: 'الدفتر اليومي لإعداد وتحضير الحصص البدنية (محدث ومكتوب)', category: 'بيداغوجي' },
    { id: 'yearly_progress', label: 'تدرج التعلمات السنوي والمخططات الشهرية المعتمدة والموقعة', category: 'بيداغوجي' },
    { id: 'medical_records', label: 'قائمة ومحاضر الفحوص الطبية والصدرية والبدنية الملزمة للمتعلمين', category: 'طبي/وقائي' },
    { id: 'absences_book', label: 'سجل رصد الغيابات والتنقيط المستمر للفروع والأنشطة البدنية', category: 'إداري' },
    { id: 'class_list', label: 'القوائم المرجعية الاسمية لجميع الفواج التعليمية الرياضية والبدنية', category: 'إداري' },
    { id: 'national_curriculum', label: 'منهاج وزارة التربية والتعليم الوطنية والوثيقة المرافقة له لعام 2026', category: 'بيداغوجي' },
    { id: 'school_legislation_brief', label: 'ملخص التشريع المدرسي وحقوق وواجبات أستاذ الوظيفة العمومية', category: 'تشريعي' },
  ];

  const [checklist, setChecklist] = useState<{ id: string; label: string; category: string; checked: boolean }[]>([]);

  // Expandable Questions and Answers (Oral part of the exam with inspector)
  const oralQuestions = [
    {
      id: 1,
      q: "ما هي الوضعية البيداغوجية السليمة للأستاذ أثناء تقديم وتسيير الحصة الميدانية؟",
      a: "يجب على الأستاذ المتمكن إبقاء جميع التلاميذ تحت مجاله البصري طوال الوقت، متفادياً الوقوف بوضعية تعطي ظهره للفوج. كما يتنقل مرناً على جوانب الملعب لتسجيل التدخلات والملاحظات وصناعة التوجيه الجماعي والفردي الكفء."
    },
    {
      id: 2,
      q: "كيف تحضر وتحافظ على أجهزة الميدان لتفادي الحوادث المدرسية الرياضية؟",
      a: "يفحص الأستاذ بشكل أسبوعي وصلات الكرات، تثبيت المرامي، أغطية الحفر، وسلامة أقماع وصحون التدريب. كما يحظر على المتعلمين اللعب قبل الفحص الدقيق والتهيئة الأمنية للميدان من قبل المكلف بالمادة."
    },
    {
      id: 3,
      q: "ما هي المراحل الثلاث الأساسية لبناء مذكرة بيداغوجية نموذجية للتربية البدنية؟",
      a: "تشمل المذكرة: 1. الجزء الإعدادي (المقدمة بالتسخين الروتيني الشامل والجري المتدرج)، 2. الجزء الرئيسي (سلسلة الأنشطة والتعلمات التكتيكية المستهدفة مثل التمرير والتسديد والمنافسة البيداغوجية)، 3. الجزء الختامي (الرجوع للهدوء وتخفيف شدّة النبض مع التقييم الختامي)."
    },
    {
      id: 4,
      q: "ماذا تفعل كأستاذ فوراً وفي الدقائق الأولى إذا سقط متعلم وأصيب بنزيف أو التواء مفاجئ؟",
      a: "أوقف النشاط مباشرة لتوفير الأمن والسكينة، وقم بالإسعاف الأولي المناسب (مثال: الضغط المكتمل للنزف أو تبريد موضع الالتواء بالثلج). ثم أرسل تلميذاً لإعلام الإدارة، ووثّق الواقعة لصياغة تقرير حادث رسمي في الأجل القانوني."
    },
    {
      id: 5,
      q: "ما هو جوهر تقييم أداء التلاميذ وما هي الأدوات البيداغوجية لتقدير الفروق الفردية؟",
      a: "التقييم ليس تنقيطاً كمياً بل رصد مستمر للكفاءة الحركية، التطور الوجداني، وروح التشارك الجماعي. يستخدم الأستاذ شبكة تقييم الأداء المهارية، وعقود التقييم الذاتي المعتمدة في المناهج الرقمية الحديثة."
    }
  ];

  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  // Mock Practice Exam Quiz
  const mockQuiz = [
    {
      id: 1,
      q: "وفقاً للتشريع المدرسي، في حال وقوع حادث بيداغوجي للتلميذ داخل الحصة البدنية، ما هو الأجل القانوني لتقديم تقرير الحادث للإدارة؟",
      options: [
        "خلال 24 ساعة كحد أقصى",
        "خلال 48 ساعة كحد أقصى مع التقارير الطبية والمحاضر",
        "خلال أسبوع من وقوع الحادث",
        "ليس له أجل محدد شرط إعلام الولي"
      ],
      correct: 1,
      explanation: "الأجل القانوني الأقصى لرفع تقرير حوادث التلاميذ المدرسية هو 48 ساعة طبثاً للنظام الداخلي والتشريع الرسمي للمؤسسة التعليمية."
    },
    {
      id: 2,
      q: "ما هو الفوق الطبي الفصلي الذي يتوجب على تلميذ معفى من التربية البدنية تقديمه للأستاذ؟",
      options: [
        "طلب خطي عادي مدعوم بولي الأمر",
        "شهادة إعفاء طبي رسمية موقعة من طبيب الصحة المدرسية أو وحدة الكشف",
        "مستند فني من طبيب عام غير مرخص",
        "إعفاء شفوي من مدير المؤسسة"
      ],
      correct: 1,
      explanation: "يجب تقديم شهادة طبية نموذجية ومصادق عليها من طبيب الصحة المدرسية أو الكشف لتأصيل الملف القانوني للمعفى وحصر غيابه بدقة."
    },
    {
      id: 3,
      q: "يقصد بـ 'البيداغوجيا الفارقية' في حصة التربية البدنية والرياضية:",
      options: [
        "تصنيف المتعلمين إلى متميزين وضعفاء ومعاملتهم على هذا الأساس طول السنة",
        "تكييف الوضعيات والأنشطة البدنية لتناسب الفروق الفردية والقدرات الحركية لكل متعلم",
        "التركيز الحصري على النخبة الرياضية في المدارس لإشعاع الفوج",
        "إعفاء ذوي الاحتياجات الخاصة من أي نشاط أو اندماج بدني"
      ],
      correct: 1,
      explanation: "البيداغوجيا الفارقية تؤصل لإشراك كافة الطلاب بمختلف كفاءاتهم المورفولوجية والبدنية عبر وضعيات بيداغوجية مكيفة ووسائل تيسير تدريجية."
    },
    {
      id: 4,
      q: "ما هي الخطوة السليمة لضبط انتباه الفوج قبل الشروع في الشرح الفني للعبة تكتيكية؟",
      options: [
        "الشرح والتلاميذ يجرون خلف الكرة في الميدان",
        "جمع التلاميذ في وضعية نصف دائرية (الهلال) والأستاذ في المركز مستقبلاً الشمس من الخلف",
        "توزيعهم في زوايا الملعب البعيدة والصراخ بقوة لإملائهم التوجيهات",
        "البدء الفوري في اللعب دون أي شرح مسبق"
      ],
      correct: 1,
      explanation: "تجميع المتعلمين بشكل نصف دائري يضمن للمفتش والمكلف بالملاحظة أن جميع العناصر تشاهد ملامح وجه الأستاذ بوضوح، مع ضمان عدم مواجهة الطلاب لقرص الشمس تفادياً للتشتيت البصري."
    }
  ];

  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Initialize and load persisted checklist from local storage
  useEffect(() => {
    const saved = localStorage.getItem('pem_registration_checklist_2026');
    if (saved) {
      try {
        setChecklist(JSON.parse(saved));
      } catch (e) {
        setChecklist(defaultChecklist.map(item => ({ ...item, checked: false })));
      }
    } else {
      setChecklist(defaultChecklist.map(item => ({ ...item, checked: false })));
    }
    fetchItems();
  }, []);

  const handleCheckToggle = (id: string) => {
    const updated = checklist.map(item => {
      if (item.id === id) {
        const nextState = !item.checked;
        if (nextState) {
          onNotification?.(`✅ تم تحديد مستند الترسيم: "${item.label}" كجاهز ومحضر.`);
        }
        return { ...item, checked: nextState };
      }
      return item;
    });
    setChecklist(updated);
    localStorage.setItem('pem_registration_checklist_2026', JSON.stringify(updated));
  };

  const handleResetChecklist = () => {
    const reset = defaultChecklist.map(item => ({ ...item, checked: false }));
    setChecklist(reset);
    localStorage.setItem('pem_registration_checklist_2026', JSON.stringify(reset));
    onNotification?.('🔄 تم تصفير وإعادة تعيين قائمة تفقد ملف الترسيم للمستوى صفر.');
  };

  const addItem = async () => {
    if (!title || !url) {
      alert("يرجى إدخال اسم المستند والترسيم ورابط المعاينة.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "all_training_data"), { 
        title, 
        url: url.startsWith('http') ? url : `https://${url}`,
        createdAt: Date.now()
      });
      setTitle(""); 
      setUrl("");
      onNotification?.(`📚 تمت إضافة ملف تكوين مخصص: "${title}" إلى لوحة مركز التكوين.`);
      fetchItems();
    } catch (e) {
      console.error("خطأ في الإضافة: ", e);
      alert("حدث خطأ أثناء الاتصال بقاعدة البيانات. سيتم التكرار.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "all_training_data"));
      setItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("خطأ في الجلب: ", e);
    }
  };

  const handleDeleteItem = async (id: string, itemTitle: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف السند "${itemTitle}" نهائياً من مركز التكوين؟`)) {
      try {
        await deleteDoc(doc(db, "all_training_data", id));
        onNotification?.(`🗑️ تم إزالة السند من قاعدة البيانات بنجاح.`);
        fetchItems();
      } catch (e) {
        console.error("خطأ في الحذف: ", e);
      }
    }
  };

  const handleQuizSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    mockQuiz.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score += 1;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    onNotification?.(`📊 أكملت الاختبار الفوري للتثبيت بمعدل: ${score} من أصل ${mockQuiz.length} صحيحة!`);
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    onNotification?.('🔄 تم تصفير أسئلة الاختبار لإعادة المحاولة من جديد.');
  };

  const completedCount = checklist.filter(c => c.checked).length;
  const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn" dir="rtl">
      
      {/* Prime Header Card */}
      <div className="bg-gradient-to-r from-purple-905 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-purple-800">
        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 bg-purple-800/60 text-purple-200 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-purple-700/60">
              <GraduationCap size={12} />
              البوابة المهنية للأستاذ المتربص 2026/2027
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-100 via-indigo-200 to-white">
              مركز التكوين الشامل وتحضير امتحان الترسيم
            </h1>
            <p className="text-xs text-purple-200 max-w-2xl font-medium leading-relaxed">
              فضاء متكامل مصمم خصيصاً لمرافقة الأساتذة المتكونين في مسارهم البيداغوجي وتسهيل اجتياز امتحان الترسيم والتثبيت الرسمي بنجاح من خلال استعراض دليل الوثائق والملفات الشاملة.
            </p>
          </div>

          <div className="shrink-0 w-full md:w-auto">
            <a
              href="https://drive.google.com/file/d/19hTWKybYF66YWjkujL80uWLJrfqMr3jz/view?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onNotification?.("جاري تنزيل حقيبة التكوين وتحضير امتحان الترسيم الشاملة")}
              className="w-full md:w-auto bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black py-3 px-5 rounded-2xl shadow-xl flex items-center justify-center gap-2 duration-200 transform hover:scale-[1.03]"
            >
              <Download size={16} className="animate-bounce" />
              <span>📖 تنزيل حقيبة التكوين الرسمي والترسيم الشاملة</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Grid Layout to prevent clutter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN: Interactive Registration Prep Center & Checklist */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prep Checklist Section */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="text-purple-600" size={20} />
                <div>
                  <h2 className="text-sm font-black text-slate-950">قائمة تفقد ملف الترسيم الشامل (Checklist)</h2>
                  <p className="text-[10px] text-slate-400">حدد المستندات التي قمت بتهيئتها لمعاينة معدل جهوزيتك الإدارية ليوم الزيارة:</p>
                </div>
              </div>

              <button
                onClick={handleResetChecklist}
                className="text-slate-400 hover:text-red-500 text-[10px] font-bold duration-150 flex items-center gap-0.5 border border-slate-200/60 rounded-lg px-2 py-1 hover:bg-red-50"
                title="إعادة تعيين القائمة"
              >
                <RefreshCw size={11} />
                <span>تصفير</span>
              </button>
            </div>

            {/* Preparation state progress bar */}
            <div className="mb-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-500">مستوى جهوزية ملفك الإداري والبيداغوجي:</span>
                <span className="text-xs font-black text-purple-700">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-2 rounded-full duration-550 transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[9px] text-slate-400 mt-1.5 flex items-center gap-1">
                <AlertCircle size={10} className="text-purple-500" />
                <span>عليك إحضار كامل هذه الوثائق البيداغوجية يوم الترسيم لتقديمها إلى مفتش المقاطعة.</span>
              </p>
            </div>

            {/* Checklist elements list */}
            <div className="space-y-2">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleCheckToggle(item.id)}
                  className={`flex items-start justify-between p-3 rounded-xl border duration-150 cursor-pointer select-none ${
                    item.checked 
                    ? 'bg-purple-50/50 border-purple-200 text-slate-900' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => {}} // toggled by parent div
                      className="rounded bg-white border-slate-300 text-purple-600 focus:ring-0 w-4 h-4 mt-0.5 cursor-pointer"
                    />
                    <div className="text-xs font-semibold leading-relaxed">
                      {item.label}
                    </div>
                  </div>

                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shrink-0 mr-2 ${
                    item.category === 'بيداغوجي' ? 'bg-blue-100 text-blue-700' :
                    item.category === 'إداري' ? 'bg-amber-100 text-amber-700' :
                    item.category === 'طبي/وقائي' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Expanded Q&A Oral Examination Guide */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <HelpCircle className="text-purple-600" size={20} />
              <div>
                <h2 className="text-sm font-black text-slate-950">الأسئلة البيداغوجية المتوقعة في الامتحان الشفوي</h2>
                <p className="text-[10px] text-slate-400">انقر على أي سؤال لاستعراض الإجابة البيداغوجية الموصى بها من طرف المفتشين والأخصائيين:</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {oralQuestions.map((q) => {
                const isExpanded = expandedQuestion === q.id;
                return (
                  <div 
                    key={q.id}
                    className="border border-slate-200/60 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                      className="w-full bg-slate-50 hover:bg-slate-100/80 p-3.5 flex items-center justify-between text-right font-semibold text-xs text-slate-800 duration-150 focus:outline-none"
                    >
                      <span className="flex items-start gap-2 pl-4">
                        <span className="bg-purple-200 text-purple-800 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                          {q.id}
                        </span>
                        <span>{q.q}</span>
                      </span>
                      {isExpanded ? <ChevronUp size={14} className="text-slate-500 shrink-0" /> : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                        <div className="border-r-2 border-purple-500 pr-3">
                          {q.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* LEFT COLUMN: Mock Test & Database uploads sharing */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Interactive Mock Test / Quiz */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Award className="text-indigo-600" size={20} />
                <div>
                  <h2 className="text-sm font-black text-slate-950">سؤال وجواب: اختبار التثبيت الفوري ✍️</h2>
                  <p className="text-[10px] text-slate-400">اختبر معلوماتك في التشريع المدرسي ومفاهيم البيداغوجيا البدنية المعمول بها:</p>
                </div>
              </div>

              {quizSubmitted && (
                <button
                  onClick={handleResetQuiz}
                  className="text-indigo-600 hover:text-indigo-500 text-[10px] font-bold duration-150 flex items-center gap-0.5 bg-indigo-550/10 px-2 py-1 rounded-lg"
                >
                  <span>أعد المحاولة</span>
                </button>
              )}
            </div>

            {/* Quiz block */}
            <div className="space-y-4">
              {mockQuiz.map((q, quizIdx) => (
                <div key={q.id} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2 text-right">
                  <div className="text-xs font-black text-slate-800 leading-normal">
                    <span>{quizIdx + 1}. </span>
                    {q.q}
                  </div>

                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      let btnStyle = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100/50";
                      
                      if (quizSubmitted) {
                        if (optIdx === q.correct) {
                          btnStyle = "bg-emerald-55 text-emerald-800 border-emerald-300 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-red-50 text-red-800 border-red-200";
                        } else {
                          btnStyle = "bg-white border-slate-200 text-slate-400 opacity-60";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-600 text-white border-indigo-700 font-bold shadow-sm";
                      }

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleQuizSelect(q.id, optIdx)}
                          disabled={quizSubmitted}
                          className={`w-full text-right p-2.5 rounded-lg text-xs duration-150 transition focus:outline-none ${btnStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-2 p-2 bg-indigo-50/50 rounded text-[10px] text-slate-600 leading-relaxed font-bold border-r border-indigo-400">
                      <strong>💡 التفسير البيداغوجي:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < mockQuiz.length}
                  className={`w-full py-2.5 rounded-xl font-black text-xs duration-150 tracking-wider flex items-center justify-center gap-1.5 shadow-md ${
                    Object.keys(quizAnswers).length < mockQuiz.length
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-l from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer active:scale-95'
                  }`}
                >
                  <span>📊 تقدير الدرجة وتأكيد إرسال الأجوبة</span>
                </button>
              ) : (
                <div className="bg-gradient-to-l from-emerald-500 to-teal-600 text-white rounded-xl p-4 text-center space-y-1.5 shadow-lg border border-emerald-400/30">
                  <div className="text-[11px] font-black uppercase tracking-wider opacity-90">نتيجة تقييمك التشريعي</div>
                  <div className="text-3xl font-black">{quizScore} / {mockQuiz.length}</div>
                  <div className="text-xs font-medium">
                    {quizScore === mockQuiz.length ? '🥇 أداء تشريعي وبيداغوجي كامل! أنت جاهز تماماً للترسيم.' :
                     quizScore >= 2 ? '🥈 مستوى رائع وجاهزية طيبة. أعد المحاولة لحصد العلامة الكاملة.' : 
                     '⚠️ مستوى يحتاج للمراجعة والتركيز. نزّل ملفات التشريع المرفقة واستعد ثانية.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Database Sharing Center: Uploads and Custom courses */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ClipboardList className="text-purple-650" size={20} />
              <div>
                <h2 className="text-sm font-black text-slate-950">سجلات دورات ومواد التكوين المفتوحة 🌍</h2>
                <p className="text-[10px] text-slate-400">سجل هنا أو جلب روابط دورات الوزارة التكوينية المفتوحة للتأطير:</p>
              </div>
            </div>

            {/* Custom files upload / Links addition form */}
            <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-100 space-y-3">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">اسم ورأسية الدورة أو الملف:</label>
                <input 
                  type="text"
                  placeholder="مثال: ندوة التشريع الإقليمية، تسيير الصدمات..." 
                  className="border border-slate-200 bg-white p-2.5 w-full rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium" 
                  onChange={(e) => setTitle(e.target.value)} 
                  value={title} 
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 mb-1">الرابط الإلكتروني للمشاركة أو التحميل:</label>
                <input 
                  type="text"
                  placeholder="مثال: drive.google.com/..." 
                  className="border border-slate-200 bg-white p-2.5 w-full rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 font-medium" 
                  onChange={(e) => setUrl(e.target.value)} 
                  value={url} 
                />
              </div>

              <button 
                onClick={addItem} 
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-xs font-black py-2.5 w-full rounded-lg duration-150 shadow-sm cursor-pointer hover:shadow flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                <span>{loading ? 'جاري المشاركة وإرساء البيانات...' : 'حفظ وإرسال لمركز التكوين'}</span>
              </button>
            </div>

            {/* Display list of shared elements */}
            <div className="space-y-2 mt-2 max-h-[280px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400">
                  لا توجد أي روابط أو دورات تكوينية مضافة اختيارياً لحد الساعة.
                </div>
              ) : (
                items.map((item: any) => (
                  <div key={item.id} className="p-3 border border-slate-200 rounded-xl hover:bg-slate-50 flex items-center justify-between gap-3 bg-white duration-150">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="text-purple-650 shrink-0" size={15} />
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-700 underline font-semibold text-xs truncate leading-normal"
                        title={item.title}
                      >
                        {item.title}
                      </a>
                    </div>

                    <button
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 duration-150 shrink-0 transition"
                      title="حذف المستند من المنصة"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
