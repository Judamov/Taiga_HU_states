import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Interfaces
import { Sprints } from './interfaces/consulta_sprint.interface';
import { Hu } from './interfaces/consulta_status.interface';

// Servicios
import { fetchSprints } from './services/sprint.service';
import { fetchUserStoryHistory } from './services/userStory.service';

async function main() {
  try {
    // 1) Verificamos variable de entorno
    if (!process.env.PROYECT_TAIGA) {
      throw new Error('ERROR: La variable de entorno PROYECT_TAIGA no está definida.');
    }else if(!process.env.HOST_NAME){
      throw new Error('ERROR: La variable de entorno HOST_NAME no está definida.');
    }else if(!process.env.TOKEN){
      throw new Error('ERROR: La variable de entorno TOKEN no está definida.');
    }

    const projectTaiga = parseInt(process.env.PROYECT_TAIGA, 10);

    // 2) Obtenemos todos los sprints
    const allSprints: Sprints[] = await fetchSprints();

    // 3) Filtramos los sprints del proyecto
    const filteredSprints = allSprints.filter((sprint) => sprint.project === projectTaiga);

    // Arreglos auxiliares
    const logData: string[] = [];
    const userStoryIds: number[] = [];

    // Mapeo ID -> { ref, subject }
    const userStoryMeta = new Map<number, { ref: number; subject: string }>();

    // 4) Recorrer los sprints filtrados
    filteredSprints.forEach((sprint) => {
      logData.push(`Sprint ID: ${sprint.id} - ${sprint.name}`);

      sprint.user_stories.forEach((us) => {
        logData.push(`  - User Story ref: ${us.ref} | subject: ${us.subject}`);
        userStoryIds.push(us.id);

        userStoryMeta.set(us.id, { ref: us.ref, subject: us.subject });
      });
    });

    // 5) Prepara carpeta de salida
    const outputDir = path.join(process.cwd(), 'src', 'outputs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 6) Guardar log de sprints
    fs.writeFileSync(path.join(outputDir, 'sprints_log.txt'), logData.join('\n'), 'utf-8');

    // 7) Guardar IDs de user stories
    fs.writeFileSync(path.join(outputDir, 'user_story_ids.txt'), userStoryIds.join('\n'), 'utf-8');

    console.log('Archivos generados en carpeta outputs: sprints_log.txt y user_story_ids.txt');

    // 8) Consultar historial de cada User Story
    const historyLines: string[] = [];

    for (const userStoryId of userStoryIds) {
      try {
        const history = await fetchUserStoryHistory(userStoryId);

        // Rescatar metadatos (ref, subject)
        const meta = userStoryMeta.get(userStoryId) || { ref: 0, subject: 'Desconocida' };
        const { ref: storyRef, subject: storySubject } = meta;

        // Extraer fecha y estado
        history.forEach((hu: Hu) => {
          const date = hu.created_at;
          const statusObj = hu.values?.status;

          if (statusObj) {
            // Primera clave de status
            const [statusId] = Object.keys(statusObj);
            const statusName = statusObj[statusId];
            historyLines.push(
              `Story ref: ${storyRef} - ${storySubject} | Date: ${date} | Status: ${statusName}`
            );
          }
        });
      } catch (error) {
        console.error(`Error consultando historia de la User Story #${userStoryId}:`, error);
      }
    }

    // 9) Guardar historial en archivo
    fs.writeFileSync(
      path.join(outputDir, 'historial_estados.txt'),
      historyLines.join('\n'),
      'utf-8'
    );

    console.log('Generado: historial_estados.txt en carpeta outputs');

  } catch (error) {
    console.error('Error en main:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
