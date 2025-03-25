import * as https from 'https';
import 'dotenv/config';
import { Hu } from '../interfaces/consulta_status.interface';

/**
 * Obtiene el historial (actividad) de una User Story específica.
 */
export function fetchUserStoryHistory(userStoryId: number): Promise<Hu[]> {
  return new Promise((resolve, reject) => {
    const HOST_NAME = process.env.HOST_NAME || '';
    const TOKEN = process.env.TOKEN || '';

    const page = 1;
    const type = 'activity';
    const requestPath = `/api/v1/history/userstory/${userStoryId}?page=${page}&type=${type}`;

    const options: https.RequestOptions = {
      hostname: HOST_NAME,
      path: requestPath,
      method: 'GET',
      headers: {
        Authorization: TOKEN,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data) as Hu[];
          resolve(json);
        } catch (error) {
          reject(new Error('Error al parsear JSON en fetchUserStoryHistory: ' + (error as Error).message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}
