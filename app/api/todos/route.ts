import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get('q') || '';
    const tag = url.searchParams.get('tag') || '';
    const status = url.searchParams.get('status') || '';

    const query: any = { user: authUser.userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (status) {
      query.status = status;
    }

    const todos = await Todo.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ todos }, { status: 200 });
  } catch (error) {
    console.error('Todos GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const body = await request.json();
    const { title, description, tags, status } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

    const validStatus = ['todo', 'in-progress', 'done'].includes(status) ? status : 'todo';

    await connectDB();

    const todo = new Todo({
      title,
      description: description || '',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : [],
      status: validStatus,
      completed: validStatus === 'done',
      user: authUser.userId,
    });

    await todo.save();

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Todos POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
