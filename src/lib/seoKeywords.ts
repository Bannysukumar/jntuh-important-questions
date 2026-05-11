/** Primary queries we target across the site (homepage, meta templates). */
export const GLOBAL_SEO_KEYWORDS = [
  'Free JNTUH Important Questions',
  'Previous Years Question Analysis',
  'Unit-Wise PDF Downloads',
  'Up to 96% Historical Accuracy',
  'Updated Before Every Examination',
  'JNTUH Regular Supplementary Exams',
  'JNTUH Important Questions',
  'JNTUH Previous Questions',
  'JNTUH PDF Downloads',
  'JNTUH Semester Questions',
  'JNTUH Subject Important Questions',
  'JNTUH R18 Important Questions',
  'JNTUH R22 Important Questions',
  'JNTUH R24 Important Questions',
  'JNTUH B.Tech Question Bank',
  'JNTUH Mid Exam Important Questions',
  'JNTUH External Exam Important Questions',
  'JNTUH ECE Important Questions',
  'JNTUH CSE Important Questions',
  'JNTUH EEE Important Questions',
  'JNTUH Mechanical Important Questions',
  'JNTUH Civil Important Questions',
  'JNTUH Unit Wise Questions',
  'JNTUH Hyderabad',
  'JNTUH Telangana',
] as const

export function unitPageKeywords(set: {
  regulation: string
  branch: string
  semester: string
  subjectName: string
  subjectCode: string
  unitNumber: number
}): string[] {
  const b = set.branch.toUpperCase()
  const reg = set.regulation.toUpperCase()
  return [
    ...GLOBAL_SEO_KEYWORDS.slice(0, 8),
    `${set.subjectName} important questions`,
    `${set.subjectCode} JNTUH`,
    `JNTUH ${b} important questions`,
    `JNTUH ${reg} ${b}`,
    `Semester ${set.semester} JNTUH ${b}`,
    `Unit ${set.unitNumber} important questions JNTUH`,
  ]
}
