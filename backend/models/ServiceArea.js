module.exports = (sequelize, DataTypes) => {
    const ServiceArea = sequelize.define(
        'ServiceArea',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            businessPk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Business',
                    key: 'pk',
                },
            },
            label: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            coverageType: {
                type: DataTypes.ENUM('city', 'county', 'zip', 'custom'),
                allowNull: false,
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['businessPk', 'coverageType', 'value'],
                    name: 'unique_business_coverage'
                }
            ]
        }
    );

    ServiceArea.associate = (db) => {
        db.ServiceArea.belongsTo(db.Business, { foreignKey: 'businessPk' });
    };

    return ServiceArea;
};
