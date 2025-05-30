import React from 'react';
import { cn } from '@/lib/utils';

type BGVariantType = 'dots' | 'diagonal-stripes' | 'grid' | 'horizontal-lines' | 'vertical-lines' | 'checkerboard';
type BGMaskType =
	| 'fade-center'
	| 'fade-edges'
	| 'fade-top'
	| 'fade-bottom'
	| 'fade-left'
	| 'fade-right'
	| 'fade-x'
	| 'fade-y'
	| 'blur-edges'
	| 'blur-all'
	| 'none';

type BGPatternProps = React.ComponentProps<'div'> & {
	variant?: BGVariantType;
	mask?: BGMaskType;
	size?: number;
	fadeSize?: string;
};

function geBgImage(variant: BGVariantType, size: number) {
	// A cor da linha do padrão de fundo.
	// Ela puxa da variável CSS '--grid-line-color'.
	// Se a variável não estiver definida, usa 'rgba(0, 0, 0, 0.3)' como fallback (tema claro, 30% opacidade).
	const lineColor = 'var(--grid-line-color, rgba(0, 0, 0, 0.3))'; 

	switch (variant) {
		case 'dots':
			return `radial-gradient(${lineColor} 1px, transparent 1px)`;
		case 'grid':
			return `linear-gradient(to right, ${lineColor} 1px, transparent 1px), linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
		case 'diagonal-stripes':
			return `repeating-linear-gradient(45deg, ${lineColor}, ${lineColor} 1px, transparent 1px, transparent ${size}px)`;
		case 'horizontal-lines':
			return `linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)`;
		case 'vertical-lines':
			return `linear-gradient(to right, ${lineColor} 1px, transparent 1px)`;
		case 'checkerboard':
			return `linear-gradient(45deg, ${lineColor} 25%, transparent 25%), linear-gradient(-45deg, ${lineColor} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${lineColor} 75%), linear-gradient(-45deg, transparent 75%, ${lineColor} 75%)`;
		default:
			return undefined;
	}
}

function getMaskGradient(mask: BGMaskType, fadeSize: string) {
    // A cor da máscara (sombra) é puxada da variável CSS '--mask-bg-color'.
    // Se a variável não estiver definida, usa 'rgba(255, 255, 255, 0.8)' como fallback (tema claro, 80% opacidade).
    const selectedBgColor = 'var(--mask-bg-color, rgba(255, 255, 255, 0.8))';

	switch (mask) {
		case 'fade-edges':
			return `radial-gradient(ellipse at center, transparent 20%, ${selectedBgColor} 75%)`;
		case 'fade-center':
			return `radial-gradient(ellipse at center, ${selectedBgColor} 0%, transparent 70%)`;
		case 'fade-top':
			return `linear-gradient(to bottom, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'fade-bottom':
			return `linear-gradient(to top, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'fade-left':
			return `linear-gradient(to right, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'fade-right':
			return `linear-gradient(to left, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'fade-x':
			return `linear-gradient(to right, ${selectedBgColor} 0%, transparent ${fadeSize}), linear-gradient(to left, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'fade-y':
			return `linear-gradient(to bottom, ${selectedBgColor} 0%, transparent ${fadeSize}), linear-gradient(to top, ${selectedBgColor} 0%, transparent ${fadeSize})`;
		case 'blur-edges':
			return `
				linear-gradient(to bottom, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to top, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to right, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to left, ${selectedBgColor} 0%, transparent ${fadeSize})
			`;
		case 'blur-all':
			return `
				linear-gradient(to bottom, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to top, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to right, ${selectedBgColor} 0%, transparent ${fadeSize}),
				linear-gradient(to left, ${selectedBgColor} 0%, transparent ${fadeSize})
			`;
		default:
			return undefined;
	}
}

const BGPattern = ({
	variant = 'grid',
	mask = 'none',
	size = 24,
	fadeSize = '240px', // O valor padrão para o tamanho do efeito de fade/blush.
	className,
	style,
	...props
}: BGPatternProps) => {
	const bgSize = `${size}px ${size}px`;
	const backgroundImage = geBgImage(variant, size);
	const maskGradient = getMaskGradient(mask, fadeSize); 

	const showOverlay = mask !== 'none';

	return (
		<div
			className={cn('absolute inset-0 z-[-10] size-full', className)}
			style={{
				backgroundImage,
				backgroundSize: bgSize,
				...style,
			}}
			{...props}
		>
			{showOverlay && (
				<div
					className="absolute inset-0 size-full pointer-events-none"
					style={{
						backgroundImage: maskGradient,
					}}
				/>
			)}
		</div>
	);
};

BGPattern.displayName = 'BGPattern';
export { BGPattern };