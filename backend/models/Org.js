module.exports = (sequelize, DataTypes) => {
    const Org = sequelize.define(
        'Org',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
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

    Org.associate = (db) => {
        db.Org.hasMany(db.User, { foreignKey: 'orgPk' });
        db.Org.hasMany(db.Business, { foreignKey: 'orgPk' });
    };

    return Org;
};
