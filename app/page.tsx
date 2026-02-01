"use client";

import { useState, FormEvent, ChangeEvent } from "react";

interface FormState {
  name: string;
  surname: string;
  email: string;
}

type StatusType = "loading" | "success" | "error" | string | null;

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    surname: "",
    email: "",
  });
  const [status, setStatus] = useState<StatusType>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) setStatus("success");
    else setStatus(data.error || "error");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <main className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">Subscribe</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Surname</label>
            <input
              value={form.surname}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, surname: e.target.value })
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, email: e.target.value })
              }
              className="mt-1 block w-full rounded border-gray-300 shadow-sm"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {status === "loading" ? "Saving..." : "Subscribe"}
            </button>
          </div>

          {status === "success" && (
            <p className="text-green-600">Thanks — saved!</p>
          )}
          {status && status !== "success" && status !== "loading" && (
            <p className="text-red-600">{String(status)}</p>
          )}
        </form>
      </main>
    </div>
  );
}
