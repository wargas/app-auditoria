import csv from 'csv-parser'
const parser = csv()

parser.on("data", console.log)



parser.end()