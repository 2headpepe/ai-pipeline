import { Pipeline } from '../../pipeline/entities/pipeline.entity';
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  password: string;

  @ManyToMany(() => Pipeline, pipeline => pipeline.users)
  @JoinTable({
    name: 'user_pipelines', // Название промежуточной таблицы
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'pipeline_id', referencedColumnName: 'id' }
  })
  pipelines: Pipeline[];
}