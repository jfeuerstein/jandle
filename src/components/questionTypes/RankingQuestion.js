import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './RankingQuestion.css';

// Sortable Item Component
function SortableItem({ id, index, item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`ranking-item ${isDragging ? 'dragging' : ''}`}
    >
      <span className="ranking-number">{index + 1}.</span>
      <span className="ranking-text">{item}</span>
      <span className="ranking-drag-hint">⋮⋮</span>
    </div>
  );
}

function RankingQuestion({ question, onAnswer, onSkip, disabled }) {
  // Initialize items with unique IDs for drag-and-drop
  const [items, setItems] = useState(() =>
    question.items ? question.items.map((item, index) => ({
      id: `item-${index}`,
      text: item
    })) : []
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    // Submit the ranked order as an array of item texts
    const rankedOrder = items.map(item => item.text);
    onAnswer(rankedOrder);
  };

  return (
    <div className="ranking-question">
      <div className="question-header">
        <span className="question-number">question </span>
        <span className="question-type-badge">ranking</span>
      </div>

      <div className="question-text">
        {question.text}
      </div>

      <div className="ranking-instructions">
        drag items to rank them in order (1 = highest)
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="ranking-items">
            {items.map((item, index) => (
              <SortableItem
                key={item.id}
                id={item.id}
                index={index}
                item={item.text}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="ranking-actions">
        <button
          className="ranking-btn ranking-btn-skip"
          onClick={onSkip}
          disabled={disabled}
        >
          [ skip ]
        </button>
        <button
          className="ranking-btn ranking-btn-submit"
          onClick={handleSubmit}
          disabled={disabled}
        >
          [ submit ]
        </button>
      </div>

      <div className="question-footer">
        <span className="question-hint">
          drag and drop to reorder, then submit your ranking
        </span>
      </div>
    </div>
  );
}

export default RankingQuestion;
