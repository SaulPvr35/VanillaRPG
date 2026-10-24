/**
 * ARCHIVO DE COMPATIBILIDAD Y ENRUTAMIENTO CENTRAL
 * Expone CONFIG_RPG unificando los módulos independientes:
 * - configStats.js
 * - configDrops.js
 */
import { RAREZAS, CONFIG_STATS, CONFIG_AFIJOS, FILTRO_ENTIDADES } from './configStats.js';
import { CONFIG_DROPS } from './configDrops.js';

export { RAREZAS, CONFIG_STATS, CONFIG_AFIJOS, FILTRO_ENTIDADES, CONFIG_DROPS };

export const CONFIG_RPG = {
    nivelMaximo: CONFIG_STATS.nivelMaximo,
    multiplicadorVida: CONFIG_STATS.mob.vidaExtraPorNivel,
    multiplicadorDanio: CONFIG_STATS.mob.danioExtraPorNivel,
    vidaPorNivel: CONFIG_STATS.mob.vidaExtraPorNivel,

    probabilidadesAfijosPorNivel: CONFIG_STATS.escaladoAfijos,
    configuracionBosses: {
        probabilidadAparicionBoss: CONFIG_STATS.boss.probabilidadAparicion,
        multiplicadorVidaBoss: CONFIG_STATS.boss.vidaExtraPorNivel,
        multiplicadorDanioBoss: CONFIG_STATS.boss.danioExtraPorNivel,
        prefijoBoss: CONFIG_STATS.boss.prefijoVisual,
        intervaloHabilidadesTicks: CONFIG_STATS.boss.intervaloEvalTicks,
        rangoDeteccionJugadores: CONFIG_STATS.boss.rangoDeteccion,
        cooldownTeletransporteSegundos: CONFIG_STATS.boss.cooldownTeleportSeg,
        instakill: {
            activo: CONFIG_STATS.boss.instakill.activo,
            minimoPiezasArmaduraRequeridas: CONFIG_STATS.boss.instakill.minimoPiezasRequeridas,
            mensajeAlerta: CONFIG_STATS.boss.instakill.mensaje
        },
        creeper: CONFIG_STATS.boss.creeper
    },

    probabilidadesNivel: CONFIG_STATS.probabilidadesNivelSpawn,
    rarezas: RAREZAS,
    familiasOEntidadesExcluidas: FILTRO_ENTIDADES.excluidas,
    mobsCandidatosBoss: FILTRO_ENTIDADES.candidatosBoss,

    cofresYPescaRPG: {
        probabilidadCofreGenerarLoot: CONFIG_DROPS.cofresYPesca.probabilidadCofreGenerarLoot,
        probabilidadPescaLoot: CONFIG_DROPS.cofresYPesca.probabilidadPescaLoot,
        probabilidadLegendario: CONFIG_DROPS.cofresYPesca.distribucionRarezas.legendario,
        probabilidadEpico: CONFIG_DROPS.cofresYPesca.distribucionRarezas.epico,
        probabilidadRaro: CONFIG_DROPS.cofresYPesca.distribucionRarezas.raro
    },

    lootRPG: {
        probabilidadDropBase: CONFIG_DROPS.enemigos.probabilidadDropBase,
        probabilidadDropBoss: CONFIG_DROPS.enemigos.probabilidadDropBoss,
        dropsPorRareza: CONFIG_DROPS.tablasPorRareza
    },

    modificadores: CONFIG_AFIJOS
};
