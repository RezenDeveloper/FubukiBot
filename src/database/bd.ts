import { MongoClient } from 'mongodb'

const {DATABASE_URL, DATABASE_NAME} = process.env

type Tresolve = (res:any[]) => void
type TresolveOne = (res:any) => void
type Treject = (err:Error) => void

export const MongoSearch = (collectionName:string, query:Object) => {

    return new Promise( (resolve:Tresolve, reject:Treject) => {

        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.find(query).toArray((err, res) => {
                if(err) reject(err)
                resolve(res)
                client.close();
            })
        });
    
    })
}

export const MongoFindOne = (collectionName:string, query:Object) => {
    return new Promise( (resolve:TresolveOne, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.findOne(query)
            .then(value => {
                resolve(value)
            })
            .catch(err => {
                reject(err)
            })
        });
    })
}
    