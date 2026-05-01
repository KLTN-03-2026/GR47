import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB, disconnectDB } from '../config/database.js';
import Client from '../models/ClientModel.js';
import { CLIENTSTATUS } from '../utils/statusUtils.js';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const sampleClients = [
    { Phone_Number: '0900000001', Password: 'Password123!', Full_Name: 'Nguyen Van An', Email: 'an1@example.com', Gender: 'male', Birth_Date: '1990-01-01', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000002', Password: 'Password123!', Full_Name: 'Tran Thi Bich', Email: 'bich2@example.com', Gender: 'female', Birth_Date: '1991-02-02', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000003', Password: 'Password123!', Full_Name: 'Le Van Cuong', Email: 'cuong3@example.com', Gender: 'male', Birth_Date: '1992-03-03', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000004', Password: 'Password123!', Full_Name: 'Pham Thi Dao', Email: 'dao4@example.com', Gender: 'female', Birth_Date: '1993-04-04', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000005', Password: 'Password123!', Full_Name: 'Hoang Van Duc', Email: 'duc5@example.com', Gender: 'male', Birth_Date: '1994-05-05', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000006', Password: 'Password123!', Full_Name: 'Vo Thi Giang', Email: 'giang6@example.com', Gender: 'female', Birth_Date: '1995-06-06', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000007', Password: 'Password123!', Full_Name: 'Dang Van Hung', Email: 'hung7@example.com', Gender: 'male', Birth_Date: '1996-07-07', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.INACTIVE },
    { Phone_Number: '0900000008', Password: 'Password123!', Full_Name: 'Bui Thi Khanh', Email: 'khanh8@example.com', Gender: 'female', Birth_Date: '1997-08-08', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000009', Password: 'Password123!', Full_Name: 'Do Van Long', Email: 'long9@example.com', Gender: 'male', Birth_Date: '1998-09-09', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000010', Password: 'Password123!', Full_Name: 'Nguyen Thi Mai', Email: 'mai10@example.com', Gender: 'female', Birth_Date: '1999-10-10', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.BLOCKED },

    { Phone_Number: '0900000011', Password: 'Password123!', Full_Name: 'Ly Van Nam', Email: 'nam11@example.com', Gender: 'male', Birth_Date: '1990-11-11', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000012', Password: 'Password123!', Full_Name: 'Truong Thi Oanh', Email: 'oanh12@example.com', Gender: 'female', Birth_Date: '1991-12-12', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000013', Password: 'Password123!', Full_Name: 'Phan Van Phuc', Email: 'phuc13@example.com', Gender: 'male', Birth_Date: '1992-01-13', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000014', Password: 'Password123!', Full_Name: 'Huynh Thi Quyen', Email: 'quyen14@example.com', Gender: 'female', Birth_Date: '1993-02-14', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000015', Password: 'Password123!', Full_Name: 'Ngo Van Son', Email: 'son15@example.com', Gender: 'male', Birth_Date: '1994-03-15', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000016', Password: 'Password123!', Full_Name: 'Dinh Thi Tam', Email: 'tam16@example.com', Gender: 'female', Birth_Date: '1995-04-16', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000017', Password: 'Password123!', Full_Name: 'Kieu Van Thai', Email: 'thai17@example.com', Gender: 'male', Birth_Date: '1996-05-17', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.INACTIVE },
    { Phone_Number: '0900000018', Password: 'Password123!', Full_Name: 'Luong Thi Uyen', Email: 'uyen18@example.com', Gender: 'female', Birth_Date: '1997-06-18', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000019', Password: 'Password123!', Full_Name: 'Mai Van Viet', Email: 'viet19@example.com', Gender: 'male', Birth_Date: '1998-07-19', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000020', Password: 'Password123!', Full_Name: 'Trinh Thi Xuan', Email: 'xuan20@example.com', Gender: 'female', Birth_Date: '1999-08-20', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.BLOCKED },

    { Phone_Number: '0900000021', Password: 'Password123!', Full_Name: 'Nguyen Van Yen', Email: 'yen21@example.com', Gender: 'male', Birth_Date: '1990-09-21', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000022', Password: 'Password123!', Full_Name: 'Tran Thi Anh', Email: 'anh22@example.com', Gender: 'female', Birth_Date: '1991-10-22', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000023', Password: 'Password123!', Full_Name: 'Le Van Binh', Email: 'binh23@example.com', Gender: 'male', Birth_Date: '1992-11-23', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000024', Password: 'Password123!', Full_Name: 'Pham Thi Chi', Email: 'chi24@example.com', Gender: 'female', Birth_Date: '1993-12-24', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000025', Password: 'Password123!', Full_Name: 'Hoang Van Dat', Email: 'dat25@example.com', Gender: 'male', Birth_Date: '1994-01-25', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000026', Password: 'Password123!', Full_Name: 'Vo Thi Em', Email: 'em26@example.com', Gender: 'female', Birth_Date: '1995-02-26', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000027', Password: 'Password123!', Full_Name: 'Dang Van Phong', Email: 'phong27@example.com', Gender: 'male', Birth_Date: '1996-03-27', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.INACTIVE },
    { Phone_Number: '0900000028', Password: 'Password123!', Full_Name: 'Bui Thi Giang', Email: 'giang28@example.com', Gender: 'female', Birth_Date: '1997-04-28', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000029', Password: 'Password123!', Full_Name: 'Do Van Hieu', Email: 'hieu29@example.com', Gender: 'male', Birth_Date: '1998-05-29', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000030', Password: 'Password123!', Full_Name: 'Nguyen Thi Lan', Email: 'lan30@example.com', Gender: 'female', Birth_Date: '1999-06-30', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.BLOCKED },

    { Phone_Number: '0900000031', Password: 'Password123!', Full_Name: 'Ly Van Minh', Email: 'minh31@example.com', Gender: 'male', Birth_Date: '1990-07-01', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000032', Password: 'Password123!', Full_Name: 'Truong Thi Nga', Email: 'nga32@example.com', Gender: 'female', Birth_Date: '1991-08-02', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000033', Password: 'Password123!', Full_Name: 'Phan Van Phat', Email: 'phat33@example.com', Gender: 'male', Birth_Date: '1992-09-03', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000034', Password: 'Password123!', Full_Name: 'Huynh Thi Quynh', Email: 'quynh34@example.com', Gender: 'female', Birth_Date: '1993-10-04', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000035', Password: 'Password123!', Full_Name: 'Ngo Van Tai', Email: 'tai35@example.com', Gender: 'male', Birth_Date: '1994-11-05', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000036', Password: 'Password123!', Full_Name: 'Dinh Thi Thao', Email: 'thao36@example.com', Gender: 'female', Birth_Date: '1995-12-06', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000037', Password: 'Password123!', Full_Name: 'Kieu Van Trung', Email: 'trung37@example.com', Gender: 'male', Birth_Date: '1996-01-07', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.INACTIVE },
    { Phone_Number: '0900000038', Password: 'Password123!', Full_Name: 'Luong Thi Vy', Email: 'vy38@example.com', Gender: 'female', Birth_Date: '1997-02-08', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000039', Password: 'Password123!', Full_Name: 'Mai Van Xuan', Email: 'xuan39@example.com', Gender: 'male', Birth_Date: '1998-03-09', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000040', Password: 'Password123!', Full_Name: 'Trinh Thi Yen', Email: 'yen40@example.com', Gender: 'female', Birth_Date: '1999-04-10', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.BLOCKED },

    { Phone_Number: '0900000041', Password: 'Password123!', Full_Name: 'Nguyen Van Bao', Email: 'bao41@example.com', Gender: 'male', Birth_Date: '1990-05-11', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000042', Password: 'Password123!', Full_Name: 'Tran Thi Cam', Email: 'cam42@example.com', Gender: 'female', Birth_Date: '1991-06-12', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000043', Password: 'Password123!', Full_Name: 'Le Van Duy', Email: 'duy43@example.com', Gender: 'male', Birth_Date: '1992-07-13', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000044', Password: 'Password123!', Full_Name: 'Pham Thi Hoa', Email: 'hoa44@example.com', Gender: 'female', Birth_Date: '1993-08-14', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000045', Password: 'Password123!', Full_Name: 'Hoang Van Kiet', Email: 'kiet45@example.com', Gender: 'male', Birth_Date: '1994-09-15', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000046', Password: 'Password123!', Full_Name: 'Vo Thi Linh', Email: 'linh46@example.com', Gender: 'female', Birth_Date: '1995-10-16', Address: 'Hải Châu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000047', Password: 'Password123!', Full_Name: 'Dang Van Nam', Email: 'nam47@example.com', Gender: 'male', Birth_Date: '1996-11-17', Address: 'Thanh Khê, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.INACTIVE },
    { Phone_Number: '0900000048', Password: 'Password123!', Full_Name: 'Bui Thi Nhi', Email: 'nhi48@example.com', Gender: 'female', Birth_Date: '1997-12-18', Address: 'Sơn Trà, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000049', Password: 'Password123!', Full_Name: 'Do Van Phu', Email: 'phu49@example.com', Gender: 'male', Birth_Date: '1998-01-19', Address: 'Ngũ Hành Sơn, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.ACTIVE },
    { Phone_Number: '0900000050', Password: 'Password123!', Full_Name: 'Nguyen Thi Trang', Email: 'trang50@example.com', Gender: 'female', Birth_Date: '1999-02-20', Address: 'Liên Chiểu, Đà Nẵng', Avatar: '', Status: CLIENTSTATUS.BLOCKED }
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

async function seedClients() {
    try {
        await connectDB();
        console.log('Starting client seeder');

        for (const c of sampleClients) {
            const phone = String(c.Phone_Number).trim();
            const existing = await Client.findOne({ Phone_Number: phone }).select('+Password').exec();

            if (!existing) {
                const hashed = await ensureHashed(c.Password);
                const toCreate = {
                    Phone_Number: phone,
                    Password: hashed,
                    Full_Name: c.Full_Name,
                    Email: c.Email,
                    Gender: c.Gender,
                    Birth_Date: c.Birth_Date ? new Date(c.Birth_Date) : null,
                    Address: c.Address,
                    Avatar: c.Avatar,
                    Status: c.Status
                };
                const created = await Client.create(toCreate);
                console.log(`Created client: ${created.Phone_Number}`);
            } else {
                let changed = false;

                // cập nhật các trường thông tin nếu khác
                const fields = ['Full_Name', 'Email', 'Gender', 'Address', 'Avatar', 'Status'];
                for (const f of fields) {
                    if (c[f] !== undefined && existing[f] !== c[f]) {
                        existing[f] = c[f];
                        changed = true;
                    }
                }

                if (c.Birth_Date) {
                    const newDate = new Date(c.Birth_Date);
                    if (!existing.Birth_Date || existing.Birth_Date.getTime() !== newDate.getTime()) {
                        existing.Birth_Date = newDate;
                        changed = true;
                    }
                }

                // nếu password hiện tại không phải bcrypt hash, hash lại
                if (c.Password) {
                    if (!existing.Password || !isBcryptHash(existing.Password)) {
                        existing.Password = await ensureHashed(c.Password);
                        changed = true;
                        console.log(`Password hashed/updated for ${existing.Phone_Number}`);
                    }
                }

                if (changed) {
                    await existing.save();
                    console.log(`Updated client: ${existing.Phone_Number}`);
                } else {
                    console.log(`No changes for client: ${existing.Phone_Number}`);
                }
            }
        }

        console.log('Client seeder finished');
    } catch (err) {
        console.error('Client seeder error', err);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

seedClients();