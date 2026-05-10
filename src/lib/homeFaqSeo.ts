import { SITE_NAME } from '@/lib/constants'

/** FAQ entries for JSON-LD FAQPage + optional visible FAQ section */
export function getHomeSeoFaqs(): { question: string; answer: string }[] {
  return [
    {
      question: 'What are JNTUH important questions and where can I find them?',
      answer:
        'Important questions are exam-focused topics and problems often repeated in JNTUH internal and external papers. This site organises them by regulation (R18, R22, R24), branch, semester, and unit so you can search and open unit-wise pages or download PDFs.',
    },
    {
      question: 'How do I download JNTUH important questions as PDF?',
      answer:
        'Open any unit page and use the Download PDF button. The file includes a watermark linking back to the page. Works best on desktop and mobile browsers that support printing to PDF.',
    },
    {
      question: 'Does this cover ECE, CSE, EEE, Mechanical, and Civil?',
      answer:
        'Yes. Use Browse / Search and filter by branch (for example ECE, CSE, EEE, MECH, CIVIL) and semester. Available sets depend on what is published in the catalogue.',
    },
    {
      question: 'Are R18 and R22 important questions available?',
      answer:
        'You can filter by regulation including R18 and R22 (and R24 where sets exist). Pick your regulation in search filters before searching by subject or code.',
    },
    {
      question: 'Is this website affiliated with JNTUH?',
      answer: `${SITE_NAME} is an independent student resource. It is not affiliated with or endorsed by JNTUH. Always verify critical topics with official syllabus and faculty guidance.`,
    },
  ]
}
