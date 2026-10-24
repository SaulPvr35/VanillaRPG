import { CONFIG_RPG } from '../config/variablesGlobales.js';

export class EntidadRPG {
    constructor(entidadMinecraft) {
        this.entidad = entidadMinecraft;
        this.nivel = 1;
        this.saludBase = 20;
        this.saludMaximaTotal = 20;
        this.vidaExtraVirtual = 0; // Reserva matemática para mobs RPG
        this.esBossEspecial = false;
        this.modificadores = [];
    }

    // Calcula el nivel: del 1 al 100 para cualquier mob, y determina si se corona como BOSS
    generarNivel() {
        const random = Math.random();
        if (random < CONFIG_RPG.probabilidadesNivel.bajo.prob) {
            this.nivel = Math.floor(Math.random() * 20) + 1; // 1-20
        } else if (random < 0.90) {
            this.nivel = Math.floor(Math.random() * 30) + 21; // 21-50
        } else if (random < 0.99) {
            this.nivel = Math.floor(Math.random() * 49) + 51; // 51-99
        } else {
            this.nivel = 100; // 100
        }

        // Determinar si es un BOSS:
        const esCandidato = CONFIG_RPG.mobsCandidatosBoss.includes(this.entidad.typeId);
        if (esCandidato && Math.random() < CONFIG_RPG.configuracionBosses.probabilidadAparicionBoss) {
            this.esBossEspecial = true;
        }

        return this.nivel;
    }

    // Selecciona subcategorías/modificadores con probabilidad escalada por nivel
    seleccionarModificadores() {
        this.modificadores = [];

        // Si es Boss: tiene garantizado tener modificadores (hasta 4)
        if (this.esBossEspecial) {
            this.asignarAfijosAleatorios(4);
            return this.modificadores;
        }

        // Mobs normales (hostiles o pasivos): la probabilidad de tener efectos depende de su nivel
        const regla = CONFIG_RPG.probabilidadesAfijosPorNivel.find(r => 
            this.nivel >= r.nivelMin && this.nivel <= r.nivelMax
        );

        if (!regla) return this.modificadores;

        // Tirada para ver si este mob califica para tener efectos
        if (Math.random() > regla.probTenerEfectos) {
            return this.modificadores; // No tiene efectos, es un mob normal sin afijos
        }

        this.asignarAfijosAleatorios(regla.maxAfijos);
        return this.modificadores;
    }

    // Asigna afijos según la lista disponible y el nivel
    asignarAfijosAleatorios(limiteMaximo) {
        const disponibles = CONFIG_RPG.modificadores.filter(m => this.nivel >= m.nivelMinimo);

        for (const mod of disponibles) {
            if (this.modificadores.length >= limiteMaximo) break;

            const yaTieneTipoSimilar = this.modificadores.some(m => 
                (m.id.startsWith("fuerza") && mod.id.startsWith("fuerza")) ||
                (m.id.startsWith("velocidad") && mod.id.startsWith("velocidad"))
            );
            if (yaTieneTipoSimilar) continue;

            const prob = this.esBossEspecial ? mod.probabilidad * 1.5 : mod.probabilidad;
            if (Math.random() < prob) {
                this.modificadores.push(mod);
            }
        }
    }

    // Aplica la etiqueta visual
    aplicarEtiquetaVisual() {
        if (!this.entidad.isValid()) return;

        let colorNivel = "§a"; // Verde (<50)
        if (this.nivel >= 50) colorNivel = "§e"; // Amarillo
        if (this.nivel >= 80) colorNivel = "§c"; // Rojo

        const nombreOriginal = this.entidad.typeId.split(":")[1];
        const componenteSalud = this.entidad.getComponent("minecraft:health");
        
        let vidaActual = 20;
        if (componenteSalud) {
            vidaActual = Math.max(0, Math.ceil(componenteSalud.currentValue + this.vidaExtraVirtual));
        }

        const multDanioBase = this.esBossEspecial 
            ? CONFIG_RPG.configuracionBosses.multiplicadorDanioBoss 
            : CONFIG_RPG.multiplicadorDanio;
        const factorDanio = (1 + (this.nivel * multDanioBase)).toFixed(1);

        const prefijoBoss = this.esBossEspecial ? CONFIG_RPG.configuracionBosses.prefijoBoss : "";
        const textoModificadores = this.modificadores.length > 0 
            ? " " + this.modificadores.map(m => m.etiqueta).join(" ") 
            : "";

        const linea1 = `${prefijoBoss}${colorNivel}[Lv. ${this.nivel}] §f${nombreOriginal}${textoModificadores}`;
        const linea2 = `§c❤ ${vidaActual}/${this.saludMaximaTotal} §7| §6⚔ ${factorDanio}x`;

        this.entidad.nameTag = `${linea1}\n${linea2}`;
    }

    // Configura salud y efectos especiales
    inicializarEstadisticas() {
        if (!this.entidad.isValid()) return;

        const componenteSalud = this.entidad.getComponent("minecraft:health");
        this.saludBase = componenteSalud ? componenteSalud.defaultValue : 20;

        // Escala de vida: Los bosses multiplican su vida significativamente
        const multVida = this.esBossEspecial 
            ? CONFIG_RPG.configuracionBosses.multiplicadorVidaBoss 
            : CONFIG_RPG.multiplicadorVida;

        this.saludMaximaTotal = Math.ceil(this.saludBase + ((this.nivel - 1) * multVida));
        this.vidaExtraVirtual = this.saludMaximaTotal - this.saludBase;

        // Si es Boss: otorgar efectos infinitos permanentes acordes a su naturaleza
        if (this.esBossEspecial) {
            this.aplicarEfectosInfinitosBoss();
        }

        // Aplicar afijos y modificadores (si la probabilidad lo determinó)
        this.seleccionarModificadores();
        for (const mod of this.modificadores) {
            for (const ef of mod.efectos) {
                const amplificador = Math.max(0, ef.nivel - 1);
                this.entidad.addEffect(ef.tipo, 20000000, {
                    amplifier: amplificador,
                    showParticles: true
                });
            }
        }

        // Persistir propiedades dinámicas
        try {
            this.entidad.setDynamicProperty("nivel_rpg", this.nivel);
            this.entidad.setDynamicProperty("salud_maxima_rpg", this.saludMaximaTotal);
            this.entidad.setDynamicProperty("salud_base_rpg", this.saludBase);
            this.entidad.setDynamicProperty("vida_extra_virtual_rpg", this.vidaExtraVirtual);
            this.entidad.setDynamicProperty("es_boss_rpg", this.esBossEspecial);
            this.entidad.setDynamicProperty("modificadores_rpg", JSON.stringify(this.modificadores.map(m => m.etiqueta)));
        } catch (_) {}

        this.aplicarEtiquetaVisual();
    }

    // Efectos pasivos de los Bosses
    aplicarEfectosInfinitosBoss() {
        try {
            const nivelFuerza = this.nivel >= 50 ? 2 : 1;
            this.entidad.addEffect("strength", 20000000, { amplifier: nivelFuerza, showParticles: true });
            this.entidad.addEffect("fire_resistance", 20000000, { amplifier: 0, showParticles: false });

            // Si es un Creeper Boss: otorgar velocidad extrema permanente
            if (this.entidad.typeId === "minecraft:creeper") {
                const velAmp = this.nivel >= 50 ? 2 : 1;
                this.entidad.addEffect("speed", 20000000, { amplifier: velAmp, showParticles: true });
            }
        } catch (error) {
            console.warn(`Error al aplicar efectos infinitos de boss: ${error}`);
        }
    }
}
