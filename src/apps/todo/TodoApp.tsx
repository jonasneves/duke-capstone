import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PillToggle } from './PillToggle';
import { AddTodo } from './AddTodo';
import { TodoItem } from './TodoItem';
import type { Todo, FilterType } from './types';

export default function TodoApp() {
  const navigate = useNavigate();
  const [todos, setTodos] = useLocalStorage<Todo[]>('todos', []);
  const [filter, setFilter] = useState<FilterType>('all');

  const addTodo = useCallback((text: string) => {
    const newTodo: Todo = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTodos((prev) => [newTodo, ...prev]);
  }, [setTodos]);

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, [setTodos]);

  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }, [setTodos]);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, [setTodos]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <ListTodo className="text-brand-600" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900">Todo App</h1>
            <p className="text-sm text-neutral-500">
              {activeCount} active, {completedCount} completed
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <AddTodo onAdd={addTodo} />

        <div className="flex items-center justify-between">
          <PillToggle
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'completed', label: 'Completed' },
            ]}
            value={filter}
            onChange={(value) => setFilter(value as FilterType)}
          />

          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="px-4 py-2 text-sm text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Clear completed
            </button>
          )}
        </div>

        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {filter === 'all' && (
              <>
                <Circle className="text-neutral-300 mb-4" size={48} />
                <p className="text-neutral-500">No tasks yet. Add one above!</p>
              </>
            )}
            {filter === 'active' && (
              <>
                <CheckCircle2 className="text-brand-300 mb-4" size={48} />
                <p className="text-neutral-500">All tasks completed!</p>
              </>
            )}
            {filter === 'completed' && (
              <>
                <Circle className="text-neutral-300 mb-4" size={48} />
                <p className="text-neutral-500">No completed tasks yet.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
