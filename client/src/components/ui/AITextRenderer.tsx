
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface AITextRendererProps {
    content: string;
    className?: string;
}

export default function AITextRenderer({ content, className }: AITextRendererProps) {
    if (!content) return null;

    // Split by newlines and handle each line or group of lines
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;

    const flushList = (key: number) => {
        if (!currentList) return null;
        const list = currentList;
        currentList = null;
        if (list.type === 'ul') {
            return (
                <ul key={`list-${key}`} className="space-y-3 my-4 ml-1 bg-surface/30 p-5 rounded-xl border border-border/50 shadow-sm transition-all hover:border-gold-500/30">
                    {list.items.map((item, j) => (
                        <li key={j} className="flex gap-3 items-start text-[13px] sm:text-[14px] text-gray-300">
                            <span className="text-gold-500 mt-1 text-lg leading-none">•</span>
                            <span className="flex-1">{renderInlineStyles(item)}</span>
                        </li>
                    ))}
                </ul>
            );
        } else {
            return (
                <ol key={`list-${key}`} className="space-y-2 my-3 ml-1 bg-surface/30 p-4 rounded-xl border border-border/50 transition-all hover:border-gold-500/30">
                    {list.items.map((item, j) => {
                        const match = item.match(/^(\d+)\.\s+/);
                        const num = match ? match[1] : (j + 1).toString();
                        const content = item.replace(/^\d+\.\s+/, '');
                        return (
                            <li key={j} className="flex gap-3 items-start">
                                <span className="text-gold-400 font-bold min-w-[1.2rem]">{num}.</span>
                                <span className="flex-1">{renderInlineStyles(content)}</span>
                            </li>
                        );
                    })}
                </ol>
            );
        }
    };

    lines.forEach((line, i) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
            if (currentList) elements.push(flushList(i));
            return;
        }

        // Headers
        if (trimmedLine.startsWith('### ')) {
            if (currentList) elements.push(flushList(i));
            elements.push(
                <h4 key={i} className="text-white font-bold text-sm tracking-wide uppercase mt-6 mb-3 flex items-center gap-2 group">
                    <div className="h-5 w-1 bg-gold-gradient rounded-full group-hover:h-6 transition-all" />
                    <Sparkles className="h-3.5 w-3.5 text-gold-400" />
                    {renderInlineStyles(trimmedLine.replace('### ', ''))}
                </h4>
            );
            return;
        }
        if (trimmedLine.startsWith('## ')) {
            if (currentList) elements.push(flushList(i));
            elements.push(
                <h3 key={i} className="text-base text-white font-bold mt-8 mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-gold-500" />
                    {renderInlineStyles(trimmedLine.replace('## ', ''))}
                </h3>
            );
            return;
        }
        if (trimmedLine.startsWith('# ')) {
            if (currentList) elements.push(flushList(i));
            elements.push(
                <h2 key={i} className="text-lg text-white font-black mt-10 mb-6 bg-gold-gradient bg-clip-text text-transparent">
                    {renderInlineStyles(trimmedLine.replace('# ', ''))}
                </h2>
            );
            return;
        }

        // Lists detection (supports -, *, +, • and 1.)
        const isUnordered = /^([-*+•])\s+/.test(trimmedLine);
        const isOrdered = /^\d+\.\s+/.test(trimmedLine);

        if (isUnordered) {
            const content = trimmedLine.replace(/^([-*+•])\s+/, '');
            if (currentList && currentList.type === 'ul') {
                currentList.items.push(content);
            } else {
                if (currentList) elements.push(flushList(i));
                currentList = { type: 'ul', items: [content] };
            }
        } else if (isOrdered) {
            if (currentList && currentList.type === 'ol') {
                currentList.items.push(trimmedLine);
            } else {
                if (currentList) elements.push(flushList(i));
                currentList = { type: 'ol', items: [trimmedLine] };
            }
        } else {
            // Standard paragraph
            if (currentList) elements.push(flushList(i));
            elements.push(
                <p key={i} className="text-[13px] sm:text-[14px] text-gray-400 leading-relaxed mb-3">
                    {renderInlineStyles(trimmedLine)}
                </p>
            );
        }
    });

    if (currentList) elements.push(flushList(lines.length));

    return (
        <div className={cn("space-y-1 font-sans", className)}>
            {elements}
        </div>
    );
}

function renderInlineStyles(text: string) {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index} className="italic text-gold-200/80">{part.slice(1, -1)}</em>;
        }
        return <span key={index}>{part}</span>;
    });
}

