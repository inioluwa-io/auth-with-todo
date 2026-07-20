'use client';

import React, { useEffect, useState } from 'react';

type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  tags: string[];
  createdAt: string;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filterTag) params.set('tag', filterTag);

      const res = await fetch('/api/todos?' + params.toString());
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [search, filterTag]);

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => setTags((s) => s.filter((x) => x !== t));

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), tags }),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setTags([]);
        await fetchTodos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const res = await fetch('/api/todos/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      if (res.ok) await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this todo?')) return;
    try {
      const res = await fetch('/api/todos/' + id, { method: 'DELETE' });
      if (res.ok) await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const uniqueTags = Array.from(new Set(todos.flatMap((t) => t.tags)));

  return (
    <div className="mt-8 space-y-6">
      <div className="flex gap-2">
        <input
          placeholder="Search todos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md px-3 py-2 bg-gray-800 text-white"
        />
        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="rounded-md px-3 py-2 bg-gray-800 text-white">
          <option value="">Filter by tag</option>
          {uniqueTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={() => { setSearch(''); setFilterTag(''); }} className="rounded-md bg-orange-600 px-3 py-2 text-white">Clear</button>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 rounded-lg bg-gray-900 p-4 border border-orange-500">
        <div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-md px-3 py-2 bg-gray-800 text-white" />
        </div>
        <div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full rounded-md px-3 py-2 bg-gray-800 text-white" />
        </div>
        <div className="flex gap-2">
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" className="rounded-md px-3 py-2 bg-gray-800 text-white" />
          <button type="button" onClick={handleAddTag} className="rounded-md bg-orange-600 px-3 py-2 text-white">Add Tag</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-2 py-1 text-sm text-white">
              {t}
              <button type="button" onClick={() => handleRemoveTag(t)} className="text-red-400">x</button>
            </span>
          ))}
        </div>
        <div>
          <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white">Create Todo</button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="text-orange-500">Loading todos...</div>
        ) : todos.length === 0 ? (
          <div className="text-gray-400">No todos found.</div>
        ) : (
          todos.map((todo) => (
            <div key={todo._id} className="rounded-lg bg-gray-900 p-4 border border-gray-700 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={todo.completed} onChange={() => toggleComplete(todo._id, todo.completed)} />
                  <div>
                    <div className={`text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-orange-100'}`}>{todo.title}</div>
                    {todo.description && <div className="text-sm text-gray-400">{todo.description}</div>}
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {todo.tags.map((t) => (
                        <button key={t} onClick={() => setFilterTag(t)} className="rounded-md bg-gray-700 px-2 py-1 text-sm text-white">{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => handleDelete(todo._id)} className="rounded-md bg-red-600 px-3 py-1 text-white">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
