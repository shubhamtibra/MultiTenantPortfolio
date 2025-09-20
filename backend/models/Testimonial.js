module.exports = (sequelize, DataTypes) => {
    const Testimonial = sequelize.define(
        'Testimonial',
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
            authorName: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            quote: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: 1,
                    max: 5,
                },
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                defaultValue: 100,
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

    Testimonial.associate = (db) => {
        db.Testimonial.belongsTo(db.Business, { foreignKey: 'businessPk' });
    };

    return Testimonial;
};
