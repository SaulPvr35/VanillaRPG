import { world, system } from '@minecraft/server';

/**
 * Gestor del Nivel y Progresión RPG del Jugador
 */
export class SistemaJugadorRPG {
    /**
     * Obtiene el nivel RPG actual del jugador (1 a 100)
     * @param {import('@minecraft/server').Player} jugador 
     * @returns {number}
     */
    static obtenerNivel(jugador) {
        if (!jugador || !jugador.isValid()) return 1;
        try {
            return jugador.getDynamicProperty("jugador_nivel_rpg") || 1;
        } catch (_) {
            return 1;
        }
    }

    /**
     * Obtiene la experiencia acumulada en el nivel actual
     * @param {import('@minecraft/server').Player} jugador 
     * @returns {number}
     */
    static obtenerXP(jugador) {
        if (!jugador || !jugador.isValid()) return 0;
        try {
            return jugador.getDynamicProperty("jugador_xp_rpg") || 0;
        } catch (_) {
            return 0;
        }
    }

    /**
     * XP necesaria para subir al siguiente nivel
     * @param {number} nivelActual 
     * @returns {number}
     */
    static calcularXPRequerida(nivelActual) {
        return Math.floor(100 * Math.pow(1.12, nivelActual - 1));
    }

    /**
     * Añade experiencia RPG al jugador al derrotar criaturas
     * @param {import('@minecraft/server').Player} jugador 
     * @param {number} nivelEnemigo 
     * @param {boolean} esBoss 
     */
    static otorgarXPPorVictoria(jugador, nivelEnemigo, esBoss = false) {
        if (!jugador || !jugador.isValid()) return;

        let xpGanada = nivelEnemigo * 15;
        if (esBoss) xpGanada *= 5; // Los bosses dan x5 de experiencia

        let nivelActual = this.obtenerNivel(jugador);
        if (nivelActual >= 100) return; // Nivel máximo alcanzado

        let xpActual = this.obtenerXP(jugador) + xpGanada;
        let xpNecesaria = this.calcularXPRequerida(nivelActual);

        let subioNivel = false;
        while (xpActual >= xpNecesaria && nivelActual < 100) {
            xpActual -= xpNecesaria;
            nivelActual++;
            subioNivel = true;
            xpNecesaria = this.calcularXPRequerida(nivelActual);
        }

        try {
            jugador.setDynamicProperty("jugador_nivel_rpg", nivelActual);
            jugador.setDynamicProperty("jugador_xp_rpg", xpActual);
        } catch (_) {}

        if (subioNivel) {
            jugador.sendMessage(`§6★ §e¡HAS SUBIDO DE NIVEL RPG! §6★\n§fAhora eres §bNivel ${nivelActual}§f. ¡Tus ataques causan más daño!`);
            try {
                jugador.dimension.spawnParticle("minecraft:totem_particle", jugador.location);
                jugador.playSound("random.levelup", { pitch: 1.0, volume: 1.0 });
            } catch (_) {}
        }
    }

    /**
     * Multiplicador de daño del jugador basado en su nivel
     * Nivel 1 = x1.0, Nivel 50 = x2.5, Nivel 100 = x4.0 (+3% por nivel)
     * @param {number} nivel 
     * @returns {number}
     */
    static calcularMultiplicadorDanio(nivel) {
        return 1 + ((nivel - 1) * 0.03);
    }
}
