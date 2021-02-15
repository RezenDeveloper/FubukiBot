import { MongoClient, MongoError } from 'mongodb'

const {DATABASE_URL, DATABASE_NAME} = process.env

type Tresolve = (res:any[]) => void
type Treject = (err:MongoError) => void

export const MongoSearch = (collectionName:string, query:Object) => {
    return new Promise( (resolve:Tresolve, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
    
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.find(query).toArray((err, res) => {
                if(err) reject(err)
                resolve(res)
                client.close();
            })
        });
    })
}
    