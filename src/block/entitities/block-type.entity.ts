import { Entity, Column, PrimaryColumn } from 'typeorm';

export type Type = 'chatgpt' | 'stablediffusion';

@Entity()
export class BlockType {
    @PrimaryColumn()
    type: Type;

    @Column()
    description: string;

    @Column('jsonb')
    availableOptions?: {
        style: string[];
        depth?: string[]; // Опционально, только для ChatGPT
        accent?: boolean;
        remove?: boolean;
        add?: boolean;
    };
}