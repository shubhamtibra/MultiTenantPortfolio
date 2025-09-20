module.exports = (sequelize, DataTypes) => {
    const Business = sequelize.define(
        'Business',
        {
            pk: {
                type: DataTypes.UUID,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            orgPk: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Org',
                    key: 'pk',
                },
            },
            legalName: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            publicName: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            tagline: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            about: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            email: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            phone: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            smsNumber: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            website: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            addressLine1: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            addressLine2: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            city: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            region: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            postalCode: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            country: {
                type: DataTypes.TEXT,
                defaultValue: 'US',
                allowNull: false,
            },
            yearsInBusiness: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            licensed: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            insured: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
                allowNull: false,
            },
            meta: {
                type: DataTypes.JSONB,
                defaultValue: {},
                allowNull: false,
            },
            logoUrl: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            freezeTableName: true,
            timestamps: true,
        }
    );

    Business.associate = (db) => {
        db.Business.belongsTo(db.Org, { foreignKey: 'orgPk' });
        db.Business.hasMany(db.WebsiteProfile, { foreignKey: 'businessPk' });
        db.Business.hasMany(db.Testimonial, { foreignKey: 'businessPk' });
        db.Business.hasMany(db.OpeningHour, { foreignKey: 'businessPk' });
        db.Business.hasMany(db.License, { foreignKey: 'businessPk' });
        db.Business.hasMany(db.ServiceArea, { foreignKey: 'businessPk' });
        db.Business.belongsToMany(db.Service, {
            through: db.BusinessService,
            foreignKey: 'businessPk',
            otherKey: 'servicePk'
        });
    };

    return Business;
};
