'use client';

import React, { useEffect, useMemo, useState } from 'react';

type TodoStatus = 'todo' | 'in-progress' | 'done';

type Todo = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  status: TodoStatus;
  tags: string[];
  createdAt: string;
};

const COLUMNS: { key: TodoStatus; label: string; badgeClass: string; dotClass: string }[] = [
  { key: 'todo', label: 'To Do', badgeClass: 'bg-gray-600', dotClass: 'bg-gray-400' },
  { key: 'in-progress', label: 'In Progress', badgeClass: 'bg-orange-600', dotClass: 'bg-orange-400' },
  { key: 'done', label: 'Done', badgeClass: 'bg-green-600', dotClass: 'bg-green-400' },
];

const nextStatus: Record<TodoStatus, TodoStatus | null> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: null,
};
const prevStatus: Record<TodoStatus, TodoStatus | null> = {
  todo: null,
  'in-progress': 'todo',
  done: 'in-progress',
};

const emptyForm = { title: '', description: '', tags: [] as string[], status: 'todo' as TodoStatus };

export default function TaskBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (filterTag) params.set('tag', filterTag);
      const res = await fetch('/api/todos?' + params.toString());
      if (res.ok) {
        const data = await res.json();
        setTodos(data.todos || []);
      } else {
        setError('Failed to load tasks');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/todos/tags');
      if (res.ok) {
        const data = await res.json();
        setAllTags(data.tags || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterTag]);

  useEffect(() => {
    fetchTags();
  }, []);

  const stats = useMemo(() => {
    const total = todos.length;
    const done = todos.filter((t) => t.status === 'done').length;
    const inProgress = todos.filter((t) => t.status === 'in-progress').length;
    const todo = todos.filter((t) => t.status === 'todo').length;
    return { total, done, inProgress, todo };
  }, [todos]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagInput('');
    setShowForm(true);
  };

  const openEditForm = (t: Todo) => {
    setEditingId(t._id);
    setForm({ title: t.title, description: t.description || '', tags: [...t.tags], status: t.status });
    setTagInput('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setTagInput('');
  };

  const addTagToForm = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const removeTagFromForm = (t: string) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const saveForm = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    try {
      const url = editingId ? '/api/todos/' + editingId : '/api/todos';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          tags: form.tags,
          status: form.status,
        }),
      });
      if (res.ok) {
        closeForm();
        await fetchTodos();
        await fetchTags();
      } else {
        setError(editingId ? 'Failed to update task' : 'Failed to create task');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch('/api/todos/' + id, { method: 'DELETE' });
      if (res.ok) {
        await fetchTodos();
        await fetchTags();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveTodo = async (todo: Todo, direction: 'next' | 'prev') => {
    const target = direction === 'next' ? nextStatus[todo.status] : prevStatus[todo.status];
    if (!target) return;
    try {
      const res = await fetch('/api/todos/' + todo._id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: target }),
      });
      if (res.ok) await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const todosByStatus = (status: TodoStatus) => todos.filter((t) => t.status === status);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex flex-col gap-4 rounded-lg bg-gray-800 p-8 shadow-2xl border-b-2 border-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500">All your tasks in one board</h1>
          <p className="mt-2 text-gray-400">Organize, prioritize and complete tasks with ease.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="whitespace-nowrap rounded-md bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-500 transition"
        >
          + New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Tasks" value={stats.total} />
        <StatCard label="To Do" value={stats.todo} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Done" value={stats.done} />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 rounded-lg bg-gray-900 p-4 border border-orange-500">
        <input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[180px] flex-1 rounded-md px-3 py-2 bg-gray-800 text-white placeholder:text-gray-500"
        />
        {/* <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="rounded-md px-3 py-2 bg-gray-800 text-white"
        >
          <option value="">Filter by tag</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select> */}
        <button
          onClick={() => {
            setSearch('');
            setFilterTag('');
          }}
          className="rounded-md bg-orange-600 px-3 py-2 text-white hover:bg-orange-500 transition"
        >
          Clear
        </button>
      </div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {/* Board */}
      {loading ? (
        <div className="text-orange-500">Loading tasks...</div>
      ) : todos.length === 0 ? (
        <div className="rounded-lg bg-gray-800 p-12 text-center border border-gray-700">
          <p className="text-gray-400">No tasks yet.</p>
          <button
            onClick={openCreateForm}
            className="mt-4 rounded-md bg-orange-600 px-5 py-3 font-medium text-white hover:bg-orange-500 transition"
          >
            Add Your First Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = todosByStatus(col.key);
            return (
              <div key={col.key} className="rounded-lg bg-gray-900 border border-gray-700">
                <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
                  <h3 className="font-semibold text-orange-100">{col.label}</h3>
                  <span className={`rounded-full ${col.badgeClass} px-2 py-0.5 text-xs font-medium text-white`}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-3 p-3 min-h-[80px]">
                  {items.length === 0 ? (
                    <p className="px-1 py-4 text-center text-sm text-gray-500">No tasks</p>
                  ) : (
                    items.map((todo) => (
                      <div
                        key={todo._id}
                        className="rounded-lg bg-gray-800 p-3 border border-gray-700 hover:border-orange-500 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-orange-100">{todo.title}</p>
                          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${col.dotClass}`} />
                        </div>
                        {todo.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-gray-400">{todo.description}</p>
                        )}
                        {todo.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {todo.tags.map((t) => (
                              <button
                                key={t}
                                onClick={() => setFilterTag(t)}
                                className="rounded-md bg-gray-700 px-2 py-0.5 text-[11px] text-gray-200 hover:bg-orange-600 hover:text-white transition"
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-1">
                            <button
                              disabled={!prevStatus[todo.status]}
                              onClick={() => moveTodo(todo, 'prev')}
                              title="Move back"
                              className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              ‹
                            </button>
                            <button
                              disabled={!nextStatus[todo.status]}
                              onClick={() => moveTodo(todo, 'next')}
                              title="Move forward"
                              className="rounded px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-20 disabled:hover:bg-transparent"
                            >
                              ›
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditForm(todo)}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(todo._id)}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            onSubmit={saveForm}
            className="w-full max-w-md space-y-4 rounded-lg bg-gray-900 p-6 border border-orange-500 shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-orange-400">{editingId ? 'Edit Task' : 'New Task'}</h3>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Title"
              className="w-full rounded-md px-3 py-2 bg-gray-800 text-white placeholder:text-gray-500"
              autoFocus
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)"
              className="w-full rounded-md px-3 py-2 bg-gray-800 text-white placeholder:text-gray-500"
              rows={3}
            />
            <div>
              <label className="mb-1 block text-xs font-medium text-orange-400">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TodoStatus }))}
                className="w-full rounded-md px-3 py-2 bg-gray-800 text-white"
              >
                {COLUMNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTagToForm();
                  }
                }}
                placeholder="Add tag"
                className="flex-1 rounded-md px-3 py-2 bg-gray-800 text-white placeholder:text-gray-500"
              />
              <button type="button" onClick={addTagToForm} className="rounded-md bg-orange-600 px-3 py-2 text-white">
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-2 py-1 text-sm text-white"
                  >
                    {t}
                    <button type="button" onClick={() => removeTagFromForm(t)} className="text-red-400">
                      x
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-500 transition">
                {editingId ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-900 p-5 text-center border border-orange-500">
      <p className="text-3xl font-bold text-orange-500">{value}</p>
      <p className="mt-1 text-sm text-gray-400">{label}</p>
    </div>
  );
}
