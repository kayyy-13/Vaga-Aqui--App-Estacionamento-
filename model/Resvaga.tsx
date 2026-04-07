export class Resvaga {
    public id:   string;
    public tipo: string;
    public idVaga: string;
    public data: string;
    public hora: string;
    public expiraEm: number;
    public statusReserva: string;
    public finalizadaEm: number;

    constructor(obj?: Partial<Resvaga>) {
        if (obj) {
            this.id   = obj.id || '';
            this.tipo = obj.tipo || '';
            this.idVaga = obj.idVaga || '';
            this.data = obj.data || '';
            this.hora = obj.hora || '';
            this.expiraEm = obj.expiraEm || 0;
            this.statusReserva = obj.statusReserva || 'ativa';
            this.finalizadaEm = obj.finalizadaEm || 0;
        } else {
            this.id = '';
            this.tipo = '';
            this.idVaga = '';
            this.data = '';
            this.hora = '';
            this.expiraEm = 0;
            this.statusReserva = 'ativa';
            this.finalizadaEm = 0;
        }
    }

    toFirestore() {
        const Resvaga = {
            id   : this.id,
            tipo : this.tipo,
            idVaga : this.idVaga,
            data : this.data,
            hora : this.hora,
            expiraEm : this.expiraEm,
            statusReserva: this.statusReserva,
            finalizadaEm: this.finalizadaEm,
        };
        return Resvaga;
    }
}
