import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Todo from '@/models/Todo';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    await connectDB();

    const tags: string[] = await Todo.distinct('tags', { user: authUser.userId });

    return NextResponse.json({ tags: tags.filter(Boolean).sort() }, { status: 200 });
  } catch (error) {
    console.error('Tags GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
