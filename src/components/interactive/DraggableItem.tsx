import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useFullscreen } from '@/shared/contexts/FullscreenContext';

interface DragHandleProps {
  listeners: any;
  attributes: any;
}

const DragHandle: React.FC<DragHandleProps> = ({ listeners, attributes }) => (
  <div 
    className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-none text-gray-400 hover:text-gray-600" 
    {...attributes} 
    {...listeners}
  >
    <GripVertical className="w-4 h-4" />
  </div>
);

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ id, children }) => {
  const { isMobile } = useFullscreen();

  // If on mobile, just render the children without drag handle
  if (isMobile) {
    return <div className="relative">{children}</div>;
  }

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
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative touch-manipulation ${
        isDragging ? 'z-50 shadow-lg' : ''
      }`}
    >
      <DragHandle 
        listeners={listeners} 
        attributes={attributes} 
      />
      {children}
    </div>
  );
};