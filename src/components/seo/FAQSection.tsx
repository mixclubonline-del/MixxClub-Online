import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { generateFAQSchema } from '@/lib/seo-schema';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function FAQSection({ faqs, title = 'Frequently Asked Questions', subtitle, className = '' }: FAQSectionProps) {
  if (!faqs.length) return null;

  const schema = generateFAQSchema(faqs);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <section className={`max-w-3xl mx-auto ${className}`} aria-labelledby="faq-heading">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 id="faq-heading" className="text-3xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-5 data-[state=open]:ring-1 data-[state=open]:ring-primary/20 transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </section>
    </>
  );
}
