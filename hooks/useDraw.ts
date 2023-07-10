import { useEffect, useRef, useState } from "react";

export const useDraw = (
	onDraw: ({ ctx, currentPoint, prevPoint }: Draw) => void
) => {
	const [mouseDown, setMouseDown] = useState(false);

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const prevPoint = useRef<null | Point>(null);

	const onMouseDown = () => setMouseDown(true);

	const download = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const link = document.createElement("a");
		link.download = "canvas.png";
		link.href = canvas.toDataURL();
		link.click();
	}

	const clear = () => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const handler = (e: MouseEvent) => {
			if (!mouseDown) return;

			const currentPoint = computePointInCanvas(e);

			const ctx = canvas.getContext("2d");
			if (!ctx || !currentPoint) return;

			onDraw({ ctx, currentPoint, prevPoint: prevPoint.current });
			prevPoint.current = currentPoint;
		};

		const computePointInCanvas = (e: MouseEvent) => {
			const rect = canvas.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;

			return { x, y };
		};

		const mouseUpHandler = () => {
			setMouseDown(false);
			prevPoint.current = null;
		};

		canvas.addEventListener("mousemove", handler);
		window.addEventListener("mouseup", mouseUpHandler);

		return () => {
			const cleanUp = canvas;
			cleanUp.removeEventListener("mousemove", handler);
			window.removeEventListener("mouseup", mouseUpHandler);
		};
	}, [onDraw, mouseDown]);

	return { canvasRef, onMouseDown, clear, download };
};
