
import React from 'react';
import { FeedbackAssignment, User } from '../../../types';
import { MessageSquare, Send } from 'lucide-react';
import './style.css';

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
    <section className="peers-section">
      <div className="peers-header">
        <div className="icon-box">
          <MessageSquare className="icon-md" />
        </div>
        <h2 className="peers-title">Avaliação de Pares</h2>
      </div>
      <div className="peers-grid">
        {roundTasks.map((task) => {
          const rcv = users.find((u) => u.id === task.receiverId);
          return (
            <div
              key={task.id}
              className="peer-card shadow-soft"
            >
              <div className="peer-info">
                <div className="peer-initial">
                  {rcv?.name.charAt(0)}
                </div>
                <h3 className="peer-name">Feedback para {rcv?.name}</h3>
              </div>
              <textarea
                className="peer-textarea"
                placeholder={`Como você avalia o desempenho do(a) colega?\nDe que forma o(a) colega contribuiu para o seu aprendizado?\nHouve algo que o(a) colega fez que ajudou diretamente no seu aprendizado?\nQual seria um ponto de melhoria para este(a) colega?`}
                value={feedbackText[task.id] || ''}
                onChange={(e) => onChangeText(task.id, e.target.value)}
              />
              <button
                onClick={() => onSubmit(task.id, feedbackText[task.id] || '')}
                className="peer-submit-btn"
              >
                <Send className="icon-xs" /> Enviar Feedback Anônimo
              </button>
            </div>
          );
        })}
      </div>
      {roundTasks.length === 0 && (
        <div className="empty-tasks-msg shadow-soft">
          Sua lista de tarefas está em dia! ✨
        </div>
      )}
    </section>
  );
};
