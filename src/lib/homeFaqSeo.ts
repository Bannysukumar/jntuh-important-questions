import { SITE_NAME } from '@/lib/constants'

/** FAQ entries for JSON-LD FAQPage + visible FAQ section — aligned with About Us mission. */
export function getHomeSeoFaqs(): { question: string; answer: string }[] {
  return [
    {
      question: 'What are JNTUH important questions on this site?',
      answer:
        'They are exam-focused question lists for JNTUH Hyderabad B.Tech students, built by analyzing previous years\' Regular and Supplementary papers, spotting frequently repeated questions, and predicting likely exam topics — organized unit-wise with optional PDF downloads.',
    },
    {
      question: 'How accurate are these important questions?',
      answer:
        'Sets have been tested with students across affiliated colleges over three years; historically, up to 96% of questions appearing in final exams were covered in the important questions on this platform. Always still revise the full syllabus and faculty guidance.',
    },
    {
      question: 'Are R18, R22, and newer regulations covered?',
      answer:
        'Yes. Filters and content follow JNTUH regulations including R18, R22, and future regulations as sets are published. Use Browse / Search to pick your regulation, branch, and semester.',
    },
    {
      question: 'How do I download unit-wise PDFs?',
      answer:
        'Open any unit page and use Download PDF. You get a watermark-protected file with unit-wise important questions from the same analysis-backed lists — free for every student.',
    },
    {
      question: 'When are questions updated before exams?',
      answer:
        'Important questions are refreshed on an ongoing basis from about three months before examinations through to as late as two hours before the exam, so you get the latest trend-based predictions. Check back often.',
    },
    {
      question: 'Does this cost anything?',
      answer:
        `${SITE_NAME} is completely free. The mission is to help no student fail because of a lack of proper preparation materials.`,
    },
    {
      question: 'How can I rate the site after my exam?',
      answer:
        'After your examination, visit the Ratings page to share how many predicted questions matched and leave a star rating. Your feedback helps other students trust the platform and improves future analysis.',
    },
    {
      question: 'Is this website affiliated with JNTUH?',
      answer: `${SITE_NAME} is an independent educational resource. It is not affiliated with or endorsed by JNTUH. Always verify critical topics with your official syllabus and faculty.`,
    },
  ]
}
