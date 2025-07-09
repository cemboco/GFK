import React from "react";
import { ChevronDown, HelpCircle, Heart, MessageSquare, Book } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useLanguage } from '../contexts/LanguageContext';

export default function FAQ() {
  const { t } = useLanguage();
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>({});

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // FAQ-Daten aus Übersetzungen
  const faqData = t.home.faq.questions;
  const faqCategories = [
    { icon: Heart, color: "from-rose-500 to-rose-600" },
    { icon: MessageSquare, color: "from-emerald-500 to-emerald-600" },
    { icon: HelpCircle, color: "from-blue-500 to-blue-600" },
    { icon: Book, color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            {t.home.faq.title}
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t.home.faq.subtitle}
          </p>
        </motion.div>

        <div className="space-y-8">
          {faqData.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className={`bg-gradient-to-r ${faqCategories[index % faqCategories.length].color} text-white p-6`}>
                  <h2 className="flex items-center gap-3 text-xl font-semibold">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      {React.createElement(faqCategories[index % faqCategories.length].icon, { className: "w-5 h-5" })}
                    </div>
                    {item.question}
                  </h2>
                </div>
                <div className="divide-y divide-slate-100">
                  <div>
                    <button
                      onClick={() => toggleItem(index, 0)}
                      className="w-full p-6 text-left hover:bg-slate-50 transition-colors duration-200 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 pr-4">
                        {item.question}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                          openItems[`${index}-0`] ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {openItems[`${index}-0`] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6 pt-2"
                      >
                        <div className="text-slate-600 leading-relaxed">
                          {item.answer.split('\n').map((paragraph, pIndex) => (
                            <p key={pIndex} className="mb-3 last:mb-0">
                              {paragraph.split('**').map((part, partIndex) => 
                                partIndex % 2 === 1 ? (
                                  <strong key={partIndex} className="font-semibold text-slate-800">
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border border-emerald-200 rounded-xl shadow-lg p-8 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              {t.faq.categories.usage}
            </h3>
            <p className="text-slate-600 mb-4">
              {t.contact.subtitle}
            </p>
            <Link
              to="/kontakt"
              className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {t.contact.title}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 