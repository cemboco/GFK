import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    text: "Der GFK Coach hat unsere Familienkommunikation völlig verändert. Statt ständiger Diskussionen haben wir jetzt echte Gespräche. Meine Kinder hören mir zu und ich verstehe ihre Bedürfnisse besser. Die KI-Reformulierungen haben mir geholfen zu verstehen, wie ich meine Frustration ausdrücken kann, ohne zu verletzen.",
    name: "Sarah M.",
    role: "Mutter von zwei Kindern",
    tag: "Familie",
    tagColor: "bg-green-100 text-green-700",
    avatar: "https://ui-avatars.com/api/?name=S+M&background=dcfce7&color=166534&bold=true",
  },
  {
    text: "Als Angestellter war ich oft frustriert über ineffektive Meetings und Konflikte im Team. Der GFK Coach hat mir gezeigt, wie ich konstruktives Feedback geben und annehmen kann. Mein Team ist jetzt offener für Kritik und wir lösen Probleme gemeinsam statt gegeneinander.",
    name: "Michael K.",
    role: "Angestellter",
    tag: "Arbeit",
    tagColor: "bg-amber-100 text-amber-700",
    avatar: "https://ui-avatars.com/api/?name=M+K&background=fefce8&color=854d0e&bold=true",
  },
  {
    text: "Nach 15 Jahren Ehe dachten wir, wir kennen uns in- und auswendig. Aber wir haben gemerkt, dass wir oft aneinander vorbei geredet haben. Die GFK-Prinzipien haben uns geholfen, wieder wirklich miteinander zu sprechen und uns zu verstehen.",
    name: "Anna & Thomas L.",
    role: "Ehepaar",
    tag: "Partnerschaft",
    tagColor: "bg-rose-100 text-rose-700",
    avatar: "https://ui-avatars.com/api/?name=A+T&background=ffe4e6&color=9f1239&bold=true",
  },
  {
    text: "Ich empfehle den GFK Coach meinen Klienten als Ergänzung zur Therapie. Die praktischen Übungen und sofortigen Reformulierungen helfen dabei, das Gelernte im Alltag anzuwenden. Besonders wertvoll ist die Möglichkeit, verschiedene Kontexte zu üben.",
    name: "Dr. Lisa Weber",
    role: "Psychotherapeutin",
    tag: "Professionell",
    tagColor: "bg-sky-100 text-sky-700",
    avatar: "https://ui-avatars.com/api/?name=L+W&background=e0f2fe&color=0369a1&bold=true",
  }
];

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    };
  }
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Testimonials() {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const testimonialIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;

  return (
    <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="w-full h-[360px] md:h-[320px] relative flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-full px-4 md:px-8"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-xl p-6 text-center space-y-4 max-w-2xl mx-auto"
            >
              {/* Quote Icon */}
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                  <Quote className="w-5 h-5 text-purple-600" />
                </div>
              </div>

              {/* Stars */}
              <div className="flex justify-center text-yellow-400 space-x-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <Star fill="currentColor" className="w-5 h-5" />
                  </motion.div>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-base text-gray-700 leading-relaxed italic max-w-xl mx-auto">
                "{testimonials[testimonialIndex].text}"
              </p>

              {/* Author Info */}
              <div className="flex flex-col items-center space-y-3">
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  className="w-12 h-12 rounded-2xl border-2 border-white shadow-lg"
                />
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900 text-base">
                    {testimonials[testimonialIndex].name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {testimonials[testimonialIndex].role}
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${testimonials[testimonialIndex].tagColor}`}
                  >
                    {testimonials[testimonialIndex].tag}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="mt-6 flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(-1)}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-purple-600 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Dots */}
        <div className="flex space-x-2">
          {testimonials.map((_, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setPage([i, i > testimonialIndex ? 1 : -1])}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                i === testimonialIndex 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-md' 
                  : 'bg-gray-300 hover:bg-purple-300'
              }`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => paginate(1)}
          className="w-10 h-10 rounded-2xl bg-white border-2 border-purple-600 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
} 