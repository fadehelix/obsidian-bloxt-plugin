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
	} = useSortable({
		id: block.id,
		disabled: block.isDraggable === false,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor:
			block.isDraggable === false
				? "default"
				: isDragging
				? "grabbing"
				: "grab",
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...(block.isDraggable !== false ? attributes : {})}
			{...(block.isDraggable !== false ? listeners : {})}
			className={`bloxt-block bloxt-block-${block.type} ${
				block.isDraggable === false ? "bloxt-block-non-draggable" : ""
			}`}
			data-dragging={isDragging}
		>
			{children}
		</div>
	);
};
