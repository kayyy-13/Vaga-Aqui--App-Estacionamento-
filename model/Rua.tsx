export class Rua {
    public id:      string;
    public rua:    string;
    public vaga:    string;
    public status:  string;

    constructor(obj?: Partial<Rua>){
        if(obj){
            this.id     = obj.id
            this.rua   = obj.rua
            this.vaga   = obj.vaga
            this.status = obj.status
        }
    }

    toString() {
        const objeto = `{
            "id"    :   "${this.id}",
            "rua"  :   "${this.rua}",
            "vaga"  :   "${this.vaga}",
            "status":   "${this.status}"
        }`
        return objeto
    }

    toFirestore(){
        const rua = {
            id      : this.id,
            rua    : this.rua,
            vaga    : this.vaga,
            status  : this.status   
        }
        return rua
    }


}
