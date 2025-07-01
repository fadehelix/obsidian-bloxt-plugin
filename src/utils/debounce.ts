// Debounce configuration constants
export const DEBOUNCE_DELAYS = {
	CONTENT_PARSING: 300, // ms - delay for parsing content changes in BlockEditor
	VIEW_REFRESH: 250, // ms - delay for refreshing the view on file/editor changes
	DRAG_FEEDBACK: 100, // ms - delay for visual feedback during drag operations
} as const;

// Debounce utility function
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			func(...args);
		}, delay);
	};
}
