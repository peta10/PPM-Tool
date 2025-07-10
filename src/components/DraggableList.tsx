import React from 'react';
import {
  DndContext,
  closestCenter,
  TouchSensor,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFullscreen } from '../contexts/FullscreenContext';

interface DraggableListProps<T> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
  getItemId: (item: T) => string;
}

export function DraggableList<T>({
  items,
  onReorder,
  renderItem,
  getItemId,
}: DraggableListProps<T>) {
  const { isMobile } = useFullscreen();

  // If on mobile, just render the items without drag and drop
  if (isMobile) {
    return (
      <div className="space-y-4">
        {items.map(item => (
          <React.Fragment key={getItemId(item)}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay before drag starts on touch
        tolerance: 8, // 8px movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => getItemId(item) === active.id);
      const newIndex = items.findIndex(item => getItemId(item) === over.id);
      
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  // Guard against undefined items
  if (!items || !Array.isArray(items)) {
    return null;
  }
  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={items.map(getItemId)}
        strategy={verticalListSortingStrategy}
        id="draggable-list"
      >
        {items.map(item => (
          <React.Fragment key={getItemId(item)}>
            {renderItem(item)}
          </React.Fragment>
        ))}
      </SortableContext>
    </DndContext>
  );
}