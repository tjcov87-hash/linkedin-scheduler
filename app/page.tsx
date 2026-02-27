"use client";

import { useState } from "react";

export default function Home() {
  const [industry, setIndustry] = useState("logistics");
  const [generatedPost, setGeneratedPost] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [email, setEmail] = useState("tjcov87@gmail.com");
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [message, setMessage] = useState("");
  const [newsHeadlines, setNewsHeadlines] = useState<string[]>([]);

  const generatePost = async () => {
    setLoading(true);
    setMessage("");
    setGeneratedPost("");
    setNewsHeadlines([]);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry }),
      });
      const data = await res.json();
      if (data.post) {
        setGeneratedPost(data.post);
        setNewsHeadlines(data.headlines || []);
      } else {
        setMessage("Failed to generate post. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const schedulePost = async () => {
    if (!generatedPost || !scheduledTime || !email) {
      setMessage("Please generate a post and set a date/time first.");
      return;
    }
    setScheduling(true);
    setMessage("");
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: generatedPost, scheduledTime, email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Post scheduled! You will receive an email reminder at the scheduled time.");
      } else {
        setMessage("Failed to schedule post. Please try again.");
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
    setScheduling(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LinkedIn Post Scheduler</h1>
        <p className="text-gray-500 mb-8">Generate AI-powered LinkedIn posts based on the latest industry news and schedule email reminders.</p>

        {/* Industry Input */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry / Topic</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. logistics, supply chain, freight"
          />
          <button
            onClick={generatePost}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Fetching news & generating post..." : "Generate Post"}
          </button>
        </div>

        {/* News Headlines */}
        {newsHeadlines.length > 0 && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Latest News Used</h2>
            <ul className="space-y-1">
              {newsHeadlines.map((headline, i) => (
                <li key={i} className="text-sm text-gray-500 flex gap-2">
                  <span className="text-blue-400">•</span> {headline}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Generated Post */}
        {generatedPost && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Generated Post (edit if needed)</label>
            <textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              rows={10}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Schedule */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Send reminder to</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={schedulePost}
              disabled={scheduling}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {scheduling ? "Scheduling..." : "Schedule & Get Email Reminder"}
            </button>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`rounded-xl p-4 text-sm font-medium ${message.includes("scheduled") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
