module.exports = (sequelize, DataTypes) => {
    const OpeningHour = sequelize.define(
        'OpeningHour',
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
            dayOfWeek: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 0,
                    max: 6,
                },
            },
            opens: {
                type: DataTypes.TIME,
                allowNull: true,
            },
            closes: {
                type: DataTypes.TIME,
                allowNull: true,
            },
            closed: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    fields: ['businessPk', 'dayOfWeek'],
                    name: 'unique_business_day'
                }
            ]
        }
    );

    OpeningHour.associate = (db) => {
        db.OpeningHour.belongsTo(db.Business, { foreignKey: 'businessPk' });
    };

    return OpeningHour;
};
