export type BlogSection = {
  id: string
  title: string
  paragraphs: string[]
}

export type BlogPost = {
  slug: string
  /** Visible H1 / article title */
  title: string
  /** 50–60 chars ideal for <title> before site suffix */
  seoTitle: string
  /** 150–160 chars for meta description */
  description: string
  keywords: string[]
  datePublished: string
  dateModified: string
  sections: BlogSection[]
  faqs: { question: string; answer: string }[]
  relatedSlugs: string[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-pass-jntuh-exams',
    title: 'How to pass JNTUH semester exams with important questions',
    seoTitle: 'How to pass JNTUH exams — study plan & important Qs',
    description:
      'Step-by-step JNTUH B.Tech exam strategy: syllabus mapping, unit-wise important questions, previous-year patterns, and last-week revision — aligned with R18, R22, and R24.',
    keywords: [
      'JNTUH important questions',
      'how to pass JNTUH exams',
      'JNTUH semester preparation',
      'JNTUH unit wise important questions',
      'JNTUH supplementary important questions',
    ],
    datePublished: '2026-01-15',
    dateModified: '2026-05-10',
    sections: [
      {
        id: 'map-syllabus',
        title: 'Map the syllabus before you cram',
        paragraphs: [
          'Start from the official unit outcomes and lecture notes, then layer JNTUH important questions on top so every practice set ties back to a measurable objective.',
          'Regulations change wording more than core topics — compare R18 vs R22 vs R24 unit titles so you do not skip a renamed module.',
        ],
      },
      {
        id: 'unit-wise-prep',
        title: 'Use unit-wise important questions as your backbone',
        paragraphs: [
          'Unit-wise PDFs help you finish one coherent block at a time, which is easier to schedule than random chapter hopping.',
          'Pair each unit list with two previous-year questions from the same topic so you see how JNTUH frames similar ideas in long-form answers.',
        ],
      },
      {
        id: 'exam-week',
        title: 'Exam week: time-boxing and accuracy',
        paragraphs: [
          'Reserve the final 48 hours for high-signal repeats: starred questions, faculty highlights, and any updates published close to your slot.',
          'If you sit supplementary papers, skim both Regular and Supplementary archives — patterns often repeat across cycles.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are JNTUH important questions enough to pass?',
        answer:
          'They are a focused revision layer, not a replacement for the full syllabus. Combine them with notes, lab records, and past papers for the best outcome.',
      },
      {
        question: 'How often should I check for updates?',
        answer:
          'Important lists may be refreshed from a few months before exams through the last hours before your paper. Bookmark the site and revisit after major notifications.',
      },
    ],
    relatedSlugs: ['last-minute-jntuh-exam-prep', 'most-repeated-jntuh-questions'],
  },
  {
    slug: 'jntuh-r22-important-questions-guide',
    title: 'Best JNTUH R22 important questions: what to prioritize',
    seoTitle: 'JNTUH R22 important questions — branch-wise priorities',
    description:
      'A practical guide to JNTUH R22 important questions: how curricula differ by branch, where repeats cluster, and how to download unit-wise PDFs for CSE, ECE, EEE, and more.',
    keywords: [
      'JNTUH R22 important questions',
      'JNTUH R22 unit wise questions',
      'JNTUH CSE important questions',
      'JNTUH ECE important questions',
      'JNTUH important questions PDF',
    ],
    datePublished: '2026-02-02',
    dateModified: '2026-05-10',
    sections: [
      {
        id: 'r22-context',
        title: 'Why R22 needs a different revision mix',
        paragraphs: [
          'R22 balances fundamentals with newer electives. Prioritize units that carry both numerical and theory prompts because exam setters often blend them in the same question.',
          'Cross-check your branch handbook — credit rules and assessment splits still decide how much each unit is worth on paper.',
        ],
      },
      {
        id: 'branch-focus',
        title: 'Branch-specific tips (CSE, ECE, EEE, Civil, IT)',
        paragraphs: [
          'CSE and IT students gain from tracing algorithms on paper, not only IDE runs, because proctored settings reward handwritten traces.',
          'ECE and EEE lists should include both small-signal setups and standard derivations — repeats frequently recycle classic block diagrams.',
        ],
      },
      {
        id: 'pdf-workflow',
        title: 'PDF workflow for offline study',
        paragraphs: [
          'Download unit-wise PDFs early so spotty campus Wi-Fi does not interrupt crunch time.',
          'Keep one folder per subject with filenames that include regulation, semester, and unit number for quick retrieval.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Where can I find JNTUH R22 important questions PDF?',
        answer:
          'Use the browse page to filter regulation R22, pick your branch and semester, then open each published unit to download a watermark PDF.',
      },
      {
        question: 'Do R18 important questions still help R22 students?',
        answer:
          'Core subjects often overlap; use older lists only after confirming the topic still exists in your current syllabus.',
      },
    ],
    relatedSlugs: ['how-to-pass-jntuh-exams', 'most-repeated-jntuh-questions'],
  },
  {
    slug: 'last-minute-jntuh-exam-prep',
    title: 'Last-minute JNTUH exam preparation that still works',
    seoTitle: 'Last-minute JNTUH prep — high-yield checklist',
    description:
      'Short-on-time JNTUH prep: a tight checklist for the night before, how to skim important questions, manage sleep, and avoid blank-page panic in the hall.',
    keywords: [
      'last minute JNTUH preparation',
      'JNTUH important questions night before exam',
      'JNTUH previous year questions',
      'JNTUH exam tips',
    ],
    datePublished: '2026-03-08',
    dateModified: '2026-05-10',
    sections: [
      {
        id: 'triage',
        title: 'Triage in under two hours',
        paragraphs: [
          'List five must-solve long answers per subject — pick the ones that appeared in multiple previous cycles or are flagged as important on this site.',
          'Skim short-answer banks for definitions only; do not rewrite full notes from scratch.',
        ],
      },
      {
        id: 'sleep-and-focus',
        title: 'Sleep, food, and focus blocks',
        paragraphs: [
          'Two 90-minute deep-focus blocks beat six hours of distracted scrolling. Silence notifications and use a physical timer.',
          'Avoid brand-new topics after 9 p.m.; consolidate what you already half-know.',
        ],
      },
      {
        id: 'exam-hall',
        title: 'Inside the exam hall',
        paragraphs: [
          'Allocate the first three minutes to scan the paper and mark confidence levels per question before you write.',
          'If a question looks unfamiliar, search for a related sub-part you can answer — partial credit adds up.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is one night enough to pass JNTUH?',
        answer:
          'Risky but possible if you already attended classes and only need consolidation. Lean entirely on high-probability important questions and past repeats.',
      },
    ],
    relatedSlugs: ['how-to-pass-jntuh-exams', 'jntuh-r22-important-questions-guide'],
  },
  {
    slug: 'most-repeated-jntuh-questions',
    title: 'Most repeated questions in JNTUH (and how we track them)',
    seoTitle: 'Most repeated JNTUH questions — patterns students search',
    description:
      'Learn how previous-year Regular and Supplementary papers reveal repeats, why unit-wise grouping matters, and how up to 96% historical coverage is measured for JNTUH important questions.',
    keywords: [
      'most repeated questions in JNTUH',
      'JNTUH previous year questions',
      'JNTUH important questions analysis',
      'JNTUH unit wise important questions',
    ],
    datePublished: '2026-04-01',
    dateModified: '2026-05-10',
    sections: [
      {
        id: 'pattern-mining',
        title: 'Pattern mining across years',
        paragraphs: [
          'Repeated prompts are not always identical wording — look for the same solution skeleton, boundary conditions, or numerical setup.',
          'Supplementary papers sometimes reuse Regular variants with numeric tweaks, so both streams matter.',
        ],
      },
      {
        id: 'accuracy',
        title: 'What “up to 96% historical accuracy” means here',
        paragraphs: [
          'The figure reflects multi-year testing with affiliated-college cohorts: many final-paper questions matched items from curated important lists.',
          'Your mileage varies by subject, setter, and how closely you followed updates — treat the stat as a trust signal, not a guarantee.',
        ],
      },
      {
        id: 'three-years',
        title: 'Three years of continuous testing',
        paragraphs: [
          'Lists are refined after each major exam window using student feedback and paper reconstructions.',
          'When you rate the site after exams, you help the next batch prioritize what actually showed up.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are these official JNTUH questions?',
        answer:
          'No. They are independent study aids derived from analysis of past papers and syllabus coverage. Always cross-check with faculty guidance.',
      },
      {
        question: 'Which branches benefit most?',
        answer:
          'Published sets span CSE, ECE, EEE, Civil, IT, AI/ML, DS, and more — use search filters to find your regulation and semester.',
      },
    ],
    relatedSlugs: ['how-to-pass-jntuh-exams', 'jntuh-r22-important-questions-guide'],
  },
]

const bySlug = new Map(BLOG_POSTS.map((p) => [p.slug, p]))

export function listBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort(
    (a, b) => new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime(),
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return bySlug.get(slug)
}
