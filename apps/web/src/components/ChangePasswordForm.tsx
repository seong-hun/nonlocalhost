import { useMutation } from "@tanstack/react-query";
import { Check, KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { authApi } from "../services/authApi";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatchError, setMismatchError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.reset();
    setMismatchError(null);

    if (newPassword !== confirmPassword) {
      setMismatchError("새 비밀번호가 서로 일치하지 않습니다");
      return;
    }
    if (newPassword.length < 8) {
      setMismatchError("새 비밀번호는 8자 이상이어야 합니다");
      return;
    }
    mutation.mutate();
  }

  const errorMessage = mismatchError
    ? mismatchError
    : mutation.isError
      ? (mutation.error as { response?: { data?: { error?: { code?: string } } } })?.response?.data
          ?.error?.code === "INVALID_CREDENTIALS"
        ? "현재 비밀번호가 올바르지 않습니다"
        : "비밀번호를 변경하지 못했습니다"
      : null;

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div className="space-y-1">
        <label htmlFor="currentPassword" className="text-sm text-slate-400">
          현재 비밀번호
        </label>
        <input
          id="currentPassword"
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="newPassword" className="text-sm text-slate-400">
          새 비밀번호
        </label>
        <input
          id="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="text-sm text-slate-400">
          새 비밀번호 확인
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}
      {mutation.isSuccess && (
        <p className="flex items-center gap-1.5 rounded-md border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          <Check className="h-4 w-4 shrink-0" />
          비밀번호가 변경되었습니다.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        <KeyRound className="h-4 w-4" />
        {mutation.isPending ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
