import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { AdminModal } from '@/components/admin/AdminModal'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import {
  adminDeleteUserProfile,
  adminFetchUserProfile,
  adminListUsers,
  adminUpdateUserProfile,
} from '@/services/adminApi'
import type { UserDegree, UserRole } from '@/types/models'

const DEGREES: UserDegree[] = ['btech', 'bpharm', 'other']
const ROLES: UserRole[] = ['student', 'admin']

export function AdminUsersPage() {
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminListUsers(),
  })

  const { data: profile, isPending: profilePending } = useQuery({
    queryKey: ['admin', 'user', editingId],
    queryFn: () => adminFetchUserProfile(editingId!),
    enabled: Boolean(editingId),
  })

  const delMut = useMutation({
    mutationFn: adminDeleteUserProfile,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
      void qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setEditingId(null)
    },
  })

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Edit Firestore profiles or remove a user document. This does not delete the Firebase Authentication account — use the Firebase console for that."
      />

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">UID</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Roll no.</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-100">{u.displayName ?? '—'}</p>
                      <p className="text-xs text-slate-500">{u.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-slate-400">{u.id}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-200'
                            : 'bg-slate-500/20 text-slate-300'
                        }`}
                      >
                        {u.role ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{u.rollNumber ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingId(u.id)}
                          className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/10"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={delMut.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Remove Firestore profile for ${u.email ?? u.id}? Auth login will remain until deleted in Firebase console.`,
                              )
                            ) {
                              delMut.mutate(u.id)
                            }
                          }}
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingId && profilePending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-sm text-white">
          Loading profile…
        </div>
      ) : null}
      {editingId && !profilePending && profile ? (
        <UserEditModal
          key={editingId}
          uid={editingId}
          initial={profile}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            void qc.invalidateQueries({ queryKey: ['admin', 'users'] })
            void qc.invalidateQueries({ queryKey: ['admin', 'user', editingId] })
            setEditingId(null)
          }}
        />
      ) : null}
      {editingId && !profilePending && !profile ? (
        <AdminModal title="User" onClose={() => setEditingId(null)}>
          <p>Could not load this user profile.</p>
        </AdminModal>
      ) : null}
    </div>
  )
}

function UserEditModal({
  uid,
  initial,
  onClose,
  onSaved,
}: {
  uid: string
  initial: NonNullable<Awaited<ReturnType<typeof adminFetchUserProfile>>>
  onClose: () => void
  onSaved: () => void
}) {
  const [displayName, setDisplayName] = useState(initial.displayName ?? '')
  const [rollNumber, setRollNumber] = useState(initial.rollNumber ?? '')
  const [degree, setDegree] = useState<UserDegree>(initial.degree ?? 'btech')
  const [degreeOther, setDegreeOther] = useState(initial.degreeOther ?? '')
  const [role, setRole] = useState<UserRole>(initial.role ?? 'student')

  const saveMut = useMutation({
    mutationFn: () =>
      adminUpdateUserProfile(uid, {
        displayName: displayName.trim(),
        rollNumber: rollNumber.trim() || null,
        degree,
        degreeOther: degree === 'other' ? degreeOther.trim() || null : null,
        role,
      }),
    onSuccess: onSaved,
  })

  return (
    <AdminModal
      title="Edit user profile"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saveMut.isPending}
            onClick={() => void saveMut.mutate()}
            className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saveMut.isPending ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <p className="mb-3 text-xs text-slate-500">
        UID: <code>{uid}</code>
        <br />
        Email (read-only): {initial.email ?? '—'}
      </p>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs text-slate-500">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Roll number</span>
          <input
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">Degree</span>
          <select
            value={degree}
            onChange={(e) => setDegree(e.target.value as UserDegree)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            {DEGREES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </label>
        {degree === 'other' ? (
          <label className="block">
            <span className="text-xs text-slate-500">Other (specify)</span>
            <input
              value={degreeOther}
              onChange={(e) => setDegreeOther(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="text-xs text-slate-500">Role (Firestore)</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
      {saveMut.isError ? (
        <p className="mt-3 text-sm text-red-300">Save failed. Check Firestore rules.</p>
      ) : null}
    </AdminModal>
  )
}
