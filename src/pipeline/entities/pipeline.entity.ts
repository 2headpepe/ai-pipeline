import { User } from "../../user/entities/user.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";

@Entity()
export class Pipeline {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToMany(() => User, user => user.pipelines)
    users: User[];

    @Column({ type: 'jsonb' })
    nodes: {
        id: string;
        type: string;
        position: {
            x: number;
            y: number;
        };
        data: {
            label: string;
            [key: string]: any;
        };
    }[];

    @Column({ type: 'jsonb' })
    edges: {
        id: string;
        source: string;
        target: string;
    }[];
}