module.exports = (sequelize, DataTypes) => {
    const BusinessService = sequelize.define(
        'BusinessService',
        {
            businessPk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Business',
                    key: 'pk',
                },
            },
            servicePk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Service',
                    key: 'pk',
                },
            },
            customBlurb: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            featured: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            priceDisplay: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                defaultValue: 100,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    );

    BusinessService.associate = (db) => {
        db.BusinessService.belongsTo(db.Business, { foreignKey: 'businessPk' });
        db.BusinessService.belongsTo(db.Service, { foreignKey: 'servicePk' });
    };

    return BusinessService;
};
