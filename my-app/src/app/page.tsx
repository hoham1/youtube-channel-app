"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { formatDistanceToNow } from "date-fns";

const supabase = createClient(
  "https://xfzwldurdjffspoynytq.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmendsZHVyZGpmZnNwb3lueXRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjAzNTAsImV4cCI6MjA2MTQ5NjM1MH0.lGFfL4BId8q2Ts1b7Bx0wvuaOzAL1GHHPBi8Q1zbxHE"
);

const CATEGORY_LIST = ["🍳 요리", "🎮 게임", "🧘 건강", "💬 리뷰"];

export default function Home() {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState(CATEGORY_LIST[0]);
  const [channels, setChannels] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("전체");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setChannels(data || []);
  };

  const handleSubmit = async () => {
    if (!name || !url || !user) return alert("모든 입력칸을 채워주세요!");
    const { error } = await supabase.from("channels").insert({
      name,
      url,
      category,
      user_id: user.id,
    });
    if (error) return alert("등록 실패: " + error.message);
    alert("등록 완료!");
    setName("");
    setUrl("");
    setCategory(CATEGORY_LIST[0]);
    fetchChannels();
  };

  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("channels").delete().eq("id", id);
    if (error) return alert("삭제 실패: " + error.message);
    fetchChannels();
  };

  const handleUpdate = async (
    id: number,
    name: string,
    url: string,
    category: string
  ) => {
    const { error } = await supabase
      .from("channels")
      .update({ name, url, category })
      .eq("id", id);
    if (error) return alert("수정 실패: " + error.message);
    fetchChannels();
  };

  const filteredChannels = channels.filter((ch) => {
    const matchesSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "전체" || ch.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-white p-4 sm:p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">📺 유튜브 채널 등록</h1>

      {!user ? (
        <LoginForm setUser={setUser} />
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md mb-6">
            <label className="block mb-2 font-semibold">채널 이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 정보꿀단지"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 font-semibold">채널 URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="예: https://youtube.com/@info"
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />

            <label className="block mb-2 font-semibold">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            >
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              ✅ 등록하기
            </button>
          </div>

          <div className="w-full max-w-2xl mb-4 grid gap-2 sm:flex sm:items-center sm:justify-between">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 채널 이름 검색..."
              className="w-full sm:w-auto flex-1 border rounded-lg p-2"
            />

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto border rounded-lg p-2"
            >
              <option value="전체">전체</option>
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <p className="mb-4 text-sm text-gray-600">총 등록된 채널: {filteredChannels.length}개</p>

          <div className="grid gap-4 w-full max-w-2xl">
            {filteredChannels.map((channel) => (
              <EditableCard
                key={channel.id}
                channel={channel}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function EditableCard({ channel, onDelete, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(channel.name);
  const [editUrl, setEditUrl] = useState(channel.url);
  const [editCategory, setEditCategory] = useState(channel.category);

  const handleSave = () => {
    onUpdate(channel.id, editName, editUrl, editCategory);
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow border border-gray-200 flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold">
        {channel.name.charAt(0).toUpperCase()}
      </div>

      {editing ? (
        <div className="flex-1">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <input
            value={editUrl}
            onChange={(e) => setEditUrl(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />
          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          >
            {CATEGORY_LIST.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              💾 저장
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              ❌ 취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            <h2 className="text-xl font-bold">📡 {channel.name}</h2>
            <a
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline break-all"
            >
              {channel.url}
            </a>
            <p className="text-sm text-gray-500 mt-1">카테고리: {channel.category}</p>
            <p className="text-xs text-gray-400">
              등록: {formatDistanceToNow(new Date(channel.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-indigo-500 hover:underline"
            >
              ✏️ 수정
            </button>
            <button
              onClick={() => onDelete(channel.id)}
              className="text-sm text-red-500 hover:underline"
            >
              🗑 삭제
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LoginForm({ setUser }: { setUser: any }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return setMessage("로그인 실패: " + error.message);
    setMessage("이메일로 로그인 링크를 보냈습니다.");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm text-center">
      <h2 className="text-xl font-bold mb-2">이메일 로그인</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일 주소 입력"
        className="w-full border p-2 rounded mb-4"
      />
      <button
        onClick={handleLogin}
        className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
      >
        로그인 링크 보내기
      </button>
      {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
    </div>
  );
}
