// src/seeders/cleanerSeeder.js
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/database.js';
import Cleaner from '../models/CleanerModel.js';
import { CLEANER_APPROVAL_STATUS, CLEANER_STATUS } from '../utils/statusUtils.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const sampleCleaners = [
    { Phone_Number: '0800000001', Password: 'Password123!', Full_Name: 'Le Van An', Identity_Card: 'cccd_1.jpg', Selfie_Image: 'selfie_1.jpg', Rating: 4.5, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000002', Password: 'Password123!', Full_Name: 'Tran Thi Bich', Identity_Card: 'cccd_2.jpg', Selfie_Image: 'selfie_2.jpg', Rating: 4.7, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000003', Password: 'Password123!', Full_Name: 'Nguyen Van Cuong', Identity_Card: 'cccd_3.jpg', Selfie_Image: 'selfie_3.jpg', Rating: 4.2, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000004', Password: 'Password123!', Full_Name: 'Pham Thi Dao', Identity_Card: 'cccd_4.jpg', Selfie_Image: 'selfie_4.jpg', Rating: 4.9, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000005', Password: 'Password123!', Full_Name: 'Hoang Van Duc', Identity_Card: 'cccd_5.jpg', Selfie_Image: 'selfie_5.jpg', Rating: 3.9, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000006', Password: 'Password123!', Full_Name: 'Vo Thi Giang', Identity_Card: 'cccd_6.jpg', Selfie_Image: 'selfie_6.jpg', Rating: 4.3, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000007', Password: 'Password123!', Full_Name: 'Dang Van Hung', Identity_Card: 'cccd_7.jpg', Selfie_Image: 'selfie_7.jpg', Rating: 4.0, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000008', Password: 'Password123!', Full_Name: 'Bui Thi Khanh', Identity_Card: 'cccd_8.jpg', Selfie_Image: 'selfie_8.jpg', Rating: 4.6, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000009', Password: 'Password123!', Full_Name: 'Do Van Long', Identity_Card: 'cccd_9.jpg', Selfie_Image: 'selfie_9.jpg', Rating: 4.1, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000010', Password: 'Password123!', Full_Name: 'Nguyen Thi Mai', Identity_Card: 'cccd_10.jpg', Selfie_Image: 'selfie_10.jpg', Rating: 5.0, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000011', Password: 'Password123!', Full_Name: 'Ly Van Nam', Identity_Card: 'cccd_11.jpg', Selfie_Image: 'selfie_11.jpg', Rating: 4.4, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000012', Password: 'Password123!', Full_Name: 'Truong Thi Oanh', Identity_Card: 'cccd_12.jpg', Selfie_Image: 'selfie_12.jpg', Rating: 4.8, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000013', Password: 'Password123!', Full_Name: 'Phan Van Phuc', Identity_Card: 'cccd_13.jpg', Selfie_Image: 'selfie_13.jpg', Rating: 4.3, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000014', Password: 'Password123!', Full_Name: 'Huynh Thi Quyen', Identity_Card: 'cccd_14.jpg', Selfie_Image: 'selfie_14.jpg', Rating: 3.8, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000015', Password: 'Password123!', Full_Name: 'Ngo Van Son', Identity_Card: 'cccd_15.jpg', Selfie_Image: 'selfie_15.jpg', Rating: 4.6, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000016', Password: 'Password123!', Full_Name: 'Dinh Thi Tam', Identity_Card: 'cccd_16.jpg', Selfie_Image: 'selfie_16.jpg', Rating: 4.1, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000017', Password: 'Password123!', Full_Name: 'Kieu Van Thai', Identity_Card: 'cccd_17.jpg', Selfie_Image: 'selfie_17.jpg', Rating: 4.7, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000018', Password: 'Password123!', Full_Name: 'Luong Thi Uyen', Identity_Card: 'cccd_18.jpg', Selfie_Image: 'selfie_18.jpg', Rating: 4.2, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000019', Password: 'Password123!', Full_Name: 'Mai Van Viet', Identity_Card: 'cccd_19.jpg', Selfie_Image: 'selfie_19.jpg', Rating: 3.9, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000020', Password: 'Password123!', Full_Name: 'Trinh Thi Xuan', Identity_Card: 'cccd_20.jpg', Selfie_Image: 'selfie_20.jpg', Rating: 4.9, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000021', Password: 'Password123!', Full_Name: 'Nguyen Van Yen', Identity_Card: 'cccd_21.jpg', Selfie_Image: 'selfie_21.jpg', Rating: 4.5, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000022', Password: 'Password123!', Full_Name: 'Tran Thi Anh', Identity_Card: 'cccd_22.jpg', Selfie_Image: 'selfie_22.jpg', Rating: 4.0, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000023', Password: 'Password123!', Full_Name: 'Le Van Binh', Identity_Card: 'cccd_23.jpg', Selfie_Image: 'selfie_23.jpg', Rating: 4.3, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000024', Password: 'Password123!', Full_Name: 'Pham Thi Chi', Identity_Card: 'cccd_24.jpg', Selfie_Image: 'selfie_24.jpg', Rating: 3.7, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000025', Password: 'Password123!', Full_Name: 'Hoang Van Dat', Identity_Card: 'cccd_25.jpg', Selfie_Image: 'selfie_25.jpg', Rating: 4.8, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000026', Password: 'Password123!', Full_Name: 'Vo Thi Em', Identity_Card: 'cccd_26.jpg', Selfie_Image: 'selfie_26.jpg', Rating: 4.1, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000027', Password: 'Password123!', Full_Name: 'Dang Van Phong', Identity_Card: 'cccd_27.jpg', Selfie_Image: 'selfie_27.jpg', Rating: 4.4, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000028', Password: 'Password123!', Full_Name: 'Bui Thi Giang', Identity_Card: 'cccd_28.jpg', Selfie_Image: 'selfie_28.jpg', Rating: 3.9, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000029', Password: 'Password123!', Full_Name: 'Do Van Hieu', Identity_Card: 'cccd_29.jpg', Selfie_Image: 'selfie_29.jpg', Rating: 4.6, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000030', Password: 'Password123!', Full_Name: 'Nguyen Thi Lan', Identity_Card: 'cccd_30.jpg', Selfie_Image: 'selfie_30.jpg', Rating: 4.2, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000031', Password: 'Password123!', Full_Name: 'Ly Van Minh', Identity_Card: 'cccd_31.jpg', Selfie_Image: 'selfie_31.jpg', Rating: 4.9, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000032', Password: 'Password123!', Full_Name: 'Truong Thi Nga', Identity_Card: 'cccd_32.jpg', Selfie_Image: 'selfie_32.jpg', Rating: 4.0, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000033', Password: 'Password123!', Full_Name: 'Phan Van Phat', Identity_Card: 'cccd_33.jpg', Selfie_Image: 'selfie_33.jpg', Rating: 4.3, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000034', Password: 'Password123!', Full_Name: 'Huynh Thi Quynh', Identity_Card: 'cccd_34.jpg', Selfie_Image: 'selfie_34.jpg', Rating: 3.8, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000035', Password: 'Password123!', Full_Name: 'Ngo Van Tai', Identity_Card: 'cccd_35.jpg', Selfie_Image: 'selfie_35.jpg', Rating: 4.7, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000036', Password: 'Password123!', Full_Name: 'Dinh Thi Thao', Identity_Card: 'cccd_36.jpg', Selfie_Image: 'selfie_36.jpg', Rating: 4.1, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000037', Password: 'Password123!', Full_Name: 'Kieu Van Trung', Identity_Card: 'cccd_37.jpg', Selfie_Image: 'selfie_37.jpg', Rating: 4.5, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000038', Password: 'Password123!', Full_Name: 'Luong Thi Vy', Identity_Card: 'cccd_38.jpg', Selfie_Image: 'selfie_38.jpg', Rating: 3.9, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000039', Password: 'Password123!', Full_Name: 'Mai Van Xuan', Identity_Card: 'cccd_39.jpg', Selfie_Image: 'selfie_39.jpg', Rating: 4.8, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000040', Password: 'Password123!', Full_Name: 'Trinh Thi Yen', Identity_Card: 'cccd_40.jpg', Selfie_Image: 'selfie_40.jpg', Rating: 4.2, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },

    { Phone_Number: '0800000041', Password: 'Password123!', Full_Name: 'Nguyen Van Bao', Identity_Card: 'cccd_41.jpg', Selfie_Image: 'selfie_41.jpg', Rating: 4.6, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000042', Password: 'Password123!', Full_Name: 'Tran Thi Cam', Identity_Card: 'cccd_42.jpg', Selfie_Image: 'selfie_42.jpg', Rating: 4.0, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000043', Password: 'Password123!', Full_Name: 'Le Van Duy', Identity_Card: 'cccd_43.jpg', Selfie_Image: 'selfie_43.jpg', Rating: 4.3, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000044', Password: 'Password123!', Full_Name: 'Pham Thi Hoa', Identity_Card: 'cccd_44.jpg', Selfie_Image: 'selfie_44.jpg', Rating: 3.7, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000045', Password: 'Password123!', Full_Name: 'Hoang Van Kiet', Identity_Card: 'cccd_45.jpg', Selfie_Image: 'selfie_45.jpg', Rating: 4.9, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000046', Password: 'Password123!', Full_Name: 'Vo Thi Linh', Identity_Card: 'cccd_46.jpg', Selfie_Image: 'selfie_46.jpg', Rating: 4.2, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000047', Password: 'Password123!', Full_Name: 'Dang Van Nam', Identity_Card: 'cccd_47.jpg', Selfie_Image: 'selfie_47.jpg', Rating: 4.5, Approval_Status: CLEANER_APPROVAL_STATUS.PENDING, Is_Online: false, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000048', Password: 'Password123!', Full_Name: 'Bui Thi Nhi', Identity_Card: 'cccd_48.jpg', Selfie_Image: 'selfie_48.jpg', Rating: 3.8, Approval_Status: CLEANER_APPROVAL_STATUS.REJECTED, Is_Online: false, Status: CLEANER_STATUS.INACTIVE },
    { Phone_Number: '0800000049', Password: 'Password123!', Full_Name: 'Do Van Phu', Identity_Card: 'cccd_49.jpg', Selfie_Image: 'selfie_49.jpg', Rating: 4.7, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: true, Status: CLEANER_STATUS.ACTIVE },
    { Phone_Number: '0800000050', Password: 'Password123!', Full_Name: 'Nguyen Thi Trang', Identity_Card: 'cccd_50.jpg', Selfie_Image: 'selfie_50.jpg', Rating: 4.1, Approval_Status: CLEANER_APPROVAL_STATUS.ACTIVE, Is_Online: false, Status: CLEANER_STATUS.ACTIVE }
];

function isBcryptHash(str) {
    return typeof str === 'string' && /^\$2[aby]\$/.test(str);
}

async function ensureHashed(plain) {
    if (!plain) return undefined;
    if (isBcryptHash(plain)) return plain;
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plain, salt);
}

async function seedCleaners() {
    try {
        await connectDB();
        console.log('Starting cleaner seeder');

        for (const c of sampleCleaners) {
            const phone = String(c.Phone_Number).trim();
            const existing = await Cleaner.findOne({ Phone_Number: phone }).select('+Password').exec();

            if (!existing) {
                const hashed = await ensureHashed(c.Password);
                const toCreate = {
                    ...c,
                    Password: hashed
                };
                const created = await Cleaner.create(toCreate);
                console.log(`Created cleaner: ${created.Phone_Number}`);
            } else {
                let changed = false;
                const fields = ['Full_Name', 'Identity_Card', 'Selfie_Image', 'Rating', 'Approval_Status', 'Is_Online', 'Status'];

                for (const f of fields) {
                    if (c[f] !== undefined && existing[f] !== c[f]) {
                        existing[f] = c[f];
                        changed = true;
                    }
                }

                if (c.Password && (!existing.Password || !isBcryptHash(existing.Password))) {
                    existing.Password = await ensureHashed(c.Password);
                    changed = true;
                }

                if (changed) {
                    await existing.save();
                    console.log(`Updated cleaner: ${existing.Phone_Number}`);
                } else {
                    console.log(`No changes for cleaner: ${existing.Phone_Number}`);
                }
            }
        }

        console.log('Cleaner seeder finished');
    } catch (err) {
        console.error('Cleaner seeder error', err);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

seedCleaners();