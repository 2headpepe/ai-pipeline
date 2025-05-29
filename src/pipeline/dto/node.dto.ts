// src/pipeline/dto/node.dto.ts
import { IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NodePositionDto {
    x: number;
    y: number;
}

class NodeDataDto {
    label: string;
}

export class NodeDto {
    @IsString()
    id: string;

    @IsString()
    type: string; // ID из таблицы BlockType

    @IsObject()
    @ValidateNested()
    @Type(() => NodePositionDto)
    position: NodePositionDto;

    @IsObject()
    @ValidateNested()
    @Type(() => NodeDataDto)
    data: NodeDataDto;
}