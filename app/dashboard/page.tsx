"use client";

import { useState } from "react";

export default function DashboardPage() {

  const [prompt, setPrompt] = useState("");

  const [videoUrl, setVideoUrl] = useState("");

  async function generateAI() {

    alert("AI Generate Success 🚀");

  }

  async function generateVideo() {

    const response = await fetch("/api/render-video", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        title: prompt

      })

    });

    const data = await response.json();

    if (data.video) {

      setVideoUrl(data.video);

    }
async function generateVideo() {

  const response = await fetch("/api/render-video", {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({

      title: prompt

    })

  });

  const data = await response.json();

  setVideoUrl(data.video);

}
  }

  return (

    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-5xl font-black text-fuchsia-500">

        Dashboard AI Creator 🚀

      </h1>

      <p className="text-zinc-400 mt-4">

        AI Video Generator Indonesia

      </p>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Tulis prompt video AI..."
        className="w-full h-40 mt-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 outline-none"
      />

      <div className="flex flex-wrap gap-4 mt-6">

        <button
          onClick={generateAI}
          className="bg-fuchsia-600 hover:bg-fuchsia-700 px-8 py-4 rounded-2xl font-bold"
        >
          🚀 Generate AI
        </button>

        <button
          onClick={generateVideo}
          className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-2xl font-bold"
        >
          🎬 Generate Video
        </button>
{videoUrl && (

  <video
    controls
    className="w-full rounded-2xl mt-6"
  >

    <source
      src={videoUrl}
      type="video/mp4"
    />

  </video>

)}
      </div>

      {videoUrl && (

        <video
          controls
          className="w-full rounded-3xl mt-10"
        >

          <source
            src={videoUrl}
            type="video/mp4"
          />

        </video>

      )}

    </main>

  );

}