const { PrismaClient } = require("@prisma/client");
const database = new PrismaClient();

async function main() {
    try {
        const categories = [
            {
                name: "Медицина",
            },
            {
                name: "Тактика",
            },
            {
                name: "Фізична підготовка",
            },
            {
                name: "Дрони",
            },
            {
                name: "Поводження зі зброєю",
            },
            {
                name: "Базова військова підготовка",
            },
        ];

        await database.category.deleteMany();
        for (const category of categories) {
            await database.category.create({
              data: {
                name: category.name,
              },
            });
          }

        await database.level.deleteMany();

        await database.level.createMany({
            data: [
                { name: "Для Військових" },
                { name: "Для Цивільних" },
                { name: "Для Людей З Інвалідністю" },
                { name: "Для Всіх" },
                { name: "Для Ветеранів" },
                { name: "Для Іноземців" },
            ],
            skipDuplicates: true, // Пропускає дублікати
        });

        await database.city.deleteMany();

        await database.city.createMany({
            data: [
                { name: "Київ" },
                { name: "Львів" },
                { name: "Дніпро" },
                { name: "Одеса" },
                { name: "Івано-Франківськ" },
                { name: "Чернігів" },
                { name: "Рівне" },
            ],
            skipDuplicates: true, // Пропускає дублікати
        });
        


        console.log("Seeding successfully");
    } catch (error) {
        console.log("Seeding failed", error);
    } finally {
        await database.$disconnect();
    }
}

main();