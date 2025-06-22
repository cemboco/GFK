import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

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
      <div className="w-full h-[380px] md:h-[320px] relative flex items-center justify-center overflow-hidden">
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
            className="absolute w-full px-4 md:px-10"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-6 border border-gray-100">
              <div className="flex justify-center text-yellow-400 space-x-1">
                {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" className="w-5 h-5" />)}
              </div>
              <p className="text-lg text-gray-700 leading-relaxed italic">
                "{testimonials[testimonialIndex].text}"
              </p>
              <div className="flex flex-col items-center">
                <img
                  src={testimonials[testimonialIndex].avatar}
                  alt={testimonials[testimonialIndex].name}
                  className="w-16 h-16 rounded-full mb-4 border-2 border-white shadow-md"
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

      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={() => paginate(-1)}
          className="w-10 h-10 rounded-full bg-white border-2 border-purple-600 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors duration-200 shadow-md"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex space-x-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setPage([i, i > testimonialIndex ? 1 : -1])}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                i === testimonialIndex ? 'bg-purple-600' : 'bg-gray-300 hover:bg-purple-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => paginate(1)}
          className="w-10 h-10 rounded-full bg-white border-2 border-purple-600 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors duration-200 shadow-md"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 