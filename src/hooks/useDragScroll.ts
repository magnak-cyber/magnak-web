import { useRef, useCallback } from 'react';

type DragScrollState = {
    startX: number;
    startY: number;
    scrollLeft: number;
    isDown: boolean;
    isDragging: boolean;
    isVerticalScroll: boolean;
};

export function useDragScroll<T extends HTMLElement>(): (node: T | null) => void {
    const stateRef = useRef<DragScrollState>({
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        isDown: false,
        isDragging: false,
        isVerticalScroll: false,
    });

    const cleanupRef = useRef<(() => void) | null>(null);

    const refCallback = useCallback((node: T | null) => {
        if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }

        if (!node) return;

        const onPointerDown = (clientX: number, clientY: number) => {
            const s = stateRef.current;
            s.isDown = true;
            s.isDragging = false;
            s.isVerticalScroll = false;
            s.startX = clientX;
            s.startY = clientY;
            s.scrollLeft = node.scrollLeft; // Берем node напрямую из аргумента
            node.classList.add('dragging');
        };

        const onPointerMove = (clientX: number, clientY: number, isTouch: boolean) => {
            const s = stateRef.current;
            if (!s.isDown) return;

            const dx = clientX - s.startX;
            const dy = clientY - s.startY;
            const threshold = 8;

            if (!s.isDragging && !s.isVerticalScroll) {
                if (Math.abs(dy) > threshold && Math.abs(dy) > Math.abs(dx)) {
                    s.isVerticalScroll = true;
                    s.isDown = false;
                    node.classList.remove('dragging');
                    return;
                }
                if (Math.abs(dx) > threshold) {
                    s.isDragging = true;
                } else {
                    return;
                }
            }

            if (s.isDragging) {
                if (isTouch) (window.event as any)?.preventDefault?.();
                node.scrollLeft = s.scrollLeft - dx;
            }
        };

        const onPointerUp = () => {
            const s = stateRef.current;
            s.isDown = false;
            s.isDragging = false;
            s.isVerticalScroll = false;
            node.classList.remove('dragging');
        };

        const mouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
        const mouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY, false);
        const mouseUp = () => onPointerUp();

        const touchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            if (!t) return;
            onPointerDown(t.clientX, t.clientY);
        };
        const touchMove = (e: TouchEvent) => {
            const t = e.touches[0];
            if (!t) return;
            onPointerMove(t.clientX, t.clientY, true);
        };
        const touchEnd = () => onPointerUp();

        node.addEventListener('mousedown', mouseDown);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);

        node.addEventListener('touchstart', touchStart, { passive: true });
        node.addEventListener('touchmove', touchMove as any, { passive: false });
        node.addEventListener('touchend', touchEnd);
        node.addEventListener('touchcancel', touchEnd);

        cleanupRef.current = () => {
            node.removeEventListener('mousedown', mouseDown);
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('mouseup', mouseUp);

            node.removeEventListener('touchstart', touchStart);
            node.removeEventListener('touchmove', touchMove as any);
            node.removeEventListener('touchend', touchEnd);
            node.removeEventListener('touchcancel', touchEnd);
        };

    }, []);

    return refCallback;
}