import React from 'react';
import { FeedbackAssignment, FeedbackRound, User } from '../../../types';
import { User as UserIcon, Send, MessageSquare } from 'lucide-react';

interface TasksQueueProps {
  tasks: FeedbackAssignment[];
  users: User[];
  rounds: FeedbackRound[];
  expandedTaskId: string | null;
  taskText: Record<string, string>;
  onToggleExpand: (taskId: string | null) => void;
  onChangeTaskText: (taskId: string, value: string) => void;
  onSubmitTask: (taskId: string) => void;
}

export const TasksQueue: React.FC<TasksQueueProps> = ({
  tasks,
  users,
  rounds,
  expandedTaskId,
  taskText,
  onToggleExpand,
  onChangeTaskText,
  onSubmitTask,
}) => {
  return (
    <>
      <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 ml-2">
        <MessageSquare className="w-6 h-6 text-violet-600" /> Minha Fila de Tarefas
      </h2>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-soft overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-slate-50 bg-violet-50/30">
          <p className="text-sm text-slate-600 font-medium">
            Você tem avaliações pendentes para enviar aos seus alunos nesta sprint.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tasks.map((task) => {
            const student = users.find((u) => u.id === task.receiverId);
            const round = rounds.find((r) => r.id === task.roundId);
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="p-6 border-b border-slate-50 transition-all hover:bg-slate-50/50"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-inner">
                      {student?.photoUrl ? (
                        <img src={student.photoUrl} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="text-slate-300 w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black text-slate-900 truncate">{student?.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {round?.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleExpand(isExpanded ? null : task.id)}
                    className={`bg-violet-600 text-white px-6 py-3 rounded-xl text-xs font-black transition-all shadow-brand active:scale-95 ${
                      isExpanded ? 'bg-slate-900' : ''
                    }`}
                  >
                    {isExpanded ? 'Fechar' : 'Avaliar'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                    <textarea
                      placeholder={`Como foi o desempenho de ${student?.name.split(' ')[0]} nesta sprint? Quais pontos de melhoria você identificou?`}
                      className="w-full rounded-2xl border-0 bg-slate-50 p-6 text-sm font-semibold focus:ring-2 focus:ring-violet-500 h-40 shadow-inner transition-all"
                      value={taskText[task.id] || ''}
                      onChange={(e) => onChangeTaskText(task.id, e.target.value)}
                    />
                    <button
                      onClick={() => onSubmitTask(task.id)}
                      className="w-full py-4 bg-violet-600 text-white rounded-2xl text-xs font-black hover:bg-violet-700 transition-all flex items-center justify-center gap-3 shadow-brand active:scale-95"
                    >
                      <Send className="w-4 h-4" /> Enviar Feedback Oficial
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

