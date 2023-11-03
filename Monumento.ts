import mongoose from "npm:mongoose@7.6.3";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const MonumentoSchema=new Schema({
    nombre: {type:String,required:true},
    descripcion: {type:String,required:true},
    ciudad: {type:String,required:false},
    pais: {type:String,required:false},
    continente: {type:String,required:false},
    horaactual: {type:String,required:false},
    condiciones: {type:String,required:false},
    codigopostal : {type:Number,required:true},
    codigoISO: {type:String,required:true}
        
});

export type MonumentoModelType={
    nombre: string,
    descripcion : string,
    ciudad:string,
    pais:string,
    continente:string,
    horaactual:string,
    condiciones:string,
    codigopostal:Number,
    codigoISO: string    
   }

export const MonumentoModel = mongoose.model<MonumentoModelType>("Monumentos",MonumentoSchema);

