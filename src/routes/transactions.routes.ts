import { Router } from 'express';
/** Importamos o 'multer' */
import multer from 'multer';

import { getCustomRepository } from 'typeorm';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
/** Descomentamos o service de 'import' */
import ImportTransactionService from '../services/ImportTransactionsService';

/** Importamos as configurações do 'upload' */
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

/** Instanciamos o multer passando as configurações de upload pra ele */
const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

/** Aqui utilizamos o multer como forma de middleware */
/** Quando chamamos a rota 'import', ele vai chamar a middleware de 'upload' e depois vai chamar a nossa função a seguir */
transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    /** Instanciamos a service de 'import' */
    const importTransactions = new ImportTransactionsService();

    /** Executamos a service de 'import', passando a variável que estamos dando nome ao nosso arquivo (diretório do nosso arquivo) */
    const transactions = await importTransactions.execute(request.file.path);

    /** Retorna a importação das 'transactions' */
    return response.json(transactions);
  },
);

export default transactionsRouter;
