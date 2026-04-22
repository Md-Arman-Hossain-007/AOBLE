"use client";

import React, { useState } from "react";
import { 
  MoreVertical, 
  User, 
  Calendar, 
  AlertCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Inbox,
  Zap
} from "lucide-react";
import styles from "./page.module.css";
import Link from "next/link";

interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  case_type: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  due_date?: string;
  customer_ref?: string;
  sla_status?: string;
  time_remaining_hours?: number;
}

interface KanbanBoardProps {
  cases: Case[];
  onStatusChange?: (caseId: string, newStatus: string) => void;
}

const STATUS_COLUMNS = [
  { id: "pending", label: "Pending", icon: Inbox, color: "#F59E0B" },
  { id: "under_review", label: "Under Review", icon: Clock, color: "#3B82F6" },
  { id: "escalated", label: "Escalated", icon: ShieldAlert, color: "#EF4444" },
  { id: "resolved", label: "Resolved", icon: CheckCircle2, color: "#22C55E" }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ cases, onStatusChange }) => {
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [dropTargetStatus, setDropTargetStatus] = useState<string | null>(null);

  const getPriorityClass = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      default: return styles.priorityLow;
    }
  };

  const getSLAClass = (slaStatus: string) => {
    switch(slaStatus) {
      case 'breached': return styles.slaBreached;
      case 'warning': return styles.slaWarning;
      default: return styles.slaOk;
    }
  };

  const formatTimeRemaining = (hours?: number) => {
    if (hours === undefined) return "N/A";
    if (hours < 0) return `${Math.abs(Math.floor(hours))}h overdue`;
    if (hours < 1) return `${Math.floor(hours * 60)}m left`;
    if (hours < 24) return `${Math.floor(hours)}h left`;
    return `${Math.floor(hours / 24)}d left`;
  };

  const handleDragStart = (e: React.DragEvent, caseId: string) => {
    setDraggedCaseId(caseId);
    e.dataTransfer.setData("caseId", caseId);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a ghost image if needed, but default is usually fine
  };

  const handleDragOver = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dropTargetStatus !== status) {
      setDropTargetStatus(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column
    // setDropTargetStatus(null);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("caseId");
    if (caseId && onStatusChange) {
      onStatusChange(caseId, status);
    }
    setDraggedCaseId(null);
    setDropTargetStatus(null);
  };

  const groupedCases = STATUS_COLUMNS.reduce((acc, col) => {
    acc[col.id] = cases.filter(c => c.status === col.id);
    return acc;
  }, {} as Record<string, Case[]>);

  return (
    <div className={styles.kanbanBoard} onDragLeave={() => setDropTargetStatus(null)}>
      {STATUS_COLUMNS.map((column) => (
        <div 
          key={column.id} 
          className={`${styles.kanbanColumn} ${dropTargetStatus === column.id ? styles.columnHighlight : ''}`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={styles.columnHeader}>
            <div className={styles.columnTitle}>
              <column.icon size={18} style={{ color: column.color }} />
              <span>{column.label}</span>
              <span className={styles.columnCount}>{groupedCases[column.id].length}</span>
            </div>
            <button className={styles.columnAction}>
              <MoreVertical size={16} />
            </button>
          </div>
          
          <div className={styles.columnBody}>
            {groupedCases[column.id].length === 0 ? (
              <div className={styles.kanbanEmpty}>
                <p>No cases</p>
              </div>
            ) : (
              groupedCases[column.id].map((caseItem) => (
                <div 
                  key={caseItem.id} 
                  className={`${styles.kanbanCard} ${draggedCaseId === caseItem.id ? styles.dragging : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, caseItem.id)}
                >
                  <div className={styles.cardHeader}>
                    <span className={`${styles.priorityBadge} ${getPriorityClass(caseItem.priority)}`}>
                      {caseItem.priority}
                    </span>
                    {caseItem.sla_status && (
                      <span className={`${styles.slaBadge} ${getSLAClass(caseItem.sla_status)}`}>
                        {formatTimeRemaining(caseItem.time_remaining_hours)}
                      </span>
                    )}
                  </div>
                  
                  <Link href={`/cases/${caseItem.id}`} className={styles.cardTitle}>
                    {caseItem.title}
                  </Link>
                  
                  <div className={styles.cardMeta}>
                    <span className={styles.cardType}>{caseItem.case_type.replace('_', ' ')}</span>
                    {caseItem.customer_ref && (
                      <span className={styles.cardRef}>#{caseItem.customer_ref}</span>
                    )}
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.cardAssignee}>
                      <div className={styles.cardAvatar}>
                        {caseItem.assigned_to?.slice(0, 2).toUpperCase() || 'U'}
                      </div>
                      <span className={styles.cardAssigneeName}>
                        {caseItem.assigned_to || 'Unassigned'}
                      </span>
                    </div>
                    <div className={styles.cardDate}>
                      <Calendar size={12} />
                      <span>{new Date(caseItem.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
