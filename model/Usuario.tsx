export class Usuario {
    public id:      string;
    public nome:    string;
    public email:   string;
    public senha:   string;
    public fone:    string;
    public PCD:     string;
    public tipo:    string;
    public bloqueado: boolean;
    

    constructor(obj?: Partial<Usuario>){
        if(obj){
            this.id     = obj.id || '';
            this.nome   = obj.nome || '';
            this.email  = obj.email || '';
            this.senha  = obj.senha || '';
            this.fone   = obj.fone || '';
            this.PCD    = obj.PCD || '';
            this.tipo   = obj.tipo || '';
            this.bloqueado = obj.bloqueado || false;
        } else {
            this.id = '';
            this.nome = '';
            this.email = '';
            this.senha = '';
            this.fone = '';
            this.PCD = '';
            this.tipo = '';
            this.bloqueado = false;
        }
    }

    toFirestore(){
        const usuario = {
            id      : this.id,
            nome    : this.nome,
            email   : this.email,
            senha   : this.senha,
            fone    : this.fone,
            PCD     : this.PCD,
            tipo    : this.tipo,
            bloqueado: this.bloqueado
        }
        return usuario
    }


}