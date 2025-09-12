
module.exports = (sequelize, DataTypes) => {
    const WebsiteProfileSectionItems = sequelize.define(
        'WebsiteProfileSectionItems',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            websiteProfileSectionPk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'WebsiteProfileSection',
                    key: 'pk',
                },
            },
            itemTitle: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            itemDescription: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            itemButtonText: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    )

    WebsiteProfileSectionItems.associate = (db) => {
        db.WebsiteProfileSectionItems.belongsTo(db.WebsiteProfileSection, { foreignKey: 'websiteProfileSectionPk' })
    }

    return WebsiteProfileSectionItems
}
