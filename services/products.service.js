const { readFile, writeFile } = require("fs/promises")

module.exports = class File {

    constructor(fileName) {
        this._fileName = fileName
        this._counter = 1
    }
    async save(object) {
        this._counter = 1
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        let isObject = objectArray.find(obj => obj.id === this._counter)
        while (isObject) {
            this._counter = this._counter + 1
            isObject = objectArray.find(obj => obj.id === this._counter)
        }
        const newObject =  {...object, id: this._counter}
        objectArray.push(newObject)
        await writeFile(`./${this._fileName}`, JSON.stringify(objectArray),{ encoding: "utf-8", flag:'w'})
        return newObject
    }
    async getById(id) {
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        const object = objectArray.find(obj => obj.id === id)
        if (!object) 
            return { message: "There is not any product with that id" }
        return object
    }
    async getAll() {
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        return objectArray
    }
    async getRandom() {
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        const randomIndex = Math.floor(Math.random() * objectArray.length)
        return objectArray[randomIndex]
    }
    async deleteById(id) {
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        const object = objectArray.findIndex(obj => obj.id === id)
        if (object < 0) 
            return { message: "There is not any product with that id" }
        const filteredData = objectArray.filter(obj => obj.id !== id)
        await writeFile(`./${this._fileName}`, JSON.stringify(filteredData),{ encoding: "utf-8", flag:'w'})
        return filteredData
    }
    async replaceById(object) {
        const fileContent = await readFile(`./${this._fileName}`, { encoding: "utf-8", flag:'r'})
        const objectArray = JSON.parse(fileContent)
        const objectIndex = objectArray.findIndex(obj => obj.id === object.id)
        if (objectIndex < 0) 
            return { message: "There is not any product with that id" }
        objectArray[objectIndex] = object
        await writeFile(`./${this._fileName}`, JSON.stringify(objectArray),{ encoding: "utf-8", flag:'w'})
        return object
    }
    async deleteAll() {
        await writeFile(`./${this._fileName}`, '[]',{ encoding: "utf-8", flag:'w'})
    };
}