export class Resvaga {
    public id:   string;
    public tipo: string;
    public vaga: string;
    public data: string;
    public hora: string;

    constructor(obj?: Partial<Resvaga>) {
        if (obj) {
            this.id   = obj.id || '';
            this.tipo = obj.tipo || '';
            this.vaga = obj.vaga || '';
            this.data = obj.data || '';
            this.hora = obj.hora || '';
        }
    }

    toString() {
        const objeto = `{
            "id"   :   "${this.id}",
            "tipo" :   "${this.tipo}",
            "vaga" :   "${this.vaga}",
            "data" :   "${this.data}",
            "hora" :   "${this.hora}",
        }`;
        return objeto;
    }

    toFirestore() {
        const Resvaga = {
            id   : this.id,
            tipo : this.tipo,
            vaga : this.vaga,
            data : this.data,
            hora : this.hora,
        };
        return Resvaga;
    }
}
