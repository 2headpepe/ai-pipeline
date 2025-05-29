import * as deepl from 'deepl-node';

export type ChatGPTPrompt = {
    prompt: string;
    options?: {
        depth?: 'Поверхностный обзор' | "Стандартный анализ" | 'Глубокое погружение';
        style?: 'Официальный (деловой, формальный)' | 'Научный' | 'Публицистический (журналистский)' | 'Художественный' | 'Разговорный (неформальный)' | 'Технический';
        accent?: string;
        remove?: string;
        add?: string;
    }
    translate?: {
        pre: { source: deepl.SourceLanguageCode, target: deepl.TargetLanguageCode };
        post: { source: deepl.SourceLanguageCode, target: deepl.TargetLanguageCode };
    }
}

export type SDPrompt = {
    prompt: string;
    options?: {
        style?: 'Реализм ' | "Мультфильм" | 'Минимализм' | 'Абстракционизм' | 'Поп-арт';
    }
}

// src/pipeline/dto/process-nodes.dto.ts
export type ProcessNodeDto = ({
    type: 'chatgpt';
    data: {
        prompt: ChatGPTPrompt;
    }
} | {
    type: 'stablediffusion';
    data: {
        prompt: SDPrompt;
    }
}) &
{
    id: string;
    data?: {
        label?: string;
        [key: string]: any;
    };
}