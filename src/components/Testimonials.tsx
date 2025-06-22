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
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 500 : -500,
    opacity: 0,
    scale: 0.8,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default function Testimonials() {
  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection: number) => {
    setPage([(page + newDirection + testimonials.length) % testimonials.length, newDirection]);
  };

  const testimonialIndex = page;

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center py-12">
       <div className="w-full h-[380px] sm:h-[320px] relative flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="absolute w-[90%] h-full"
          >
            <div className="h-full bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl flex flex-col justify-center items-center p-8 space-y-4 border border-gray-100">
              <p className="text-base sm:text-lg text-center text-gray-700 leading-relaxed italic max-w-xl mx-auto">
                "{testimonials[testimonialIndex].text}"
              </p>
              <div className="pt-4 flex flex-col items-center text-center">
                <img
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  className="w-14 h-14 rounded-full mb-3 border-2 border-purple-100 shadow-md"
                />
                <div className="font-semibold text-gray-900">{testimonials[testimonialIndex].name}</div>
                <div className="text-gray-500 text-sm">{testimonials[testimonialIndex].role}</div>
                <div className={`mt-2 px-3 py-1 text-xs font-medium rounded-full ${testimonials[testimonialIndex].tagColor}`}>
                  {testimonials[testimonialIndex].tag}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-0 sm:px-4 z-10">
        <motion.button
          whileHover={{ scale: 1.1, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(-1)}
          className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors duration-200 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => paginate(1)}
          className="w-12 h-12 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors duration-200 shadow-lg"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </div>
      
      {/* Dots */}
      <div className="mt-8 flex space-x-2">
        {testimonials.map((_, i) => (
          <motion.button
            key={i}
            animate={{ scale: i === testimonialIndex ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setPage([i, i > testimonialIndex ? 1 : -1])}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              i === testimonialIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-purple-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
} 