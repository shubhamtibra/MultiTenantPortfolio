module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define(
        'Service',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            category: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    );

    Service.associate = (db) => {
        db.Service.belongsToMany(db.Business, {
            through: db.BusinessService,
            foreignKey: 'servicePk',
            otherKey: 'businessPk'
        });
    };

    return Service;
};
