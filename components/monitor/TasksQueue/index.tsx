
import React from 'react';
import { FeedbackAssignment, FeedbackRound, User } from '../../../types';
import { User as UserIcon, Send, MessageSquare } from 'lucide-react';
import './style.css';

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
    <div className="tasks-queue">
      <h2 className="tasks-queue-title">
        <MessageSquare className="title-icon icon-violet" /> Minha Fila de Tarefas
      </h2>
      <div className="tasks-container">
        <div className="tasks-header">
          <p className="tasks-subtitle">
            Você tem avaliações pendentes para enviar aos seus alunos nesta sprint.
          </p>
        </div>
        <div className="tasks-list">
          {tasks.map((task) => {
            const student = users.find((u) => u.id === task.receiverId);
            const round = rounds.find((r) => r.id === task.roundId);
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="task-item"
              >
                <div className="item-header">
                  <div className="item-info">
                    <div className="avatar-wrapper">
                      {student?.photoUrl ? (
                        <img src={student.photoUrl} className="avatar-img" />
                      ) : (
                        <UserIcon className="avatar-placeholder" />
                      )}
                    </div>
                    <div className="item-details">
                      <div className="student-name">{student?.name}</div>
                      <div className="round-name">
                        {round?.name}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleExpand(isExpanded ? null : task.id)}
                    className={`task-action-btn ${isExpanded ? 'task-action-btn--active' : ''}`}
                  >
                    {isExpanded ? 'Fechar' : 'Avaliar'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="expanded-task-content">
                    <textarea
                      placeholder={`Como foi o desempenho de ${student?.name.split(' ')[0]} nesta sprint? Quais pontos de melhoria você identificou?`}
                      className="task-textarea"
                      value={taskText[task.id] || ''}
                      onChange={(e) => onChangeTaskText(task.id, e.target.value)}
                    />
                    <button
                      onClick={() => onSubmitTask(task.id)}
                      className="task-submit-btn"
                    >
                      <Send className="icon-xs" /> Enviar Feedback Oficial
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
