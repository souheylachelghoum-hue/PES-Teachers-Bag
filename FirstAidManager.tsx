/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FIRST_AID_GUIDES } from '../data';
import { IncidentReport, FirstAidGuide } from '../types';
import { ShieldAlert, Phone, Printer, CheckSquare, HeartHandshake, Eye, AlertCircle, FilePlus, Video, Award, FileText, Check } from 'lucide-react';

interface FirstAidManagerProps {
  onNotification?: (msg: string) => void;
}

export default function FirstAidManager({ onNotification }: FirstAidManagerProps) {
  // Helplines list
  const helplines = [
    { title: '🚑 الاتصال بسيارة الإسعاف (الحماية المدنية)', number: '14', desc: 'لطلب نقل طبي مستعجل أو معالجة إصابة بليغة وحرجة بالموقع' },
    { title: '🏥 الاتصال بمستشفى الطوارئ المحلي', number: '190', desc: 'للتنسيق الفوري مع مصلحة الاستعجالات لاستقبل الحالة الطبية' },
    { title: '🏢 الاتصال بإدارة المؤسسة التعليمية', number: '023-456789', desc: 'لإخطار مدير المدرسة والمشرفين بالحادث الحاصل وتأمين المتعلم' }
  ];

  // Selected guide state
  const [activeGuideId, setActiveGuideId] = useState<string>('faint');
  const [activeSubTab, setActiveSubTab] = useState<'edit' | 'a4-preview'>('edit');
  
  // Incident report form state
  const [report, setReport] = useState<IncidentReport>({
    schoolName: '',
    className: '',
    studentName: 'علي كاشير',
    date: '2026-05-29',
    time: '10:15',
    description: '',
    actionTaken: '',
    witnesses: '',
    teacherName: 'مراد بوعلاق (أستاذ المادة)',
    directorName: 'السيد السعيد بوسالم',
    teacherSignatureName: 'الأستاذ مراد بوعلاق',
    directorSealEnabled: true
  });

  const activeGuide = FIRST_AID_GUIDES.find(g => g.id === activeGuideId) || FIRST_AID_GUIDES[0];

  const handlePrint = () => {
    onNotification?.('جاري فتح قائمة الطباعة المخصصة لتقرير الحوادث المدرسية.');
    window.print();
  };

  const downloadHtmlReport = () => {
    try {
      const currentDate = new Date().toLocaleDateString('ar-DZ');
      const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير بيداغوجي رسمي عن حادث ومخاطر الحصة الرياضية</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;905&display=swap');
        
        body {
            font-family: 'Cairo', 'Inter', sans-serif;
            margin: 0;
            padding: 25px;
            background-color: #f1f5f9;
            color: #0f172a;
            direction: rtl;
        }

        .no-print-zone {
            max-width: 210mm;
            margin: 0 auto 20px auto;
            background: #ffffff;
            padding: 16px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }

        .btn-print {
            background-color: #059669;
            color: white;
            border: none;
            padding: 10px 22px;
            font-size: 13px;
            font-weight: 800;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .btn-print:hover {
            background-color: #047857;
        }

        .a4-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            background: #ffffff;
            box-sizing: border-box;
            padding: 50px 60px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .header-section {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 25px;
        }

        .header-section h2 {
            font-size: 14px;
            font-weight: 900;
            margin: 0 0 6px 0;
        }

        .header-section h3 {
            font-size: 12.5px;
            font-weight: 700;
            margin: 0 0 6px 0;
            color: #334155;
        }

        .header-section h4 {
            font-size: 11px;
            font-weight: 600;
            margin: 0;
            color: #475569;
        }

        .title-badge {
            background: #0f172a;
            color: #ffffff;
            padding: 8px 24px;
            border-radius: 6px;
            font-size: 13.5px;
            font-weight: 900;
            display: inline-block;
            margin-top: 15px;
            border: 1px solid #020617;
        }

        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 25px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: 12.5px;
            font-weight: 700;
            margin-bottom: 25px;
        }

        .section-block {
            margin-bottom: 22px;
        }

        .section-title {
            font-size: 13px;
            font-weight: 900;
            text-decoration: underline;
            margin: 0 0 8px 0;
            color: #0f172a;
        }

        .content-box {
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            font-size: 12px;
            line-height: 1.7;
            text-align: justify;
            min-height: 100px;
            white-space: pre-wrap;
            color: #334155;
        }

        .witness-box {
            background-color: #fafafa;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            font-size: 11.5px;
            color: #475569;
        }

        .signatures-section {
            border-top: 1px solid #cbd5e1;
            padding-top: 25px;
            margin-top: 25px;
        }

        .sig-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .sig-column {
            text-align: center;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 150px;
        }

        .visual-sig {
            font-family: 'Georgia', serif;
            font-style: italic;
            font-size: 17px;
            color: #1e3a8a;
            font-weight: 900;
            border-top: 1.5px solid #fef08a;
            border-bottom: 1.5px solid #fef08a;
            background-color: #fffbeb;
            padding: 5px 15px;
            border-radius: 4px;
            display: inline-block;
            transform: rotate(-3deg);
            margin: auto;
        }

        .seal-container {
            position: relative;
            margin: auto;
        }

        .seal-stamp {
            width: 105px;
            height: 105px;
            border-radius: 50%;
            border: 4px double #2563eb;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4px;
            color: #2563eb;
            font-size: 7.5px;
            font-weight: 900;
            line-height: 1.2;
            text-align: center;
            transform: rotate(-6deg);
            box-sizing: border-box;
            background: white;
        }

        .seal-inner {
            border: 1px dashed rgba(37,99,235,0.6);
            border-radius: 50%;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .seal-badge {
            background-color: #2563eb;
            color: white;
            padding: 1px 8px;
            border-radius: 2px;
            font-size: 8px;
            margin: 2px 0;
            font-weight: 900;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .no-print-zone {
                display: none;
            }
            .a4-page {
                border: none;
                box-shadow: none;
                width: 100%;
                height: auto;
                padding: 0;
            }
        }
    </style>
</head>
<body>

    <div class="no-print-zone">
        <div style="text-align: right;">
            <span style="color: #2563eb; font-weight: 900; font-size: 13.5px;">📥 لقد قمت بتحميل التقرير كصفحة مستقلة للطباعة بنجاح!</span>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #475569;">بامكانك حفظ هذا المستند كـ PDF بضغط زر الطباعة أدناه وتغيير الطابعة إلى "حفظ بتنسيق PDF" (Save as PDF).</p>
        </div>
        <button class="btn-print" onclick="window.print()">🖨️ طباعة التقرير / حفظ PDF</button>
    </div>

    <div class="a4-page">
        <div>
            <div class="header-section">
                <h2>الجمهورية الجزائرية الديمقراطية الشعبية</h2>
                <h3>وزارة التربية الوطنية</h3>
                <h4>مديرية التربية لولاية الجزائر - مفتشية الطفولة والتربية الرياضية</h4>
                <div class="title-badge">تقرير بيداغوجي ورسمي عن الحادث ومخاطر الحصة الرياضية</div>
                <div style="font-size: 9px; color: #94a3b8; font-family: monospace; margin-top: 10px; direction: ltr;">
                    تاريخ الإنشاء التلقائي: ${currentDate}
                </div>
            </div>

            <div class="meta-grid">
                <div>المؤسسة الابتدائية: ${report.schoolName || '...............................................'}</div>
                <div>القسم والفوج الدراسي: ${report.className || '.........................................'}</div>
                <div>اسم التلميذ(ة) المصاب(ة): <span style="color: #b91c1c; font-weight: 900;">${report.studentName || '.........................'}</span></div>
                <div>أستاذ(ة) المادة المعتمد: ${report.teacherName || '.........................................'}</div>
                <div style="grid-column: span 2; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 11px;">
                    <span>تاريخ الحادث الميداني: ${report.date}</span>
                    <span>توقيت الإصابة الدقيق: ${report.time}</span>
                </div>
            </div>

            <div class="section-block">
                <h4 class="section-title">1. ملابسات سقوط التلميذ وظروف الميدان الفنية بالتفصيل:</h4>
                <div class="content-box">${report.description || 'لم يتم تدوين حوادث أو سقوط في الوقت الحالي.'}</div>
            </div>

            <div class="section-block">
                <h4 class="section-title">2. التدابير الإسعافية وتأمين الملاعب المتخذة فوراً:</h4>
                <div class="content-box">${report.actionTaken || 'لم يتم كتابة التدابير الإسعافية المتخذة.'}</div>
            </div>

            ${report.witnesses ? `
            <div class="section-block">
                <h4 style="font-size: 12px; margin: 0 0 5px 0; color: #0f172a; font-weight: 900;">👤 الشهود والمشرفين المعاينين للحادث:</h4>
                <div class="witness-box">${report.witnesses}</div>
            </div>
            ` : ''}
        </div>

        <div class="signatures-section">
            <div class="sig-grid">
                <div class="sig-column">
                    <div>توقيع وإمضاء أستاذ(ة) المادة المربص(ة):</div>
                    <div style="font-size: 9px; color: #94a3b8; font-weight: normal; margin-top: -15px;">(${report.teacherName || 'أستاذ البدنية'})</div>
                    <div class="visual-sig">${report.teacherSignatureName || 'الأستاذ المتربص'}</div>
                    <div style="font-size: 9px; color: #94a3b8;">بذات التاريخ المعتمد</div>
                </div>

                <div class="sig-column" style="align-items: center;">
                    <div>توقيع وختم مدير(ة) المؤسسة الابتدائية:</div>
                    <div style="font-size: 9px; color: #94a3b8; font-weight: normal; margin-top: -15px;">(${report.directorName || 'مدير المدرسة'})</div>
                    
                    ${report.directorSealEnabled ? `
                    <div class="seal-container">
                        <div class="seal-stamp">
                            <div class="seal-inner">
                                <span>وزارة التربية الوطنية</span>
                                <span style="font-size: 7px; font-weight: bold; margin: 2px 0;">مديرية التربية لولاية الجزائر</span>
                                <span class="seal-badge">مُصادَق علَيه</span>
                                <span style="font-size: 5px; opacity: 0.85; max-width: 85px; overflow: hidden; white-space: nowrap;">${report.schoolName || 'مدرسة الأمير'}</span>
                            </div>
                        </div>
                    </div>
                    ` : `
                    <div style="width: 100px; height: 75px; border: 1px dashed #cbd5e1; background-color: #f8fafc; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 10px;">مساحة الختم</div>
                    `}
                    <div style="font-size: 9px; color: #94a3b8;">الختم الإداري الرسمي للمؤسسة</div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير_إصابة_التلميذ_${report.studentName || 'بيداغوجي'}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onNotification?.('تم تنزيل ملف التقرير المستقل للطباعة (HTML) بنجاح! افتحه مباشرة على جهازك وسيعمل معك أمر الطباعة 100%.');
    } catch (e) {
      console.error(e);
      onNotification?.('فشل في إعداد وتنزيل ملف الطباعة المستقل.');
    }
  };

  const copyTextReport = () => {
    try {
      const textContent = `الجمهورية الجزائرية الديمقراطية الشعبية
وزارة التربية الوطنية
مديرية التربية لولاية الجزائر

تقرير بيداغوجي ورسمي عن الحادث ومخاطر الحصة الرياضية
--------------------------------------------------
تاريخ التقرير: ${new Date().toLocaleDateString('ar-DZ')}

معطيات المؤسسة والأعضاء:
- المؤسسة الابتدائية: ${report.schoolName || '...................'}
- القسم والفوج التربوي: ${report.className || '...................'}
- الأستاذ المشرف: ${report.teacherName || '...................'}
- السيد(ة) مدير(ة) المؤسسة: ${report.directorName || '...................'}

معلومات المتعلم المصاب والتدخل الميداني:
--------------------------------------------------
- اسم التلميذ(ة) المصاب(ة): ${report.studentName || '...................'}
- تاريخ الحادث: ${report.date}
- توقيت الإصابة: ${report.time}

1. ملابسات سقوط التلميذ وظروف الميدان الفنية بالتفصيل:
${report.description || 'لم يتم رصد ظروف معينة.'}

2. التدابير الإسعافية وتأمين الملاعب المتخذة فوراً:
${report.actionTaken || 'لم توثق إجراءات اسعافية.'}

${report.witnesses ? `- الشهود الحاضرين والمعاينين للحادث: ${report.witnesses}` : ''}

إمضاء أستاذ المادة: [ ${report.teacherSignatureName || 'الأستاذ'} ]
إمضاء وختم مدير المؤسسة: [ ${report.directorName || 'المدير'} ]
`;

      navigator.clipboard.writeText(textContent);
      onNotification?.('تم نسخ نص التقرير الإداري بالكامل للحافظة! يمكنك الآن لصقه في ملف Word أو إرساله في البريد بسهولة.');
    } catch (e) {
      console.error(e);
      onNotification?.('حدث خطأ أثناء نسخ محتوى التقرير إلى حافظة النظام.');
    }
  };

  const fillDemoValues = () => {
    setReport({
      schoolName: 'مدرسة مالك بن نبي الابتدائية',
      className: 'السنة الخامسة ابتدائي - الفوج أ',
      studentName: 'ياسين براهيمي',
      date: '2026-06-04',
      time: '09:30',
      description: 'أثناء الركض السريع في تمرين الجري المتعرج حول الأقماع، تعثر المتعلم وسقط على ذراعه اليسرى، مما تسبب في ألم حاد فوري وتورم طفيف على مستوى الكوع.',
      actionTaken: 'تم إيقاف التمرين فوراً لضمان سلامة الفرد، قمنا بتثبيت الذراع بضماد مؤقت، ووضع كيس مياه باردة (شلل) لتخفيف شدة الألم، مع إخطار الحارس والاتصال بولي أمره لنقله برفق.',
      witnesses: 'التلميذ جابو عبد المؤمن، ومساعد التربية الأستاذ مراد'
    });
    onNotification?.('تم ملء الاستمارة افتراضياً بمثال حادث حقيقي لتسهيل المعاينة السريعة.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      
      {/* Guides and Helplines - Left (lg:col-span-5) */}
      <div className={`lg:col-span-5 flex flex-col gap-4 no-print ${activeSubTab === 'a4-preview' ? 'hidden' : 'flex'}`}>
        
        {/* Rapid SOS Helplines Widget */}
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
          <h3 className="text-sm font-black text-rose-400 flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-3">
            <HeartHandshake className="w-4 h-4 animate-pulse" />
            أرقام الطوارئ السريعة بالجزائر (2026)
          </h3>
          <div className="flex flex-col gap-2.5">
            {helplines.map((item, idx) => (
              <a
                key={idx}
                href={`tel:${item.number}`}
                onClick={(e) => {
                  onNotification?.(`📞 جاري محاكاة الاتصال الهاتفي بـ: ${item.title} (${item.number})`);
                }}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 transition duration-150 border border-slate-800 group"
              >
                <div className="text-right">
                  <div className="text-xs font-bold font-sans text-slate-200">{item.title}</div>
                  <div className="text-[10px] text-slate-400">{item.desc}</div>
                </div>
                <div className="flex items-center gap-2 bg-rose-600/10 group-hover:bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20">
                  <span className="text-lg font-black font-mono">{item.number}</span>
                  <Phone size={13} className="shrink-0" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* First Aid Manual Tabulation section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex-1">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
            <ShieldAlert className="text-emerald-600 w-4.5 h-4.5" />
            مرجع الإسعاف الفوري بالملاعب
          </h3>

          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3">
            {FIRST_AID_GUIDES.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGuideId(g.id);
                  onNotification?.(`استعراض خطة التعامل مع: ${g.title}`);
                }}
                className={`px-3 py-2 text-[11px] font-bold rounded-lg border transition whitespace-nowrap ${
                  activeGuideId === g.id
                    ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/55 animate-fadeIn">
            <h4 className="text-xs font-extrabold text-slate-700 mb-2">🚨 أهم الأعراض المصاحبة:</h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activeGuide.symptoms.map((sym, idx) => (
                <span key={idx} className="bg-rose-50 text-rose-800 border border-rose-100 text-[10px] px-2 py-0.5 rounded-md font-medium">
                  {sym}
                </span>
              ))}
            </div>

            <h4 className="text-xs font-extrabold text-slate-700 mb-2">🛡️ خطوات التدخل البيداغوجي الفوري:</h4>
            <ol className="space-y-1.5">
              {activeGuide.steps.map((st, sidx) => (
                <li key={sidx} className="text-xs text-slate-600 leading-relaxed flex gap-2 font-medium">
                  <span className="w-4 h-4 rounded bg-emerald-600 text-white font-mono text-[9px] flex items-center justify-center shrink-0 mt-0.5">{sidx+1}</span>
                  <span>{st}</span>
                </li>
              ))}
            </ol>

            {activeGuide.videoUrl && (
              <a
                href={activeGuide.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center bg-slate-100 hover:bg-slate-200 duration-150 text-slate-700 text-[11px] font-bold py-2 px-3 rounded-lg border border-slate-300"
              >
                🎬 تصفح فيديو إرشادي إضافي عن الحالة
              </a>
            )}
          </div>
        </div>

        {/* Approved Emergency & FIRST AID Videos Library */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
            <Video className="text-rose-600 w-4.5 h-4.5" />
            🎥 مكتبة مرئيات الإسعاف المعتمدة (تعليمي)
          </h3>
          <div className="flex flex-col gap-2.5">
            <a
              href="https://drive.google.com/file/d/19__mPIyfAN038xjQPomI3OEAaKzfjerB/view?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onNotification?.('تم الانتقال لمشاهدة فيديو الإجراءات الإسعافية المتكاملة بالملاعب.')}
              className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition border border-slate-200/60 group"
            >
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition duration-150 shadow-sm">
                <Video size={18} className="animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-[11px] font-black text-slate-800 leading-tight">التدابير الإسعافية لحوادث وإصابات الملاعب</div>
                <div className="text-[9px] text-slate-500 font-bold mt-0.5">دليل مصور مصلح وموجه لأساتذة التربية البدنية</div>
              </div>
            </a>
          </div>
        </div>

      </div>

      {/* Incident Reporter Sheet - Right (Expanded when viewing preview) */}
      <div className={`${activeSubTab === 'a4-preview' ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm no-print`}>
        
        {/* Interactive Editor Sub-Tabs */}
        <div className="flex border-b border-slate-200 mb-2">
          <button
            onClick={() => setActiveSubTab('edit')}
            className={`flex-1 pb-3 text-center text-xs font-black border-b-2 transition duration-200 cursor-pointer ${
              activeSubTab === 'edit'
                ? 'border-emerald-500 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            ✏️ تحرير بيانات الاستمارة والأختام
          </button>
          <button
            onClick={() => {
              setActiveSubTab('a4-preview');
              onNotification?.('استعراض وتفحص التقرير البيداغوجي الموجه للوزارة بمقاس A4 الكامل.');
            }}
            className={`flex-1 pb-3 text-center text-xs font-black border-b-2 transition duration-200 cursor-pointer ${
              activeSubTab === 'a4-preview'
                ? 'border-emerald-500 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            📄 نموذج صفحة المعاينة الكاملة A4 (جاهز للطباعة)
          </button>
        </div>

        {activeSubTab === 'edit' ? (
          <>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FilePlus className="text-emerald-600 w-4 h-4" />
                  محرر ومولد تقارير الحوادث المدرسية الرسمية
                </h3>
                <p className="text-[10px] text-slate-500">قم بإنشاء وتوثيق فوري لإصابة تلميذ لحفظ مسؤوليتك المدنية والتربوية والمهنية.</p>
              </div>

              <button
                onClick={fillDemoValues}
                className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg"
              >
                📋 تجربة نموذج جاهز
              </button>
            </div>

            {/* Input fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">اسم المدرسة الابتدائية:</label>
                  <input
                    type="text"
                    value={report.schoolName}
                    onChange={(e) => setReport({ ...report, schoolName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                    placeholder="مثال: مدرسة الأمير عبد القادر..."
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">اسم القسم والفوج التربوي:</label>
                  <input
                    type="text"
                    value={report.className}
                    onChange={(e) => setReport({ ...report, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                    placeholder="مثال: السنة الرابعة ابتدائي - الفوج 1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">اسم التلميذ المصاب:</label>
                  <input
                    type="text"
                    value={report.studentName}
                    onChange={(e) => setReport({ ...report, studentName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">تاريخ الحادث لحفظ السجل:</label>
                  <input
                    type="date"
                    value={report.date}
                    onChange={(e) => setReport({ ...report, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">توقيت حدوث الإصابة دقيقاً:</label>
                  <input
                    type="text"
                    value={report.time}
                    onChange={(e) => setReport({ ...report, time: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium text-center font-mono"
                    placeholder="10:00 صباحاً"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">وصف ظروف وملابسات السقوط الحركي:</label>
                <textarea
                  rows={2}
                  value={report.description}
                  onChange={(e) => setReport({ ...report, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium text-right"
                  placeholder="اكتب كيف وقع السقوط أو الالتواء أثناء اللعب الجماعي بالتفصيل..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">الاستجابة والتدابير الإسعافية المتخذة:</label>
                <textarea
                  rows={2}
                  value={report.actionTaken}
                  onChange={(e) => setReport({ ...report, actionTaken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium text-right"
                  placeholder="مثال: الضغط على الجرح، التثبيث، تبليغ المدير، الاتصال بالحماية المدنية..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">الشهود الحاضرين من تلاميذ ومساعدين (إن وجدوا):</label>
                <input
                  type="text"
                  value={report.witnesses}
                  onChange={(e) => setReport({ ...report, witnesses: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:bg-white focus:border-emerald-500 font-medium"
                  placeholder="أذكر أسماء الشاهدين من الزملاء أو المشرفين للتوثيق الإداري..."
                />
              </div>

              {/* Advanced Signature Customized Fields Accordion */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-100 pb-2">
                  <Award className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  ✍️ تخصيص الأسماء الرسمية والإمضاءات
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">اسم الأستاذ البيداغوجي وبيان وعمله:</label>
                    <input
                      type="text"
                      value={report.teacherName || ''}
                      onChange={(e) => setReport({ ...report, teacherName: e.target.value })}
                      className="w-full bg-white border border-emerald-200/60 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="مثال: الأستاذ مراد بوعلاق..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">اسم السيد(ة) مدير(ة) المؤسسة:</label>
                    <input
                      type="text"
                      value={report.directorName || ''}
                      onChange={(e) => setReport({ ...report, directorName: e.target.value })}
                      className="w-full bg-white border border-emerald-200/60 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium"
                      placeholder="مثال: السيد السعيد بوسالم..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">التوقيع المحاكي للأستاذ (يظهر بخط يدوي):</label>
                    <input
                      type="text"
                      value={report.teacherSignatureName || ''}
                      onChange={(e) => setReport({ ...report, teacherSignatureName: e.target.value })}
                      className="w-full bg-white border border-emerald-200/60 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500 font-medium font-serif italic"
                      placeholder="الأستاذ بوعلاق..."
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5.5">
                    <input
                      type="checkbox"
                      id="directorSealCheckbox"
                      checked={report.directorSealEnabled || false}
                      onChange={(e) => setReport({ ...report, directorSealEnabled: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <label htmlFor="directorSealCheckbox" className="text-[10px] font-bold text-slate-700 cursor-pointer user-select-none">
                      تضمين الختم الدائري الإداري الأزرق للجمهورية والمدير
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action helper banner to full page */}
            <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl flex items-center justify-between gap-3 animate-fadeIn">
              <div className="text-right">
                <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1.5 mb-0.5">
                  <Check className="w-4 h-4 text-indigo-600" />
                  أكملت رصد الحوادث الرياضية؟
                </span>
                <p className="text-[10px] text-indigo-700 font-medium">سجلت المطبوع؟ تفضل بفتح صفحة المعاينة A4 بالأعلى لمحاواة شكل الورقة كاملة الأطراف والأختام.</p>
              </div>

              <button
                onClick={() => {
                  setActiveSubTab('a4-preview');
                  onNotification?.('استعراض وتفحص التقرير البيداغوجي الموجه للوزارة بمقاس A4 الكامل.');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-2 px-3.5 rounded-lg shrink-0 cursor-pointer transform duration-150"
              >
                المعاينة الكاملة A4
              </button>
            </div>
          </>
        ) : (
          /* A4 FULL PAGE PREVIEW MODE IMPLEMENTATION */
          <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-200 select-text flex flex-col items-center animate-fadeIn">
            
            {/* Control bar */}
            <div className="flex flex-col gap-4 w-full max-w-[210mm] mb-5 bg-white p-4 rounded-xl shadow-xs border border-slate-200">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="text-right">
                  <span className="text-[11px] font-black text-rose-600 animate-pulse flex items-center gap-1">
                    ● نموذج الطباعة البيداغوجي المعتمد للجمهورية الجزائرية
                  </span>
                  <p className="text-[9px] text-slate-500 font-bold">يتوافق هذا التنسيق التلقائي بذكاء مع أوراق المراسلات الوزارية الرسمية.</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
                  <button
                    onClick={() => {
                      setActiveSubTab('edit');
                      onNotification?.('العودة لتعديل الحقول والأسماء وإعادة تعيين التوقيعات.');
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] py-2 px-3 rounded-lg text-center cursor-pointer duration-100 border border-slate-200 transition"
                  >
                    ✏️ العودة للتعديل
                  </button>
                  <button
                    onClick={copyTextReport}
                    className="bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 font-black text-[11px] py-2 px-3 rounded-lg flex items-center gap-1 duration-100 cursor-pointer border border-slate-200 transition"
                    title="نسخ التقرير للتعديل عليه في ملف Word للكمبيوتر"
                  >
                    <span>📋 نسخ التقرير للـ Word</span>
                  </button>
                  <button
                    onClick={downloadHtmlReport}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-800 font-black text-[11px] py-2 px-3 rounded-lg flex items-center gap-1 duration-100 cursor-pointer border border-sky-200 transition animate-pulse"
                    title="تحميل كملف إنترنت مستقل لتجاوز مشاكل الطباعة في الإطار"
                  >
                    <span>📥 تحميل مستقل للطباعة فورا (HTML)</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] py-2 px-4.5 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 duration-100 cursor-pointer transition"
                  >
                    <Printer size={13} />
                    طباعة التقرير فورياً
                  </button>
                </div>
              </div>

              {/* Responsive fallback advice banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-[10.5px] leading-relaxed text-right text-amber-900 flex items-start gap-2.5">
                <span className="text-sm shrink-0">⚠️</span>
                <div>
                  <strong className="block mb-1 text-amber-950 font-black">بخصوص قيود متصفح الإنترنت والطباعة داخل النظام:</strong>
                  بسبب سياسة الحماية في متصفحات الويب، تحظر بعض المتصفحات فتح نافذة الطباعة المباشرة عند الضغط على <strong className="font-extrabold text-slate-900">"طباعة التقرير فورياً"</strong> بسبب تشغيل التطبيق داخل نافذة تجريبية (iframe).
                  <span className="text-emerald-900 font-extrabold"> لتفادي هذا وحفظ التقرير بصيغة A4 منسق وجاهز 100%:</span>
                  <ul className="list-decimal mr-4 mt-2 space-y-1 text-slate-700 font-bold">
                    <li>اضغط على زر <strong className="text-sky-800">"📥 تحميل مستقل للطباعة فورا (HTML)"</strong> بالأعلى لتحميل الملف فورياً، وافتحه خارج هذا الموقع في أي متصفح لديك لتحصل على الصفحة كاملة بلمحة البصر مع الأختام وبأعلى دقة طباعة متكاملة.</li>
                    <li>أو اضغط على زر <strong className="text-slate-800">"📋 نسخ التقرير للـ Word"</strong> لتتمكن من لصقه في برنامج Microsoft Word وتعديله و طباعته بالشكل المناسب لك.</li>
                    <li>أو يمكنك ببساطة الضغط على زر <strong className="text-slate-950 underline">مشاركة التطبيق</strong> أو السهم العلوي لفتح التطبيق في <strong className="text-slate-950 font-black">علامة تبويب مستقلة (New Tab)</strong> وعندها سيعمل زر الطباعة المباشر دون أي قيود!</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Simulated physical A4 sheet with realistic layouts */}
            <div className="w-full max-w-[210mm] bg-white rounded-md shadow-2xl border border-slate-300 p-10 sm:p-14 text-black text-right font-sans relative aspect-[1/1.414] min-h-[297mm] flex flex-col justify-between" id="report-a4-paper-preview">
              
              {/* Top and content parts */}
              <div>
                <div className="text-center space-y-1 pb-4 mb-4 border-b-2 border-slate-900">
                  <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
                  <h3 className="text-xs font-black text-slate-700">وزارة التربية الوطنية</h3>
                  <h4 className="text-[11px] font-bold text-slate-500">مديرية التربية لولاية الجزائر - مفتشية الطفولة والتربية الرياضية</h4>
                  <div className="bg-slate-900 text-white px-4 py-1.5 rounded-md text-xs sm:text-sm font-black mx-auto inline-block mt-3 shadow-md border border-slate-950 uppercase">
                    تقرير بيداغوجي ورسمي عن الحادث ومخاطر الحصة الرياضية
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono mt-2" dir="ltr">
                    تاريخ الإنشاء التلقائي: {new Date().toLocaleDateString('ar-DZ')}
                  </p>
                </div>

                {/* Grid of School metadata details */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-black mb-5">
                  <div>
                    <strong>المؤسسة الابتدائية:</strong> {report.schoolName || '...............................................'}
                  </div>
                  <div>
                    <strong>القسم والفوج الدراسي:</strong> {report.className || '.........................................'}
                  </div>
                  <div>
                    <strong>اسم التلميذ(ة) المصاب(ة):</strong> <span className="font-extrabold text-red-700">{report.studentName || '.........................'}</span>
                  </div>
                  <div>
                    <strong>أستاذ(ة) المادة المعتمد:</strong> {report.teacherName || '.........................................'}
                  </div>
                  <div className="col-span-2 border-t border-slate-200 pt-2 flex justify-between">
                    <span><strong>تاريخ الحادث الميداني:</strong> {report.date}</span>
                    <span><strong>توقيت الإصابة الدقيق:</strong> {report.time}</span>
                  </div>
                </div>

                {/* Section 1: Circumstances of accident */}
                <div className="space-y-1.5 mb-4.5 text-xs">
                  <h4 className="font-black underline text-slate-900 text-sm">
                    1. ملابسات سقوط التلميذ وظروف الميدان الفنية بالتفصيل:
                  </h4>
                  <div className="bg-slate-50/50 hover:bg-slate-50 duration-150 p-3.5 rounded-lg border border-slate-200 font-serif leading-relaxed text-slate-800 text-justify text-xs min-h-[100px] whitespace-pre-wrap">
                    {report.description || 'لم يتم تدوين حوادث أو سقوط في الوقت الحالي.'}
                  </div>
                </div>

                {/* Section 2: Actions taken of safety and first aid */}
                <div className="space-y-1.5 mb-4.5 text-xs">
                  <h4 className="font-black underline text-slate-900 text-sm">
                    2. التدابير الإسعافية وتأمين الملاعب المتخذة فوراً:
                  </h4>
                  <div className="bg-slate-50/50 hover:bg-slate-50 duration-150 p-3.5 rounded-lg border border-slate-200 font-serif leading-relaxed text-slate-800 text-justify text-xs min-h-[100px] whitespace-pre-wrap">
                    {report.actionTaken || 'لم يتم كتابة التدابير الإسعافية المتخذة.'}
                  </div>
                </div>

                {/* Section 3: Witnesses */}
                {report.witnesses && (
                  <div className="space-y-1 text-xs mb-3">
                    <h4 className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                      <span>👤 الشهود والمشرفين المعاينين للحادث:</span>
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 font-medium">
                      {report.witnesses}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Footnotes Signatures and Official Double-Stamped Circular Seal */}
              <div className="border-t border-slate-300 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Left Column: Teacher print */}
                  <div className="text-center font-bold text-slate-850 text-xs flex flex-col justify-between h-40">
                    <div>
                      <span>توقيع وإمضاء أستاذ(ة) المادة المربص(ة):</span>
                      <br />
                      <span className="text-[9px] text-slate-400 font-normal">({report.teacherName || 'أستاذ البدنية'})</span>
                    </div>
                    
                    {/* Hand-signature visual style */}
                    <div className="my-auto">
                      <div className="font-serif italic text-lg text-blue-800 font-black tracking-widest bg-yellow-50/30 border-y border-yellow-250/20 py-1.5 px-4 rounded inline-block rotate-[-3deg] transform select-none shadow-xs">
                        {report.teacherSignatureName || 'الأستاذ المتربص'}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 font-bold">بذات التاريخ المعتمد</div>
                  </div>

                  {/* Right Column: Director Stamp */}
                  <div className="text-center font-bold text-slate-850 text-xs flex flex-col justify-between h-40 items-center">
                    <div>
                      <span>توقيع وختم مدير(ة) المؤسسة الابتدائية:</span>
                      <br />
                      <span className="text-[9px] text-slate-400 font-normal">({report.directorName || 'مدير المدرسة'})</span>
                    </div>

                    {/* Rubber Stamp circular seal in blue ink */}
                    {report.directorSealEnabled ? (
                      <div className="my-auto relative">
                        <div className="relative w-28 h-28 rounded-full border-4 border-double border-blue-600/85 flex flex-col items-center justify-center p-1 text-blue-600/85 text-[8px] font-black leading-tight text-center select-none rotate-[-6deg] bg-white transform duration-200 shadow-sm border-spacing-2">
                          {/* Inner ring circle */}
                          <div className="absolute inset-1 rounded-full border border-dashed border-blue-600/60 flex flex-col items-center justify-center p-0.5">
                            <span className="text-[6px] tracking-tight">وزارة التربية الوطنية</span>
                            <span className="text-[7px] font-bold my-0.5">مديرية التربية لولاية الجزائر</span>
                            <span className="bg-blue-600 text-white font-extrabold text-[8px] uppercase tracking-normal px-2.5 py-0.5 rounded-sm my-0.5 shadow-xs">مُصادَق علَيه</span>
                            <span className="text-[5px] font-medium opacity-85 truncate max-w-[85px]">
                              {report.schoolName || 'مدرسة الأمير'}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -inset-1 opacity-25 bg-gradient-to-tr from-transparent via-blue-200/10 to-transparent pointer-events-none select-none"></div>
                      </div>
                    ) : (
                      <div className="w-24 h-20 border border-slate-350 bg-slate-50/50 rounded flex items-center justify-center text-[10px] text-slate-400">
                        مساحة الختم الإداري
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 font-bold">الختم الإداري الرسمي للمؤسسة</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Hidden print-only workspace element to generate ministry print sheet cleanly */}
      <div className="print-only text-black p-12 bg-white text-right leading-relaxed" id="official-print-receipt">
        <div className="text-center space-y-1 mb-8 border-b-2 border-slate-900 pb-5">
          <h2 className="text-sm font-black uppercase">الجمهورية الجزائرية الديمقراطية الشعبية</h2>
          <h1 className="text-base font-black uppercase mt-1">وزارة التربية الوطنية</h1>
          <h3 className="text-xs font-bold text-slate-700 mt-1">تقرير بيداغوجي ورسمي عن الحادث ومخاطر الحصة الرياضية</h3>
          <p className="text-[10px] text-slate-400 mt-1">تاريخ الإنشاء التلقائي: {new Date().toLocaleDateString('ar-DZ')} ببلدية المؤسسة</p>
        </div>

        <div className="space-y-5 text-sm leading-loose">
          <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-250 text-xs">
            <p><strong>المؤسسة التعليمية:</strong> {report.schoolName || '...............................................'}</p>
            <p><strong>القسم والفوج الدراسي:</strong> {report.className || '.........................................'}</p>
            <p><strong>الأستاذ(ة) المشرف(ة):</strong> {report.teacherName || '.........................................'}</p>
            <p><strong>اسم مدير(ة) المؤسسة:</strong> {report.directorName || '.........................................'}</p>
          </div>
          
          <div className="border border-slate-300 p-4 rounded-lg bg-slate-50/20 text-xs space-y-2">
            <p><strong>اسم التلميذ(ة) المصاب(ة) كاملاً:</strong> <span className="font-extrabold text-[#d32f2f] text-sm">{report.studentName}</span></p>
            <p><strong>تاريخ ونطاق الحادث الميداني:</strong> {report.date} في حدود الساعة {report.time}</p>
          </div>

          <div className="text-xs">
            <h4 className="font-bold underline text-slate-850">1. شرح كامل للملابسات وظروف وقوع الإصابة البدنية:</h4>
            <p className="border border-slate-200 bg-slate-50/20 p-3 rounded text-slate-800 min-h-[100px] whitespace-pre-wrap leading-relaxed text-justify">
              {report.description || 'لم يتم كتابة تفاصيل وقوع الحادث في الاستمارة.'}
            </p>
          </div>

          <div className="text-xs">
            <h4 className="font-bold underline text-slate-850">2. الإجراءات والاستجابة الأولى (في ضوء الإسعاف الفوري المنجز):</h4>
            <p className="border border-slate-200 bg-slate-50/20 p-3 rounded text-slate-800 min-h-[100px] whitespace-pre-wrap leading-relaxed text-justify">
              {report.actionTaken || 'لم توثق أي خطة تخلية أو إسعاف أولي مسبق.'}
            </p>
          </div>

          {report.witnesses && (
            <div className="text-xs">
              <h4 className="font-bold text-slate-850">👤 الشهود والمراقبين الحاضرين:</h4>
              <p className="p-2 bg-slate-50 rounded text-slate-700 italic border border-slate-100">{report.witnesses}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-10 mt-10">
            {/* Signature of Teacher */}
            <div className="text-center font-bold text-slate-850 text-xs flex flex-col justify-between h-36">
              <div>
                <span>توقيع وإمضاء أستاذ(ة) المادة الأستاذ(ة):</span>
                <br />
                <span className="text-[10px] text-slate-400 font-normal">({report.teacherName || 'أستاذ التربية البدنية'})</span>
              </div>
              
              <div className="my-auto">
                <div className="font-serif italic text-base text-blue-900 font-bold tracking-widest bg-yellow-50/10 border-y border-yellow-250 py-1 px-4 rounded inline-block rotate-[-3deg] transform">
                  {report.teacherSignatureName || 'الأستاذ المتربص'}
                </div>
              </div>

              <div className="text-[10px] text-slate-400">بذات التاريخ المعتمد</div>
            </div>

            {/* Signature of Director */}
            <div className="text-center font-bold text-slate-850 text-xs flex flex-col justify-between h-36 items-center">
              <div>
                <span>توقيع وختم مدير(ة) المؤسسة الابتدائية:</span>
                <br />
                <span className="text-[10px] text-slate-400 font-normal">({report.directorName || 'مدير المدرسة'})</span>
              </div>

              {report.directorSealEnabled ? (
                <div className="my-auto relative">
                  <div className="relative w-24 h-24 rounded-full border-4 border-double border-blue-600 flex flex-col items-center justify-center p-1 text-blue-600 text-[6px] font-black leading-tight text-center select-none rotate-[-5deg] bg-white">
                    {/* Inner ring circle */}
                    <div className="absolute inset-0.5 rounded-full border border-dashed border-blue-600/60 flex flex-col items-center justify-center p-0.5">
                      <span>وزارة التربية الوطنية</span>
                      <span className="text-[6px] font-bold my-0.5">مديرية الابتدائيات</span>
                      <span className="bg-blue-600 text-white font-extrabold text-[7px] px-2 py-0.5 rounded-sm my-0.5">مُصادَق علَيه</span>
                      <span className="text-[5px] font-medium opacity-85 truncate max-w-[70px]">
                        {report.schoolName || 'مدرسة الأمير'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-24 h-16 border border-slate-350 bg-slate-50/50 rounded flex items-center justify-center text-[9px] text-slate-450">
                  مساحة الختم الإداري
                </div>
              )}

              <div className="text-[10px] text-slate-400">الختم الإداري الرسمي للمؤسسة</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
