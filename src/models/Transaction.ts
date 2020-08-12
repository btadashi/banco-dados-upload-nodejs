/** Entity: vai dizer ao 'typeorm' que isso aqui vai ser uma entidade do banco de dados */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import Category from './Category';

/** Queremos falar que a class 'Transaction' é uma entidade no nosso banco de dados. Desse modo, essa classe irá se referenciar a
 * uma taela no banco de dados com nome 'transactions', ou seja, que essa classe vai ser a tabela 'transactions'
 */
@Entity('transactions')
class Transaction {
  /** Queremos dizer que o tipo dessa tabela primária que será gerada será uuid */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Não precisamos passar parâmetro algum, pois por padrão já é uma string */
  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column('decimal')
  value: number;

  @ManyToOne(() => Category)
  /** JoinColumn: informar qual coluna que será utilizada para referenciar esse relacionamento */
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column()
  category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default Transaction;
