import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Data
const modules = [
  {
    id: 1,
    title: "Unit 1",
    lectures: Array.from({ length: 6 }, (_, i) => ({
      id: i + 1,
      title: `Lecture ${i + 1}`,
      mastery: Math.floor(Math.random() * 100)
    }))
  },
  {
    id: 2,
    title: "Unit 2",
    lectures: Array.from({ length: 8 }, (_, i) => ({
      id: i + 7,
      title: `Lecture ${i + 7}`,
      mastery: Math.floor(Math.random() * 100)
    }))
  }
];

export default function App() {
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [activeTab, setActiveTab] = useState("guide");

  const allLectures = modules.flatMap((m) => m.lectures);

  return (
    <div className="flex h-screen">
      {/* SIDEBAR */}
      <div className="w-64 border-r p-4 space-y-4 bg-white">
        <h1 className="text-lg font-semibold">Biology 101</h1>

        <div className="text-xs text-gray-500">Continue</div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setSelectedLecture(allLectures[0])}
        >
          Resume Lecture 1
        </Button>

        <div className="mt-4 space-y-3">
          {modules.map((module) => (
            <div key={module.id}>
              <p className="text-xs text-gray-400 mb-1">{module.title}</p>
              <div className="space-y-1">
                {module.lectures.map((lec) => (
                  <div
                    key={lec.id}
                    onClick={() => setSelectedLecture(lec)}
                    className={`px-2 py-1 rounded cursor-pointer text-sm ${
                      selectedLecture?.id === lec.id
                        ? "bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {lec.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        {!selectedLecture ? (
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold mb-4">Welcome back</h2>
            <p className="text-sm text-gray-600 mb-6">
              Pick up where you left off or select a lecture from the sidebar.
            </p>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm">Course Progress</p>
                <div className="w-full bg-gray-200 h-2 rounded mt-2">
                  <div className="bg-black h-2 rounded" style={{ width: "45%" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {selectedLecture.title}
              </h2>
              <p className="text-sm text-gray-500">
                Mastery {selectedLecture.mastery}%
              </p>
            </div>

            {/* TABS */}
            <div className="flex gap-4 border-b mb-6 text-sm">
              {[
                { key: "guide", label: "Guide" },
                { key: "practice", label: "Practice" },
                { key: "review", label: "Review" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pb-2 ${
                    activeTab === tab.key
                      ? "border-b-2 border-black font-medium"
                      : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* GUIDE TAB */}
            {activeTab === "guide" && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-medium">Key Concepts</h3>
                  <ul className="list-disc ml-5 text-sm space-y-1">
                    <li>Core Idea 1</li>
                    <li>Core Idea 2</li>
                    <li>Core Idea 3</li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* PRACTICE TAB */}
            {activeTab === "practice" && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm mb-3">
                    What is the main concept of this lecture?
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Option A
                    </Button>
                    <Button variant="outline" className="w-full">
                      Option B
                    </Button>
                    <Button variant="outline" className="w-full">
                      Option C
                    </Button>
                    <Button variant="outline" className="w-full">
                      Option D
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* REVIEW TAB */}
            {activeTab === "review" && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">
                    Weak areas will appear here after you complete quizzes.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
