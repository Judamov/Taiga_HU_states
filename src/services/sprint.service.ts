import * as https from 'https';
import 'dotenv/config';
import { Sprints } from '../interfaces/consulta_sprint.interface';

/**
 * Obtiene todos los sprints para un proyecto dado.
 */
export function fetchSprints(): Promise<Sprints[]> {
  return new Promise((resolve, reject) => {
    const HOST_NAME = process.env.HOST_NAME || '';
    const TOKEN = process.env.TOKEN || '';
    const PROYECT_TAIGA = process.env.PROYECT_TAIGA || '';

    // Ejemplo de filtrado para no traer sprints cerrados
    const params = {
      closed: 'false',
      project: PROYECT_TAIGA,
    };

    const queryString = new URLSearchParams(params).toString();

    const options: https.RequestOptions = {
      hostname: HOST_NAME,
      path: `/api/v1/milestones?${queryString}`,
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
          const json = JSON.parse(data);
          resolve(json as Sprints[]);
        } catch (error) {
          reject(new Error('Error al parsear JSON en fetchSprints: ' + (error as Error).message));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}
