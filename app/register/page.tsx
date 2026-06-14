"use client";

import { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/lib/firebase";

export default function RegisterPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {

    try {

      await createUserWithEmailAndPassword(

        auth,

        email,

        password

      );

      alert("Register berhasil 🚀");

      window.location.href = "/login";

    } catch (error: any) {

      alert(error.message);

    }

  }

  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="bg-zinc-900 p-10 rounded-3xl w-full max-w-md border border-zinc-800">

        <h1 className="text-4xl font-black text-fuchsia-500">

          🚀 Register AI Creator

        </h1>

        <p className="text-zinc-400 mt-4">

          Buat akun AI Creator Indonesia

        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-8 bg-black border border-zinc-800 rounded-2xl p-4 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-4 bg-black border border-zinc-800 rounded-2xl p-4 outline-none"
        />

        <button
          onClick={register}
          className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 py-4 rounded-2xl font-bold mt-6"
        >
          🚀 Register
        </button>

        <a
          href="/login"
          className="block text-center mt-6 text-zinc-400"
        >
          Sudah punya akun? Login
        </a>

      </div>

    </main>

  );

}