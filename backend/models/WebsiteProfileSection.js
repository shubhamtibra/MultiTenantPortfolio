
module.exports = (sequelize, DataTypes) => {
    const WebsiteProfileSection = sequelize.define(
        'WebsiteProfileSection',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            websiteProfilePk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'WebsiteProfile',
                    key: 'pk',
                },
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            logo: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            buttonText: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    )

    WebsiteProfileSection.associate = (db) => {
        db.WebsiteProfileSection.belongsTo(db.WebsiteProfile, { foreignKey: 'websiteProfilePk' })
        db.WebsiteProfileSection.hasMany(db.WebsiteProfileSectionItems, { foreignKey: 'websiteProfileSectionPk' })
    }

    return WebsiteProfileSection
}
