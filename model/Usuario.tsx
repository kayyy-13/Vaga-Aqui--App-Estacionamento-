export class Usuario {
    public id:      string;
    public nome:    string;
    public email:   string;
    public senha:   string;
    public fone:    string;
    public PCD:     string;
    public tipo:    string;
    

    constructor(obj?: Partial<Usuario>){
        if(obj){
            this.id     = obj.id
            this.nome   = obj.nome
            this.email  = obj.email
            this.senha  = obj.senha
            this.fone   = obj.fone
            this.PCD    = obj.PCD
            this.tipo   = obj.tipo
        }
    }

    toString() {
        const objeto = `{
            "id"    :   "${this.id}",
            "nome"  :   "${this.nome}",
            "email" :   "${this.email}",
            "senha" :   "${this.senha}",
            "fone"  :   "${this.fone}",
            "PCD"   :   "${this.PCD}",
            "tipo"  :   "${this.tipo}"
        }`
        return objeto
    }

    toFirestore(){
        const usuario = {
            id      : this.id,
            nome    : this.nome,
            email   : this.email,
            senha   : this.senha,
            fone    : this.fone,
            PCD     : this.PCD,
            tipo    : this.tipo
        }
        return usuario
    }


}