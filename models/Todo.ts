import mongoose, { Schema, Document } from 'mongoose';

export type TodoStatus = 'todo' | 'in-progress' | 'done';

export interface ITodo extends Document {
  title: string;
  description?: string;
  completed: boolean;
  status: TodoStatus;
  tags: string[];
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    tags: { type: [String], default: [] },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default (mongoose.models.Todo as mongoose.Model<ITodo>) ||
  mongoose.model<ITodo>('Todo', todoSchema);
