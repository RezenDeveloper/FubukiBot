import { ChangeStream, MongoClient } from 'mongodb'

const {DATABASE_URL, DATABASE_NAME} = process.env

type Tresolve = (res:any[]) => void
type TresolveOne = (res:any) => void
type Treject = (err:Error) => void

export const MongoSearch = (collectionName:string, filter:Object) => {

    return new Promise( (resolve:Tresolve, reject:Treject) => {

        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.find(filter).toArray((err, res) => {
                if(err) reject(err)
                resolve(res)
                client.close();
            })
        });
    
    })
}

export const MongoFindOne = (collectionName:string, filter:Object, projection:Object = {}) => {
    return new Promise( (resolve:TresolveOne, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.findOne(filter, { projection }).then(value => {
                resolve(value)
            })
            .catch(err => {
                reject(err)
            }).finally(() => {
                client.close();
            })
        });
    })
}

export const MongoInsertOne = (collectionName:string, value:Object) => {
    return new Promise( (resolve:TresolveOne, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)
            const collection = client.db(DATABASE_NAME).collection(collectionName);
            collection.insertOne(value).then((value) => {
                resolve(value)
            })
            .catch(err => {
                reject(err)
            })
            .finally(() => {
                client.close();
            })
        });
    })
}

export const MongoUpdateOne = (collectionName:string, filter:Object, value:Object) => {
    return new Promise( (resolve:TresolveOne, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)

            const collection = client.db(DATABASE_NAME).collection(collectionName);

            collection.updateOne(filter, { $set:value }).then((value) => {
                resolve(value)
            })
            .catch(err => {
                reject(err)
            })
            .finally(() => {
                client.close();
            })

        });
    })
}

type TresolveWatch = (event:ChangeStream) => void

export const MongoWatch = (collectionName:string, filter:Object) => {
    return new Promise( (resolve:TresolveWatch, reject:Treject) => {
        MongoClient.connect(DATABASE_URL!, { useUnifiedTopology: true }, (err, client) => {
            if(err) reject(err)

            const collection = client.db(DATABASE_NAME).collection(collectionName);

            const pipeline  = [{ '$match': filter }]

            const watch = collection.watch(pipeline, { 'fullDocument': 'updateLookup' })

            resolve(watch)
        });
    })
}
    