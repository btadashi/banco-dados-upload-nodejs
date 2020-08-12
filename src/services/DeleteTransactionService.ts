/** Importar do 'typeorm' a função 'getCustomRepository' */
import { getCustomRepository } from 'typeorm';

/** Descomentar o 'AppError' */
import AppError from '../errors/AppError';

/** Importar 'model' de Transaction */
import Transaction from '../models/Transaction';

/** Importar TransactionsRepository */
import Transactionsrepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  /** Passar o 'id' como parâmetro de 'execute' */
  public async execute(id: string): Promise<void> {
    /** Validação no banco de dados: existe a transaction? Se sim, deleta, senão, retornar erro */
    const transactionsRepository = getCustomRepository(Transactionsrepository);

    /** Procurar em nosso banco de dados se a 'transaction' existe */
    const transaction = await transactionsRepository.findOne(id);

    /** Se a 'transaction' não existir: */
    if (!transaction) {
      throw new AppError('Transaction does not exist');
    }

    /** Se a 'transaction' existir: */
    /** Como não precisamos retornar nada basta declarar um await de 'transactionsRepository' com a função 'remove', passando a própria 'transaction' que já buscamos */
    await transactionsRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
