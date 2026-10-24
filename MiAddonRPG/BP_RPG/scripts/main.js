import { inicializarGeneradorNiveles } from './sistemas/generadorNiveles.js';
import { inicializarGestorLoot } from './sistemas/gestorLoot.js';
import { inicializarSistemaHabilidadesBoss } from './sistemas/habilidadesBoss.js';
import { inicializarHabilidadesArmasRPG } from './sistemas/armasRPG.js';
import { inicializarCofresYPescaRPG } from './sistemas/cofresYPescaRPG.js';

// Inicializar todos los subsistemas RPG
inicializarGeneradorNiveles();
inicializarGestorLoot();
inicializarSistemaHabilidadesBoss();
inicializarHabilidadesArmasRPG();
inicializarCofresYPescaRPG();

console.warn("§b[RPG System] Addon inicializado con Cofres del Mundo, Pesca Arcana y Encantamientos Nativos.");
