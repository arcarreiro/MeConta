import React from 'react';
import { FeedbackAssignment, User } from '../../../types';
import { MessageSquare, Send } from 'lucide-react';

interface PeersSectionProps {
  tasks: FeedbackAssignment[];
  users: User[];
  roundId: string;
  feedbackText: Record<string, string>;
  onChangeText: (taskId: string, value: string) => void;
  onSubmit: (taskId: string, text: string) => void;
}

export const PeersSection: React.FC<PeersSectionProps> = ({
  tasks,
  users,
  roundId,
  feedbackText,
  onChangeText,
  onSubmit,
}) => {
  const roundTasks = tasks.filter((t) => t.roundId === roundId);

  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4 px-2">
        <div className="w-12 h-12 bg-cyan-100 rounded-2xl flex items-center justify-center text-cyan-600">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Avaliação de Pares</h2>
      </div>
      <div className="grid gap-6">
        {roundTasks.map((task) => {
          const rcv = users.find((u) => u.id === task.receiverId);
          return (
            <div
              key={task.id}
              className="bg-white rounded-[3rem] border border-slate-100 p-8 md:p-10 space-y-6 shadow-soft hover:border-cyan-100 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg border border-slate-100 shadow-inner">
                  {rcv?.name.charAt(0)}
                </div>
                <h3 className="text-xl font-bold text-slate-900">Feedback para {rcv?.name}</h3>
              </div>
              <textarea
                className="w-full bg-slate-50 border-0 rounded-[2rem] p-6 h-40 text-slate-700 font-medium focus:ring-2 focus:ring-cyan-200 transition-all shadow-inner"
                placeholder={`Como você avalia o desempenho do(a) colega?\nDe que forma o(a) colega contribuiu para o seu aprendizado?\nHouve algo que o(a) colega fez que ajudou diretamente no seu aprendizado?\nQual seria um ponto de melhoria para este(a) colega?`}
                value={feedbackText[task.id] || ''}
                onChange={(e) => onChangeText(task.id, e.target.value)}
              />
              <button
                onClick={() => onSubmit(task.id, feedbackText[task.id] || '')}
                className="w-full bg-slate-900 hover:bg-cyan-600 text-white py-5 rounded-2xl font-black transition-all shadow-soft active:scale-95 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Enviar Feedback Anônimo
              </button>
            </div>
          );
        })}
      </div>
      {roundTasks.length === 0 && (
        <div className="p-16 text-center bg-white border border-slate-100 rounded-[3rem] text-slate-300 font-black uppercase tracking-[0.2em] italic shadow-soft">
          Sua lista de tarefas está em dia! ✨
        </div>
      )}
    </section>
  );
};

