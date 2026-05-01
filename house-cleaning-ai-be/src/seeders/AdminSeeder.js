import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/database.js';
import Admin from '../models/AdminModel.js';
import { ADMINSTATUS } from '../utils/statusUtils.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const sampleAdmins = [
    {
        Admin_Id: 1,
        Username: 'superadmin',
        Password: 'SuperSecret123!',
        Full_Name: 'Super Admin',
        Email: 'superadmin@example.com',
        Phone: '0910000000',
        Avatar: '',
        Role_Level: 'Super',
        Status: ADMINSTATUS.ACTIVE,
    },
    {
        Admin_Id: 2,
        Username: 'admin',
        Password: 'AdminPass123!',
        Full_Name: 'Main Admin',
        Email: 'admin@example.com',
        Phone: '0910000001',
        Avatar: '',
        Role_Level: 'Admin',
        Status: ADMINSTATUS.ACTIVE,
    },
];

async function seedAdmins() {
    try {
        await connectDB();
        console.log('Starting admin seeder');

        for (const adminData of sampleAdmins) {
            const filter = { Username: adminData.Username };

            let hashedPassword;
            if (adminData.Password) {
                const salt = await bcrypt.genSalt(SALT_ROUNDS);
                hashedPassword = await bcrypt.hash(adminData.Password, salt);
            }

            const update = {
                $set: {
                    Admin_Id: adminData.Admin_Id,
                    Full_Name: adminData.Full_Name,
                    Email: adminData.Email,
                    Phone: adminData.Phone,
                    Avatar: adminData.Avatar,
                    Role_Level: adminData.Role_Level,
                    Status: adminData.Status,
                },
                $setOnInsert: {
                    Username: adminData.Username,
                    ...(hashedPassword ? { Password: hashedPassword } : {}),
                },
            };

            const options = {
                upsert: true,
                returnDocument: 'after',
                setDefaultsOnInsert: true,
            };

            const result = await Admin.findOneAndUpdate(filter, update, options).exec();
            console.log(`Seeded admin: ${adminData.Username} (id: ${result._id})`);
        }

        console.log('Admin seeder finished');
    } catch (err) {
        console.error('Admin seeder error', err);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

seedAdmins();