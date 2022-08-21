import { Entity, BaseEntity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class UsersEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @PrimaryColumn("varchar", { length: 32, comment: "邮箱", unique: true })
  public email!: string;


  @Column("varchar", { length: 16, comment: "姓名", default: "" })
  public name!: string;


  @Column("tinyint", { width: 1, default: 0, comment: "性别 0: 女 1: 男" })
  public sex!: 0 | 1;
}
