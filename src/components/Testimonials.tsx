import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  text: string;
  name: string;
  role: string;
  tag: string;
  tagColor: string;
  initials: string;
  bgColor: string;
}

const testimonials: Testimonial[] = [
  {
    text: "Der GFK Coach hat unsere Familienkommunikation völlig verändert. Statt ständiger Diskussionen haben wir jetzt echte Gespräche. Meine Kinder hören mir zu und ich verstehe ihre Bedürfnisse besser. Die KI-Reformulierungen haben mir geholfen zu verstehen, wie ich meine Frustration ausdrücken kann, ohne zu verletzen.",
    name: "Sarah M.",
    role: "Mutter von zwei Kindern",
    tag: "Familie",
    tagColor: "bg-green-100 text-green-700",
    initials: "SM",
    bgColor: "bg-green-100"
  },
  {
    text: "Als Angestellter war ich oft frustriert über ineffektive Meetings und Konflikte im Team. Der GFK Coach hat mir gezeigt, wie ich konstruktives Feedback geben und annehmen kann. Mein Team ist jetzt offener für Kritik und wir lösen Probleme gemeinsam statt gegeneinander.",
    name: "Michael K.",
    role: "Angestellter",
    tag: "Arbeit",
    tagColor: "bg-amber-100 text-amber-700",
    initials: "MK",
    bgColor: "bg-amber-100"
  },
  {
    text: "Nach 15 Jahren Ehe dachten wir, wir kennen uns in- und auswendig. Aber wir haben gemerkt, dass wir oft aneinander vorbei geredet haben. Die GFK-Prinzipien haben uns geholfen, wieder wirklich miteinander zu sprechen und uns zu verstehen.",
    name: "Anna & Thomas L.",
    role: "Ehepaar",
    tag: "Partnerschaft",
    tagColor: "bg-rose-100 text-rose-700",
    initials: "AT",
    bgColor: "bg-rose-100"
  },
  {
    text: "Ich empfehle den GFK Coach meinen Klienten als Ergänzung zur Therapie. Die praktischen Übungen und sofortigen Reformulierungen helfen dabei, das Gelernte im Alltag anzuwenden. Besonders wertvoll ist die Möglichkeit, verschiedene Kontexte zu üben.",
    name: "Dr. Lisa Weber",
    role: "Psychotherapeutin",
    tag: "Professionell",
    tagColor: "bg-sky-100 text-sky-700",
    initials: "LW",
    bgColor: "bg-sky-100"
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      className="bg-purple-50/50 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 xl:p-12 my-16 relative"
    >
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Was unsere Nutzer über uns sagen
        </h2>
        <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
          Echte Erfahrungen von Menschen, die ihre Kommunikation mit unserem GFK Coach transformiert haben.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Navigation buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center z-10">
          <Button 
            onClick={handlePrevious} 
            size="icon" 
            variant="ghost" 
            className="h-12 w-12 rounded-full bg-white/70 backdrop-blur-sm shadow-lg hover:bg-purple-50"
          >
            <ChevronLeft className="h-6 w-6 text-purple-600" />
            <span className="sr-only">Vorheriges Testimonial</span>
          </Button>
        </div>
        
        <div className="absolute inset-y-0 right-0 flex items-center z-10">
          <Button 
            onClick={handleNext} 
            size="icon" 
            variant="ghost" 
            className="h-12 w-12 rounded-full bg-white/70 backdrop-blur-sm shadow-lg hover:bg-purple-50"
          >
            <ChevronRight className="h-6 w-6 text-purple-600" />
            <span className="sr-only">Nächstes Testimonial</span>
          </Button>
        </div>

        {/* Testimonial card */}
        <div className="px-4 sm:px-12">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  {/* Stars */}
                  <div className="flex mb-6 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  
                  {/* Testimonial text */}
                  <blockquote className="text-center mb-8">
                    <p className="text-lg sm:text-xl text-gray-700 italic leading-relaxed">
                      "{testimonials[currentIndex].text}"
                    </p>
                  </blockquote>
                  
                  {/* Author info */}
                  <div className="flex flex-col items-center">
                    <Avatar className={`h-16 w-16 ${testimonials[currentIndex].bgColor}`}>
                      <AvatarFallback className="text-lg font-semibold">
                        {testimonials[currentIndex].initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-4 text-center">
                      <h3 className="font-semibold text-lg">{testimonials[currentIndex].name}</h3>
                      <p className="text-gray-500 text-sm">{testimonials[currentIndex].role}</p>
                      <Badge variant="outline" className={`mt-2 ${testimonials[currentIndex].tagColor}`}>
                        {testimonials[currentIndex].tag}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <Button
              key={index}
              variant="ghost"
              size="icon"
              className={`w-2 h-2 p-0 rounded-full ${
                index === currentIndex 
                  ? 'bg-purple-600' 
                  : 'bg-gray-300 hover:bg-purple-300'
              }`}
              onClick={() => goToTestimonial(index)}
            >
              <span className="sr-only">Testimonial {index + 1}</span>
            </Button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}