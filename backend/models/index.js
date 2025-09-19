'use strict'
var fs = require('fs')
var path = require('path')

var Sequelize = require('sequelize')

var basename = path.basename(__filename)
const withPagination = require('sequelize-cursor-pagination')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

let sequelizeInstance = null


const initSequelize = () => {
  if (sequelizeInstance === null) {
    sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectModule: require('pg'),
      logging: false,
      pool: {
        max: 10,
      },
    })
  }
  return sequelizeInstance
}

const validateSequelizeInstance = async (sequelizeInstance) => {
  await sequelizeInstance.authenticate().catch((err) => {
    console.error('Sequelize unable to connect to the database:', err)
    exitFatally(1000)
  })
  console.log('Sequelize connection successfully established.')
}

const loadAllModels = (fs, sequelize) => {
  let db = {}
  fs.readdirSync(__dirname)
    .filter((file) => {
      return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    })
    .forEach((file) => {
      try {
        // var model = sequelize['import'](path.join(__dirname, file));
        const modelFilePath = path.join(__dirname, file)
        const model = require(`${modelFilePath}`)(sequelize, Sequelize.DataTypes)
        db[model.name] = withPagination({ primaryKeyField: 'pk' })(model)
      } catch (err) {
        console.error('You probably have a file inside models folder that does not export a model')
        throw err
      }
    })

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })
  return db
}

const loadDb = () => {
  const sequelize = initSequelize()
  // dont wait for validation. sequelize instance can be returned
  const validSeqPromise = validateSequelizeInstance(sequelizeInstance)

  let db = loadAllModels(fs, sequelize)
  db.sequelize = sequelize
  db.Sequelize = Sequelize

  return db
}

module.exports = loadDb
