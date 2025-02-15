"use client";
import { useState } from 'react';

type Status = 'initial' | 'opened' | 'typing';

export default function BrowserControl() {
  const [wpm, setWpm] = useState<number>(75);
  const [errorRate, setErrorRate] = useState<number>(0.2);
  const [text, setText] = useState<string>(""); // new state for text input
  const [message, setMessage] = useState<string>('');
  const [status, setStatus] = useState<Status>('initial');

  const callEndpoint = async (endpoint: string, method = "GET", body?: any) => {
    try {
      const res = await fetch(`http://localhost:3001/browser/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setMessage(JSON.stringify(data));
    } catch (error: any) {
      setMessage(error.toString());
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center space-y-4 p-4 text-black">
    <div className="absolute top-4 left-4">
        <button
            onClick={() => {
                window.location.href = "/";
            }}
            className="px-4 py-2 rounded text-white bg-indigo-600"
        >
            Go to Home
        </button>
    </div>
      <h1 className="text-2xl font-bold text-white">Browser Typing Control</h1>
      <div className="flex flex-col space-y-2 text-white w-full items-center justify-center">
        <label>
          WPM:
          <input
            type="number"
            value={wpm}
            onChange={(e) => setWpm(parseFloat(e.target.value))}
            className="ml-2 px-2 py-1 border rounded text-black"
          />
        </label>
        <label>
          Error Rate (0-1):
          <input
            type="number"
            step="0.05"
            value={errorRate}
            onChange={(e) => setErrorRate(parseFloat(e.target.value))}
            className="ml-2 px-2 py-1 border rounded text-black"
          />
        </label>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={() => {
            callEndpoint("open");
            setStatus("opened");
          }}
          disabled={status !== "initial"}
          className={`px-4 py-2 rounded text-white ${status !== "initial" ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          Open
        </button>
        <button
          onClick={() => {
            callEndpoint("start", "POST", { wpm, error_rate: errorRate, text }); // include text in the payload
            setStatus("typing");
          }}
          disabled={status !== "opened"}
          className={`px-4 py-2 rounded text-white ${status !== "opened" ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          Start Typing
        </button>
        <button
          onClick={() => {
            callEndpoint("pause", "POST");
          }}
          disabled={status !== "typing"}
          className={`px-4 py-2 rounded text-white ${status !== "typing" ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          Pause
        </button>
        <button
          onClick={() => {
            callEndpoint("resume", "POST");
          }}
          disabled={status !== "typing"}
          className={`px-4 py-2 rounded text-white ${status !== "typing" ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          Resume
        </button>
        <button
          onClick={() => {
            callEndpoint("close", "POST");
            setStatus("initial");
          }}
          disabled={status == "initial"}
          className={`px-4 py-2 rounded text-white ${status == "initial" ? "bg-gray-500" : "bg-indigo-600"}`}
        >
          Close
        </button>
      </div>
      {message && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <strong>Response:</strong> {message}
        </div>
      )}
      <label className="w-full text-white">
        Enter your text here:
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          style={{ minHeight: "1000px" }}
          className="px-2 py-1 rounded text-white w-full overflow-hidden bg-[#f9f9f911]"
        />
      </label>
    </div>
  );
}