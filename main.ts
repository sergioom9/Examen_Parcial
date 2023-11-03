import express, { Request, Response } from "npm:express@4.18.2";
import { MonumentoModel, MonumentoModelType } from "./Monumento.ts";
import mongoose from "npm:mongoose@7.6.3";

type dataAPI1 = {
    country_code: string|null,
    postal_code: string|null,
    state: string|null,
    place_name: string|null,
    lat: string|null,
    lng: string|null
    };
type dataAPI2={
    abbreviation: string|null,
    client_ip: string|null,
    datetime: string|null,
    day_of_week: number|null,
    day_of_year: number|null,
    dst: boolean|null,
    dst_from: any|null,
    dst_offset: number|null,
    dst_until: any|null,
    raw_offset: number|null,
    timezone: string|null,
    unixtime: number|null,
    utc_datetime: string|null,
    utc_offset: string|null,
    week_number: number|null
}


console.log("Intentando conectarme a mongoo...");
try{

await mongoose.connect("mongodb+srv://sergioom9:nebrija22@cluster0.9dzkoo1.mongodb.net/?retryWrites=true&w=majority");
console.log("Conectado a mongo...");

//creacion de express y metodo para usar datos en formato JSON 
const miapp =express();
miapp.use(express.json());

//METODO POST AÑADIR MONUMENTO
miapp.post("/api/monumentos", async (req: Request, res: Response) => {
    //creamos variable de tipo Monumento usando MonumentoModelType y le asignamos body request
    const body: Partial<Omit<MonumentoModelType, "_id">> = req.body;
    const {nombre, descripcion, codigopostal, ciudad,pais,continente,horaactual,condiciones,codigoISO} = body;
    //comprobamos que tengamos todos los datos necesarios 
    if (!nombre || !codigopostal || !descripcion || !codigoISO) {
        res.status(500).send("Faltan datos");
        return;
    }
    //BUscamos si hay algun monumento con el mismo nombre y cp
    const exists = await MonumentoModel.findOne({ codigopostal : body.codigopostal, nombre:body.nombre}).exec();
    if (exists) {
        res.status(400).send("Ya existe una monumento con esos datos");
        return;
    }
    ;
       const URL=`http://api.weatherapi.com/v1/current.json?key=7e63c684e1a241e79b6155232230311&q=${ciudad}`;
       const response = await fetch(URL);
       const data: any = await response.json();
        console.log(data);
        const parsedresponse=JSON.parse(data); 
        const e = parsedresponse.current.condition.text;
        console.log(e);
        const clima2=parsedresponse.current.condition.text;
        res.send({
           e
        });
    
    
    

       //al comprobar que no hay monumento con el mismo Id creamos el disco en Mongo
    const newMonum = await MonumentoModel.create({
        nombre,
        descripcion,
        codigopostal,
        ciudad,
        pais,
        continente,
        clima2,
        codigoISO
    });
    //enviamos respuesta con los Datos Disco creado
    res.status(200).send();
});



 //METODO GET ALL MONUMENTOS
//Obtener todos los discos existentes
miapp.get("/api/monumentos",async (req: Request,res: Response)=>{

    const coleccion = await MonumentoModel.find().exec();

    res.json(coleccion);  //Mando el json con todos los monus

});

//METODO GET MONUMENTOS BY ID
miapp.get("/api/monumentos/:id", async (req: Request, res: Response) => {
    try{
    const id = req.params.id;
    const monumentos = await MonumentoModel.findById(id).exec();
    res.send(monumentos);
    }catch(e){
        res.status(404).send("Get monumentos by ID failed");
    }
  });


//METODO DELETE MONUMENTO BY ID 
miapp.delete("/api/monumentos/:id",async (req:Request,res:Response)=>{
    try{
    const id = req.params.id;
    const monumento = await MonumentoModel.findByIdAndDelete(id).exec();
    if(!monumento) res.status(404).send("No se ha encontrado el monumento a borrar")
    else res.json("Monumento eliminado"); 
    }catch(e){
        res.status(500).send("Delete Monumento failed");
    }    
})

//METODO PUT PARA ACTUALIZAR DATOS MONUMENTO
miapp.put("/api/monumentos/:id",async (req: Request,res: Response)=>{
    try{
    const monumento = req.body; //Especifico que el monumento tiene la información en el body del request
    const identifier = req.params.id;
    if (!monumento.nombre || !monumento.descripcion || !monumento.codigopostal || !monumento.codigoISO) {
        res.status(500).send();
            return;
    }
   const actualizar_monumento = await MonumentoModel.findByIdAndUpdate(identifier,monumento).exec();

    res.send("Actualizacion completada");
    }catch(e){
    res.status(500).send("Update monumento failed");
    }
    
});




//ponemos servidor a escuchar en el puerto 3000
miapp.listen(3080,()=>{
    console.log("Escuchando en puerto 3000");

});
}catch(e){
    console.log("No ha sido posible conectarse a MongoDb");
}

 


async function getCiudad (codigoIS:string,codigoPos:Number,req:Request,res:Response):Promise<void>{
         
    try {
        const url = `https://zip-api.eu/api/v1/info/${codigoIS}-${codigoPos}`;
        const response = await fetch(url);

        if (response.status !== 200) {
            res.status(500).send();
            return;
        }
        //guardar  
        const data: dataAPI1 = await response.json();
        const ciudad = data.state;

        res.send({
           ciudad
        });
        
    } catch (e) {
        res.status(500).send(e);
    }
};


async function getHora (continent:string,ciudad:string,req:Request,res:Response):Promise<void>{
         
    try {
        const url = `http://worldtimeapi.org/api/timezone/${continent}/${ciudad}`;
        const response = await fetch(url);

        if (response.status !== 200) {
            res.status(500).send();
            return;
        }
        //guardar  
        const data: dataAPI2 = await response.json();
        const e = data.datetime;

        res.send({
           e
        });

    } catch (e) {
        res.status(500).send(e);
    }
};

const clima=async(URL:string,req:Request,res:Response):Promise<void>=>{
    try{
   const response = await fetch(URL);
   
    if (response.status !== 200) {
        res.status(500).send();
        return;
    }
    //guardar  
    const data: any = await response.json();
    const parsedresponse=JSON.parse(data); 
    const e = parsedresponse.current.condition.text;

    res.send({
       e
    });

} catch (e) {
    res.status(500).send(e);
}}

