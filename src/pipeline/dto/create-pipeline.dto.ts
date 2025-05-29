// src/pipeline/dto/pipeline.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { NodeDto } from './node.dto';

export class PipelineDto {
    @IsOptional()
    @IsUUID()
    id?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => NodeDto)
    nodes?: NodeDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EdgeDto)
    edges?: Array<{ id: string; source: string; target: string }>;
}

export class EdgeDto {
    @IsString()
    id: string;

    @IsString()
    source: string;

    @IsString()
    target: string;
}