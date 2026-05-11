import { Link } from 'react-router-dom'
import { SEOHead } from '@/components/seo/SEOHead'
import { SITE_NAME } from '@/lib/constants'
import { FOOTER_TAGLINE, META_DESCRIPTION_DEFAULT } from '@/lib/siteMessaging'

export function AboutPage() {
  return (
    <>
      <SEOHead
        title={`About ${SITE_NAME} — mission, accuracy, and free B.Tech exam prep`}
        description={META_DESCRIPTION_DEFAULT}
        canonicalPath="/about"
        keywords={[
          'Free JNTUH Important Questions',
          'Previous Years Question Analysis',
          'Up to 96% Historical Accuracy',
          'Updated Before Every Examination',
          'JNTUH B.Tech exam preparation',
          'JNTUH R18 R22',
          'Telangana engineering study material',
          SITE_NAME,
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
          About us
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
          About {SITE_NAME}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          Welcome to <strong className="font-semibold text-slate-800 dark:text-slate-100">{SITE_NAME}</strong>, a
          free educational platform created to help{' '}
          <strong className="font-semibold text-slate-800 dark:text-slate-100">
            Jawaharlal Nehru Technological University Hyderabad
          </strong>{' '}
          B.Tech students prepare effectively and pass their semester examinations with confidence.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Our mission</h2>
          <p className="mt-3 text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200">
            No student should fail due to a lack of proper exam preparation materials.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            How we prepare important questions
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            The important questions available on this website are carefully prepared through a detailed analysis
            process:
          </p>
          <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-400">
            {[
              "We analyze previous years' question papers.",
              'We study both Regular and Supplementary examinations.',
              'We cover all regulations, including R18, R22, and future regulations.',
              'We identify the most frequently repeated questions.',
              'We predict highly probable questions for upcoming semester exams.',
              'We organize all questions in a unit-wise format for easy preparation.',
            ].map((text) => (
              <li key={text} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Proven accuracy</h2>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
            Before publishing these important questions, we have tested them with students from several affiliated
            colleges over the past three years.
          </p>
          <p className="mt-3 font-medium leading-relaxed text-slate-800 dark:text-slate-200">The results have been highly encouraging:</p>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
            On average, up to <strong className="text-emerald-800 dark:text-emerald-300">96%</strong> of the questions
            appearing in the final examinations were covered in the important questions provided on our website.
          </p>
          <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">
            This consistent performance has made our platform a trusted resource for many students.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Completely free for all students
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            We believe that quality educational resources should be accessible to everyone. That is why all important
            questions on this website are provided completely free of cost.
          </p>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            Our goal is to support every B.Tech student and improve their chances of success in examinations.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Continuous updates</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            Important questions are updated regularly based on the latest analysis and trends.
          </p>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
            Update schedule
          </p>
          <ul className="mt-3 space-y-3 text-slate-600 dark:text-slate-400">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>Updates begin approximately three months before each examination.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>Questions may be revised and improved continuously.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>
                Updates can occur at any time, including up to two hours before the exam, to provide the most accurate
                and relevant predictions.
              </span>
            </li>
          </ul>
          <p className="mt-4 font-medium leading-relaxed text-slate-800 dark:text-slate-200">
            We strongly recommend students to check the website frequently for the latest updates.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
            Student feedback and live ratings
          </h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            After your examination, if you find that the questions provided on our website were helpful, please visit
            our{' '}
            <Link
              to="/ratings"
              className="font-medium text-sky-600 underline decoration-sky-600/30 underline-offset-2 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Rating page
            </Link>{' '}
            and submit your feedback.
          </p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
            Your ratings and reviews
          </p>
          <ul className="mt-3 space-y-3 text-slate-600 dark:text-slate-400">
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>Help other students trust the platform.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>Allow us to improve our predictions.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
              <span>Motivate us to continue providing this service for free.</span>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Our vision</h2>
          <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
            Our vision is to become the most trusted academic platform for JNTUH students and to help thousands of
            students prepare smarter, score better, and achieve academic success.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">Note</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            While we strive to provide highly accurate and well-researched important questions, these materials are
            intended as a study aid and prediction resource. Students are encouraged to use them alongside their
            regular preparation and syllabus study.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {SITE_NAME} is an independent educational project and is{' '}
            <strong className="text-slate-800 dark:text-slate-200">not affiliated with or endorsed by</strong> JNTUH
            or any government body. Treat content as a supplement to textbooks, notes, and classroom teaching.
          </p>
        </section>

        <p className="mt-10 text-center font-display text-lg font-semibold tracking-tight text-slate-900 dark:text-white md:text-xl">
          {FOOTER_TAGLINE}
        </p>

        <p className="mt-10 text-sm text-slate-500 dark:text-slate-500">
          Questions about using the site? See the{' '}
          <Link
            to="/help"
            className="font-medium text-sky-600 underline decoration-sky-600/30 underline-offset-2 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            Help center
          </Link>
          .
        </p>
      </div>
    </>
  )
}
