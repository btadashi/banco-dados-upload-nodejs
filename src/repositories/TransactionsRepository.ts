import { EntityRepository, Repository } from 'typeorm';

import { response } from 'express';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  /** Descomentamos o código abaixo */
  public async getBalance(): Promise<Balance> {
    /** Retornar a balance com estrutura completa */
    /** Como já estamos dentro de 'repository', podemos utilizar o 'this' para referenciar o 'repository' */
    /** this.find(): busca as 'transactions' do nosso banco de dados */
    const transactions = await this.find();

    /** Ao invés de 'balance', desestruturamos para 'income' e 'outcome' */
    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        switch (transaction.type) {
          case 'income':
            accumulator.income += Number(
              transaction.value,
            ); /** Adiciona ao 'accumulator.income' o valor da transaction atual que está sendo mapeado */
            break;

          case 'outcome':
            accumulator.outcome += Number(
              transaction.value,
            ); /** Adiciona ao 'accumulator.outcome' o valor da transaction atual que está sendo mapeado */
            break;

          /** Caso não seja nem 'income' nem 'outcome', então não faz nada */
          default:
            break;
        }

        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    /** Para termos o saldo do balanço: */
    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
