import { MarkdownBlock } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DraggableBlockProps {
	block: MarkdownBlock;
	children: React.ReactNode;
}

export const DraggableBlock = ({ block, children }: DraggableBlockProps) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: block.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: isDragging ? "grabbing" : "grab",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className={`bloxt-block bloxt-block-${block.type}`}
			data-dragging={isDragging}
		>
			{children}
		</div>
	);
};
