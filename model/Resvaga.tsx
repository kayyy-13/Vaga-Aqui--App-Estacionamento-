export class Resvaga {
    public id:   string;
    public tipo: string;
    public idVaga: string;
    public data: string;
    public hora: string;

    constructor(obj?: Partial<Resvaga>) {
        if (obj) {
            this.id   = obj.id || '';
            this.tipo = obj.tipo || '';
            this.idVaga = obj.idVaga || '';
            this.data = obj.data || '';
            this.hora = obj.hora || '';
        }
    }

    toString() {
        const objeto = `{
            "id"   :   "${this.id}",
            "tipo" :   "${this.tipo}",
            "idVaga" :   "${this.idVaga}",
            "data" :   "${this.data}",
            "hora" :   "${this.hora}",
        }`;
        return objeto;
    }

    toFirestore() {
        const Resvaga = {
            id   : this.id,
            tipo : this.tipo,
            idVaga : this.idVaga,
            data : this.data,
            hora : this.hora,
        };
        return Resvaga;
    }
}
