/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DOCUMENT_LINKS } from '../data';
import { FileText, Search, Link2, Download, AlertCircle, PlusCircle, ExternalLink, Filter } from 'lucide-react';

interface DocumentLibraryProps {
  onNotification?: (msg: string) => void;
}

export default function DocumentLibrary({ onNotification }: DocumentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [linksList, setLinksList] = useState(DOCUMENT_LINKS);
  const [activeType, setActiveType] = useState<string>('all');

  // Fields for adding custom resources
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('PDF');

  const filteredLinks = linksList.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          link.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = activeType === 'all' || link.type === activeType;
    return matchesSearch && matchesType;
  });

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      onNotification?.('يرجى ملء الاسم والرابط على الأقل لإدراج المصدر.');
      return;
    }

    const item = {
      title: newTitle,
      description: newDesc || 'ملف خارجي مضاف يدوياً من قبل أستاذ المادة للتناول السريع.',
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      type: newType,
      provider: 'المصادر الشخصية المضافة'
    };

    setLinksList([item, ...linksList]);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setShowAddForm(false);
    onNotification?.(`تم بنجاح إدراج الملف المساعد: "${item.title}" في مكتبتك اليومية.`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="text-emerald-600" />
            المكتبة الرقمية المرجعية لأستاذ التربية البدنية
          </h2>
          <p className="text-xs text-slate-500 mt-1">تضم أهم المناشير الرسمية، سجل الغيابات والمقاطع البيداغوجية المعتمدة رسمياً.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700 duration-150 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle size={15} />
          {showAddForm ? 'إخفاء نموذج الإضافة' : 'إضافة مستند أو رابط مخصص'}
        </button>
      </div>

      {/* Info warning alert about browser sandboxing / popup blockers */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong>ملاحظة للمتصفح:</strong> قد يتطلب تحميل بعض الملفات أو تصفح روابط Google Drive فتح التطبيق في <strong>علامة تبويب جديدة</strong> لتخطي بروتوكولات الحماية من داخل إطارات العرض المصغرة (iFrames).
        </div>
      </div>

      {/* Adding Form Popup layout inside the flow */}
      {showAddForm && (
        <form onSubmit={handleAddLink} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl mb-5 animate-fadeIn">
          <h3 className="text-sm font-bold text-slate-800 mb-3 block">✍️ إدراج مصدر تربوي مخصص للحقيبة:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">اسم الملف أو السند:</label>
              <input
                type="text"
                required
                placeholder="مثال: مذكرات السنة الثالثة ابتدائي..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">الرابط المباشر (الملف أو السند الدراسي):</label>
              <input
                type="text"
                required
                placeholder="https://drive.google.com/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500 dir-ltr text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">شرح ووصف محتويات المستند:</label>
              <input
                type="text"
                placeholder="شرح موجز لأهمية السند في الحصة وبنائه..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">صيغة الملف:</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="PDF">مستند PDF رسمي</option>
                <option value="Word">ملف وورد Word للتعديل</option>
                <option value="Drive">مجلد جوجل درايف Drive</option>
                <option value="Web">رابط ويب / صفحة مرجعية</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition"
            >
              إلغاء التراجع
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition"
            >
              حفظ وتثبيت
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <input
            type="text"
            name="document-search-input-field-unique"
            placeholder="البحث في وثائق ومنهاج التربية البدنية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pr-10 pl-3 py-3 focus:outline-none focus:bg-white focus:border-emerald-500 text-right font-medium"
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <Search className="absolute right-3 top-3.5 text-slate-400 w-4 h-4" />
        </div>

        {/* Filter categories tabs within the design */}
        <div className="flex gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          {[
            { tag: 'all', title: '🗂️ الكل' },
            { tag: 'PDF', title: '📕 رسمي PDF' },
            { tag: 'Word', title: '📘 وورد للتعديل' },
            { tag: 'Drive', title: '🌐 درايف وسجلات' }
          ].map((cate) => (
            <button
              key={cate.tag}
              onClick={() => setActiveType(cate.tag)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border transition shrink-0 ${
                activeType === cate.tag
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cate.title}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Links Listing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLinks.length === 0 ? (
          <div className="col-span-2 text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-400">لا توجد مستندات تطابق شروط البحث الفعلي الحالية.</p>
            <button
              onClick={() => { setSearchTerm(''); setActiveType('all'); }}
              className="mt-3 text-xs font-bold text-emerald-600 underline"
            >
              إعادة تهيئة خيارات التراشح والفرز
            </button>
          </div>
        ) : (
          filteredLinks.map((item, idx) => (
            <div
              key={idx}
              className="group border border-slate-100 hover:border-emerald-200 bg-white p-4 rounded-2xl hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    item.type === 'PDF' ? 'bg-red-50 text-red-700 border border-red-200' :
                    item.type === 'Word' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {item.type}
                  </span>
                  
                  <span className="text-[11px] text-slate-400 font-medium">{item.provider}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1.5 mb-4 font-medium h-10 overflow-hidden line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="flex gap-2 border-t border-slate-50 pt-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onNotification?.(`جاري التوجيه نحو المصدر: ${item.title}`)}
                  className="flex-1 text-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink size={13} />
                  معاينة وتنزيل الملف
                </a>

                <a
                  href={item.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  title="تنزيل مباشر للحقيبة"
                  className="px-3 bg-emerald-550/10 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center transition"
                >
                  <Download size={14} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
