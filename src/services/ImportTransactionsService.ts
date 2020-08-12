/** Com o método 'In' vamos verificar se as categorias que estamos buscando na array dela elas existem no banco de dados, de uma vez só */
import { getCustomRepository, getRepository, In } from 'typeorm';
/** Importamos o csv parse */
import csvParse from 'csv-parse';
/** Importar o 'file-system', que irá nos ajudar a abrir e ler arquivos */
import fs from 'fs';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

/** Interface da transaction do csv */
interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  /** Recuperar o 'filePath' do arquivo */
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);
    /** Para fazer a leitura do arquivo */
    /** contactsReadStream: a 'stream' que fará a leitura dos nossos arquivos */
    /** createReadStream: cria o arquivo de leitura no filePath (pasta tmp) */
    const contactsReadStream = fs.createReadStream(filePath);

    /** Instanciamos o csv parse */
    /** from_line: 2 -> Ignora a primeira linha (quer seria o cabeçalho) e parte pra segunda linha, onde vai estar o conteúdo */
    const parsers = csvParse({
      from_line: 2,
    });

    /** 'pipe' vai lendo as linhas conforme elas forem disponíveis para leitura */
    const parseCSV = contactsReadStream.pipe(parsers);

    /** Como nos códigos mais embaixo estaremos mapeando os dados, criamos as variáveis 'transactions' e 'categories'
     * para armazenar esses dados, inseridos através do push() para que depois que tenhamos tudo salvo aqui dentro, conseguiremos
     * salvar tudo no banco de dados de uma só vez */
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    /** Primeiro parâmetro = data: é o nome do evento */
    /** A cada 'data' que passar, cada parâmetro de 'line' vou desestruturar o 'title', 'type', 'value' e 'category'
     * do line.map(), em que cada célula (que será do tipo string) vou aplicar uma cell.trim(), que remove espaços e caracteres específicos
     */
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      /** Verifica se cada uma das variáveis estão chegando corretamente */
      /** Se o title ou type ou value não chegarem, estão simplesmente dou um 'return' para que eles não sejam inseridos */
      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });
    /** Essa 'Promise' vai verificar pra gente se o 'parseCSV emitiu um evento chamado 'end' ele vai retornar o que ele deveria fazer */
    await new Promise(resolve => parseCSV.on('end', resolve));

    /** Mapear as categorias em nosso banco de dados */
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    /** Pega todas as categorias encontradas e fazemos um 'map' para obtermos apenas o título dela */
    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    /** Para descobrir as categorias que já existem, porém ainda não estão no banco de dados ainda */
    /** No segundo 'filter' vamos mapeear self, que é uma array, buscando um 'index' que seja igual e o 'filter' irá retirar a duplicidade */
    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    /** Pegamos as categorias filtradas que ainda não existem e jogamos no nosso banco de dados */
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    /** Salvo os dados das novas categories no banco de dados */
    await categoriesRepository.save(newCategories);

    /** Para saber quais foram as novas categories inseridas */
    const finalCategories = [...newCategories, ...existentCategories];

    /** Para cada transaction retornamos um objeto com os nossos dados */
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    /** Salva no banco de dados a transaction importada */
    await transactionRepository.save(createdTransactions);

    /** Exclui o arquivo csv após sua importação no banco de dados */
    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
