import { useMutation, useQuery, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthModal } from '@/contexts/AuthModalContext'
import { shouldBlockComment } from '@/lib/moderation'
import { COMMENTS_SECTION_INTRO } from '@/lib/siteMessaging'
import { addComment, deleteMyComment, fetchCommentsForQuestion } from '@/services/commentsApi'
import type { CommentDoc } from '@/types/models'

const MAX_THREAD_DEPTH = 6

function hasReplies(id: string, all: CommentDoc[]): boolean {
  return all.some((c) => c.parentId === id)
}

function sortRoots(roots: CommentDoc[]): CommentDoc[] {
  return [...roots].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return a.createdAt.localeCompare(b.createdAt)
  })
}

function sortReplies(replies: CommentDoc[]): CommentDoc[] {
  return [...replies].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function CommentSection({ questionSetId }: { questionSetId: string }) {
  const { user, loading, isAdmin } = useAuth()
  const { openAuth } = useAuthModal()
  const qc = useQueryClient()
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState<CommentDoc | null>(null)
  const [replyBody, setReplyBody] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['comments', questionSetId],
    queryFn: () => fetchCommentsForQuestion(questionSetId),
  })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('login')
      if (shouldBlockComment(body)) throw new Error('blocked')
      await addComment({
        questionSetId,
        authorUid: user.uid,
        authorName: formatAuthorName(user.displayName ?? user.email ?? 'Student', isAdmin),
        body: body.trim(),
        parentId: null,
      })
    },
    onSuccess: () => {
      setBody('')
      void qc.invalidateQueries({ queryKey: ['comments', questionSetId] })
    },
  })

  const replyMut = useMutation({
    mutationFn: async () => {
      if (!user || !replyTo) throw new Error('login')
      if (shouldBlockComment(replyBody)) throw new Error('blocked')
      await addComment({
        questionSetId,
        authorUid: user.uid,
        authorName: formatAuthorName(user.displayName ?? user.email ?? 'Student', isAdmin),
        body: replyBody.trim(),
        parentId: replyTo.id,
      })
    },
    onSuccess: () => {
      setReplyBody('')
      setReplyTo(null)
      void qc.invalidateQueries({ queryKey: ['comments', questionSetId] })
    },
  })

  const delMut = useMutation({
    mutationFn: (id: string) => deleteMyComment(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['comments', questionSetId] }),
  })

  if (loading) return <p className="text-sm text-slate-500">Loading comments…</p>

  const idSet = new Set(data.map((c) => c.id))
  const roots = sortRoots(
    data.filter((c) => !c.parentId || !idSet.has(c.parentId)),
  )

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Comments</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {COMMENTS_SECTION_INTRO} Sign in to post and reply; everyone can read threads. Admins are labeled when they
        participate.
      </p>

      {user ? (
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            placeholder="Ask a doubt or share a tip (be respectful)…"
          />
          {mutation.isError ? (
            <p className="text-sm text-red-600">
              {mutation.error instanceof Error && mutation.error.message === 'blocked'
                ? 'Comment blocked by spam or language filters.'
                : 'Could not post comment.'}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={!body.trim() || mutation.isPending}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-slate-900"
          >
            Post comment
          </button>
        </form>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-800">
          <button
            type="button"
            onClick={() => openAuth('login')}
            className="font-semibold text-brand-600 underline dark:text-sky-400"
          >
            Log in
          </button>{' '}
          to comment or reply.
        </p>
      )}

      <ul className="mt-6 space-y-2">
        {isLoading ? <li className="text-sm text-slate-500">Loading…</li> : null}
        {!isLoading && roots.length === 0 ? (
          <li className="text-sm text-slate-500">No comments yet — be the first.</li>
        ) : null}
        {roots.map((c) => (
          <CommentThreadNode
            key={c.id}
            comment={c}
            all={data}
            depth={0}
            user={user}
            isAdmin={isAdmin}
            openAuth={openAuth}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyBody={replyBody}
            setReplyBody={setReplyBody}
            replyMut={replyMut}
            delMut={delMut}
          />
        ))}
      </ul>
    </section>
  )
}

function formatAuthorName(name: string, isAdmin: boolean): string {
  if (!isAdmin) return name
  return name.includes('(Admin)') ? name : `${name} (Admin)`
}

function CommentThreadNode({
  comment: c,
  all,
  depth,
  user,
  isAdmin,
  openAuth,
  replyTo,
  setReplyTo,
  replyBody,
  setReplyBody,
  replyMut,
  delMut,
}: {
  comment: CommentDoc
  all: CommentDoc[]
  depth: number
  user: ReturnType<typeof useAuth>['user']
  isAdmin: boolean
  openAuth: ReturnType<typeof useAuthModal>['openAuth']
  replyTo: CommentDoc | null
  setReplyTo: (c: CommentDoc | null) => void
  replyBody: string
  setReplyBody: (s: string) => void
  replyMut: UseMutationResult<void, Error, void, unknown>
  delMut: UseMutationResult<void, Error, string, unknown>
}) {
  const replies = sortReplies(all.filter((x) => x.parentId === c.id))
  const canReply = user && depth < MAX_THREAD_DEPTH
  const isMine = user?.uid === c.authorUid
  const showDelete = isMine && !hasReplies(c.id, all)
  const isReplying = replyTo?.id === c.id

  return (
    <li>
      <div
        className={`rounded-xl border border-slate-100 p-4 dark:border-slate-800 ${
          depth > 0 ? 'ml-4 border-l-2 border-l-brand-500/40 pl-4 sm:ml-8' : ''
        }`}
      >
        <p className="text-xs font-semibold text-slate-500">
          {c.authorName}
          {c.parentId && !all.some((x) => x.id === c.parentId) ? (
            <span className="ml-2 font-normal normal-case text-slate-400">
              · earlier message hidden
            </span>
          ) : null}
          {c.pinned ? (
            <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              Pinned
            </span>
          ) : null}{' '}
          <span className="font-normal text-slate-400">
            · {new Date(c.createdAt).toLocaleString()}
          </span>
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-100">{c.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {canReply ? (
            <button
              type="button"
              onClick={() => {
                setReplyTo(isReplying ? null : c)
                setReplyBody('')
              }}
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-sky-400"
            >
              {isReplying ? 'Cancel reply' : 'Reply'}
            </button>
          ) : !user ? (
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="text-xs font-semibold text-brand-600 hover:underline dark:text-sky-400"
            >
              Log in to reply
            </button>
          ) : depth >= MAX_THREAD_DEPTH ? (
            <span className="text-xs text-slate-500">Max thread depth reached</span>
          ) : null}
          {showDelete ? (
            <button
              type="button"
              disabled={delMut.isPending}
              onClick={() => {
                if (window.confirm('Delete this comment?')) delMut.mutate(c.id)
              }}
              className="text-xs font-semibold text-red-600 hover:underline dark:text-red-400"
            >
              Delete
            </button>
          ) : isMine && hasReplies(c.id, all) ? (
            <span className="text-xs text-slate-500">Delete unavailable (has replies)</span>
          ) : null}
        </div>

        {isReplying && user ? (
          <form
            className="mt-3 space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800"
            onSubmit={(e) => {
              e.preventDefault()
              replyMut.mutate()
            }}
          >
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              placeholder={`Reply to ${c.authorName}…`}
            />
            {replyMut.isError ? (
              <p className="text-xs text-red-600">
                {replyMut.error instanceof Error && replyMut.error.message === 'blocked'
                  ? 'Blocked by filters.'
                  : 'Could not post reply.'}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!replyBody.trim() || replyMut.isPending}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50 dark:bg-slate-200 dark:text-slate-900"
            >
              Post reply
            </button>
          </form>
        ) : null}
      </div>
      {replies.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {replies.map((ch) => (
            <CommentThreadNode
              key={ch.id}
              comment={ch}
              all={all}
              depth={depth + 1}
              user={user}
              isAdmin={isAdmin}
              openAuth={openAuth}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyBody={replyBody}
              setReplyBody={setReplyBody}
              replyMut={replyMut}
              delMut={delMut}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}
