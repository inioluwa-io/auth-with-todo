import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const params = await context.params;

    await connectDB();
    const todo = await Todo.findById(params.id);
    if (!todo || todo.user.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Todo GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const params = await context.params;
    const body = await request.json();

    await connectDB();
    const todo = await Todo.findById(params.id);
    if (!todo || todo.user.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { title, description, completed, tags, status } = body;
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (tags !== undefined) todo.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : todo.tags;

    if (status !== undefined && ['todo', 'in-progress', 'done'].includes(status)) {
      todo.status = status;
      todo.completed = status === 'done';
    } else if (completed !== undefined) {
      todo.completed = completed;
      todo.status = completed ? 'done' : (todo.status === 'done' ? 'todo' : todo.status);
    }

    await todo.save();

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Todo PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const params = await context.params;

    await connectDB();
    const todo = await Todo.findById(params.id);
    if (!todo || todo.user.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await todo.deleteOne();

    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error) {
    console.error('Todo DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
