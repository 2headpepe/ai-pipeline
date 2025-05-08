import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Pipeline } from './pipeline.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

//   @OneToMany(() => Pipeline, pipeline => pipeline.user)
//   pipelines: Pipeline[];
}