module.exports = (sequelize, DataTypes) => {
    const License = sequelize.define(
        'License',
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
            licenseNo: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            authority: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            state: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            expiresOn: {
                type: DataTypes.DATEONLY,
                allowNull: true,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    );

    License.associate = (db) => {
        db.License.belongsTo(db.Business, { foreignKey: 'businessPk' });
    };

    return License;
};
