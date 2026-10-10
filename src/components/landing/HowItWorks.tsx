'use client';

import { motion } from 'framer-motion';
import { useReducedMotionPreference } from './useReducedMotionPreference';
import { Camera, Download, LayoutGrid } from 'lucide-react';

const steps = [
  { number: '01', icon: LayoutGrid, title: 'Find your format', text: 'A classic strip or a playful collage? Pick the layout that feels like you.', color: 'bg-secondary-fixed' },
  { number: '02', icon: Camera, title: 'Make a little moment', text: 'Strike a pose, follow the countdown, and let your personality do the rest.', color: 'bg-tertiary-fixed' },
  { number: '03', icon: Download, title: 'Keep it forever', text: 'Add your favorite frame and download a keepsake to share or print.', color: 'bg-primary-fixed' },
];

export function HowItWorks() {
  const reducedMotion = useReducedMotionPreference();
  return (
    <section aria-labelledby="how-it-works-title" className="mx-auto w-full max-w-6xl px-margin py-space-xl">
      <div className="mb-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">A good memory is only three steps away</p>
        <h2 id="how-it-works-title" className="mt-2 font-serif text-[30px] sm:text-[38px] text-primary">Pick. Pose. Keep.</h2>
      </div>
      <div className="relative grid gap-6 md:grid-cols-3">
        <div aria-hidden="true" className="absolute top-8 left-[16%] right-[16%] hidden border-t border-dashed border-primary/25 md:block" />
        {steps.map(({ number, icon: Icon, title, text, color }, index) => (
          <motion.div key={number} initial={false}
            whileInView={reducedMotion ? {} : { y: [18, 0], opacity: [0.5, 1] }}
            viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: index * 0.1 }}
            className="relative flex flex-col items-center text-center px-4">
            <div className={`relative mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-primary/15 ${color} shadow-[3px_4px_0_#001c9720]`}>
              <Icon size={26} className="text-primary" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-[9px] font-bold text-white">{number}</span>
            </div>
            <h3 className="font-serif text-xl text-primary">{title}</h3>
            <p className="mt-2 max-w-[270px] text-sm leading-6 text-on-surface-variant">{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
