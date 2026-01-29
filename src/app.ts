import express, { Application } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import routes from './routes';

// Carrega variáveis de ambiente
config();

/**
 * Configuração da aplicação Express
 */
class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }

  /**
   * Configura os middlewares
   */
  private middlewares(): void {
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));

    // Parser de JSON
    this.app.use(express.json());

    // Parser de URL encoded
    this.app.use(express.urlencoded({ extended: true }));

    // Log de requisições (desenvolvimento)
    if (process.env.NODE_ENV !== 'production') {
      this.app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
      });
    }
  }

  /**
   * Configura as rotas
   */
  private routes(): void {
    // Rota raiz
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'API Sistema de Autenticação',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          auth: {
            login: 'POST /api/auth/login',
            register: 'POST /api/auth/register',
            me: 'GET /api/auth/me',
            checkEmail: 'POST /api/auth/check-email',
          },
        },
      });
    });

    // Rotas da API
    this.app.use('/api', routes);

    // Rota 404
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Rota não encontrada',
      });
    });
  }
}

export default new App().app;

