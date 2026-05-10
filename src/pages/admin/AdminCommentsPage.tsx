import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { questionSetPublicPath } from '@/lib/adminPaths'
import {
  addComment,
  adminDeleteComment,
  adminDeleteCommentCascade,
  adminFetchAllComments,
  adminUpdateComment,
} from '@/services/commentsApi'
import { adminListAllQuestionSets } from '@/services/questionsApi'
import type { CommentDoc } from '@/types/models'

function formatAdminReplyName(name: string): string {
  return name.includes('(Admin)') ? name : `${name} (Admin)`
}

function depthInForest(c: CommentDoc, full: CommentDoc[]): number {
  const byId = new Map(full.map((x) => [x.id, x] as const))
  let d = 0
  let cur: CommentDoc | undefined = c
  while (cur?.parentId) {
    d++
    cur = byId.get(cur.parentId)
    if (d > 30) break
  }
  return d
}

export function AdminCommentsPage() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const [filter, setFilter] = useState<'all' | CommentDoc['status']>('all')
  const [replyTarget, setReplyTarget] = useState<CommentDoc | null>(null)
  const [replyBody, setReplyBody] = useState('')

  const { data: sets = [] } = useQuery({
    queryKey: ['admin', 'questionSets'],
    queryFn: () => adminListAllQuestionSets(),
  })
  const pathBySetId = useMemo(
    () => Object.fromEntries(sets.map((s) => [s.id, questionSetPublicPath(s)] as const)),
    [sets],
  )

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['admin', 'comments'],
    queryFn: () => adminFetchAllComments(500),
  })

  const visible = useMemo(() => {
    if (filter === 'all') return comments
    return comments.filter((c) => c.status === filter)
  }, [comments, filter])

  const byQuestionSet = useMemo(() => {
    const m = new Map<string, CommentDoc[]>()
    for (const c of visible) {
      if (!m.has(c.questionSetId)) m.set(c.questionSetId, [])
      m.get(c.questionSetId)!.push(c)
    }
    for (const list of m.values()) {
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [visible])

  const mut = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Pick<CommentDoc, 'status' | 'pinned'>> }) =>
      adminUpdateComment(id, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'comments'] }),
  })

  const delMut = useMutation({
    mutationFn: adminDeleteComment,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'comments'] })
      void qc.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  const delCascadeMut = useMutation({
    mutationFn: ({ id, snapshot }: { id: string; snapshot: CommentDoc[] }) =>
      adminDeleteCommentCascade(id, snapshot),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'comments'] })
      void qc.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  const replyMut = useMutation({
    mutationFn: async () => {
      if (!user || !replyTarget) throw new Error('auth')
      await addComment({
        questionSetId: replyTarget.questionSetId,
        authorUid: user.uid,
        authorName: formatAdminReplyName(user.displayName ?? user.email ?? 'Admin'),
        body: replyBody.trim(),
        parentId: replyTarget.id,
      })
    },
    onSuccess: () => {
      setReplyBody('')
      setReplyTarget(null)
      void qc.invalidateQueries({ queryKey: ['admin', 'comments'] })
      void qc.invalidateQueries({ queryKey: ['comments'] })
    },
  })

  return (
    <div>
      <AdminPageHeader
        title="Comments"
        description="Moderate threads, reply as staff (shown with Admin label), or delete single comments / whole subtrees. Public users see visible comments and can reply on unit pages when signed in."
        actions={
          <div className="flex flex-wrap gap-2">
            {(['all', 'visible', 'hidden', 'flagged'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />

      {!user ? (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
          Sign in to post admin replies from this screen.
        </p>
      ) : null}

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="space-y-8">
          {byQuestionSet.map(([qid, list]) => {
            const unitPath = pathBySetId[qid]
            return (
              <section key={qid} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
                <h3 className="text-sm font-semibold text-slate-300">
                  Question set{' '}
                  <code className="rounded bg-black/40 px-1.5 text-cyan-400">{qid}</code>
                  {unitPath ? (
                    <Link to={unitPath} className="ml-2 text-xs text-cyan-400 hover:underline">
                      View unit →
                    </Link>
                  ) : null}
                </h3>
                <div className="mt-3 space-y-3">
                  {list.map((c) => {
                    const depth = depthInForest(c, comments)
                    const isReplying = replyTarget?.id === c.id
                    return (
                      <article
                        key={c.id}
                        className="rounded-xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur"
                        style={{ marginLeft: Math.min(depth, 10) * 12 }}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-slate-200">{c.authorName}</p>
                            <p className="text-xs text-slate-500">
                              {c.authorUid} · {c.parentId ? `reply to ${c.parentId.slice(0, 8)}…` : 'root'} ·{' '}
                              {new Date(c.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <select
                              value={c.status}
                              disabled={mut.isPending}
                              onChange={(e) =>
                                mut.mutate({
                                  id: c.id,
                                  patch: { status: e.target.value as CommentDoc['status'] },
                                })
                              }
                              className="rounded-lg border border-white/15 bg-slate-950 px-2 py-1.5 text-xs text-white"
                            >
                              <option value="visible">visible</option>
                              <option value="hidden">hidden</option>
                              <option value="flagged">flagged</option>
                            </select>
                            <label className="flex items-center gap-1 text-xs text-slate-400">
                              <input
                                type="checkbox"
                                checked={c.pinned}
                                onChange={(e) =>
                                  mut.mutate({ id: c.id, patch: { pinned: e.target.checked } })
                                }
                                className="rounded border-white/20 bg-slate-950"
                              />
                              Pin
                            </label>
                            <button
                              type="button"
                              disabled={!user}
                              onClick={() => {
                                setReplyTarget(isReplying ? null : c)
                                setReplyBody('')
                              }}
                              className="rounded-lg border border-cyan-500/40 px-2 py-1 text-xs text-cyan-300 hover:bg-cyan-500/10 disabled:opacity-40"
                            >
                              {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                            <button
                              type="button"
                              disabled={delMut.isPending}
                              onClick={() => {
                                if (window.confirm('Delete this comment only?')) delMut.mutate(c.id)
                              }}
                              className="rounded-lg border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              disabled={delCascadeMut.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    'Delete this comment and ALL nested replies under it?',
                                  )
                                ) {
                                  delCascadeMut.mutate({ id: c.id, snapshot: comments })
                                }
                              }}
                              className="rounded-lg border border-red-500/50 px-2 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/15"
                            >
                              Delete thread
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                          {c.body}
                        </p>

                        {isReplying && user ? (
                          <form
                            className="mt-4 space-y-2 border-t border-white/10 pt-4"
                            onSubmit={(e) => {
                              e.preventDefault()
                              replyMut.mutate()
                            }}
                          >
                            <textarea
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
                              placeholder="Official reply…"
                            />
                            {replyMut.isError ? (
                              <p className="text-xs text-red-300">Could not post (check rules / parent).</p>
                            ) : null}
                            <button
                              type="submit"
                              disabled={!replyBody.trim() || replyMut.isPending}
                              className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Post reply
                            </button>
                          </form>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
          {visible.length === 0 ? (
            <p className="py-12 text-center text-slate-500">No comments in this filter.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
