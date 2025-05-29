import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data'
import { join } from 'path';
import { firstValueFrom } from 'rxjs';
import { STABLE_DIFFUSION_TOKEN } from './consts'
import * as deepl from 'deepl-node';

import * as fs from 'fs';

export const generateChatGpt = async (httpService: HttpService, prompt: string) => {
    const token = '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';
    const url = 'https://api.openai.com/v1/responses';
    try {
        const response = await firstValueFrom(
            httpService.post(url, {
                model: "gpt-4.1",
                input: prompt
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        );
        return response.data.output[0].content[0].text;
    } catch (error) {
        const errorData = error.response?.data ??
            error.message;
        console.error('Chat gpt API Error:', errorData);

        throw new Error(`Text generation failed: ${errorData}`);
    }
}

export const generateStableDiffusion = async (httpService: HttpService, imageDir: string, prompt?: string) => {
    const url = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
    const formData = new FormData();

    // Добавляем параметры как в curl
    formData.append('prompt', prompt ?? 'error image, no content, good quality, mock image');
    formData.append('output_format', 'jpeg');

    try {
        const response = await firstValueFrom(
            httpService.post(url, formData, {
                headers: {
                    ...formData.getHeaders(), // Автоматически добавляет нужные заголовки
                    Authorization: `Bearer ${STABLE_DIFFUSION_TOKEN}`,
                    Accept: 'image/*'
                },
                responseType: 'arraybuffer'
            })
        );

        const filename = `sd-${Date.now()}.jpeg`;
        const fullPath = join(imageDir, filename);
        console.log('fullpath: ', fullPath)
        fs.writeFileSync(fullPath, response.data);
        console.log(filename);
        return filename;
    } catch (error) {
        // Улучшенное логирование ошибки
        const errorData = error.response?.data ?
            Buffer.from(error.response.data).toString('utf-8') :
            error.message;
        console.error('Stable Diffusion API Error:', errorData);

        throw new Error(`Image generation failed: ${errorData}`);
    }
}

// 
const authKeyDeepl = "d82e8834-d016-460b-83cb-1a13343157ed:fx";
export const getLanguages = async () => {
    const deeplClient = new deepl.DeepLClient(authKeyDeepl);
    try {
        const source = await deeplClient.getSourceLanguages();
        const target = await deeplClient.getTargetLanguages();
        return { source, target };
    } catch (error) {
        console.log({ error });
    }
}

export const translateNode = async (text: string, source: deepl.SourceLanguageCode | null, target: deepl.TargetLanguageCode) => {
    const deeplClient = new deepl.DeepLClient(authKeyDeepl);
    try {
        const result = await deeplClient.translateText(text, source, target);
        return result.text;
    } catch (error) {
        console.log({ error });
    }
}
