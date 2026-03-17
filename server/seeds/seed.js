const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Item = require('../models/Item');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Item.deleteMany({}),
            Booking.deleteMany({}),
            Review.deleteMany({})
        ]);

        // Create users
        const users = await User.create([
            {
                name: 'Aarav Sharma',
                email: 'aarav@university.edu',
                password: 'password123',
                university: 'Delhi University',
                emailVerified: true,
                reputationScore: 4.8,
                totalRatings: 24,
                ratingCount: 5,
                bio: 'Engineering student & photography enthusiast. I have gear I love to share!',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav'
            },
            {
                name: 'Priya Patel',
                email: 'priya@university.edu',
                password: 'password123',
                university: 'Delhi University',
                emailVerified: true,
                reputationScore: 4.5,
                totalRatings: 18,
                ratingCount: 4,
                bio: 'Film student renting out my extra equipment. Quick responses always!',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
            },
            {
                name: 'Admin User',
                email: 'admin@loopify.com',
                password: 'admin123',
                university: 'Admin',
                emailVerified: true,
                role: 'admin',
                bio: 'Platform administrator',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
            },
            {
                name: 'Rahul Mehra',
                email: 'rahul@university.edu',
                password: 'password123',
                university: 'Delhi University',
                emailVerified: true,
                reputationScore: 4.2,
                totalRatings: 8.4,
                ratingCount: 2,
                bio: 'CS student with spare lab equipment and tools.',
                profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'
            }
        ]);

        console.log(`✅ Created ${users.length} users`);

        // Create items
        const items = await Item.create([
            {
                owner: users[0]._id,
                name: 'Canon EOS R5 Camera',
                category: 'cameras',
                description: 'Professional mirrorless camera with 45MP, 8K video capability. Perfect for event photography or film projects. Comes with 24-70mm f/2.8 lens, 2 batteries, and memory card.',
                photos: [
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
                    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600'
                ],
                hourlyPrice: 150,
                dailyPrice: 800,
                securityDeposit: 5000,
                pickupLocation: 'North Campus Library, Gate 2',
                condition: 'like-new',
                instantAccess: true,
                rating: 4.9,
                ratingCount: 12,
                totalBookings: 15
            },
            {
                owner: users[0]._id,
                name: 'Manfrotto Carbon Fiber Tripod',
                category: 'tripods',
                description: 'Professional carbon fiber tripod with fluid head. Extends to 180cm, supports up to 8kg. Includes carry case.',
                photos: [
                    'https://images.unsplash.com/photo-1617575521317-d2974f3b56d2?w=600'
                ],
                hourlyPrice: 50,
                dailyPrice: 250,
                securityDeposit: 1500,
                pickupLocation: 'North Campus Library, Gate 2',
                condition: 'good',
                instantAccess: false,
                rating: 4.7,
                ratingCount: 8,
                totalBookings: 10
            },
            {
                owner: users[1]._id,
                name: 'Rode NTG5 Shotgun Microphone',
                category: 'microphones',
                description: 'Broadcast-quality shotgun mic with ultra-low noise. Ideal for film, documentaries, and interviews. Comes with windshield and boom pole adapter.',
                photos: [
                    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600'
                ],
                hourlyPrice: 80,
                dailyPrice: 400,
                securityDeposit: 2000,
                pickupLocation: 'South Campus, Media Building Room 104',
                condition: 'like-new',
                instantAccess: true,
                rating: 4.6,
                ratingCount: 6,
                totalBookings: 8
            },
            {
                owner: users[1]._id,
                name: 'Aputure 300d II LED Light',
                category: 'lighting',
                description: 'Professional LED light panel, 300W daylight balanced. Bowens mount compatible. Includes barn doors and soft box.',
                photos: [
                    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600'
                ],
                hourlyPrice: 120,
                dailyPrice: 600,
                securityDeposit: 3000,
                pickupLocation: 'South Campus, Media Building Room 104',
                condition: 'good',
                instantAccess: false,
                rating: 4.4,
                ratingCount: 5,
                totalBookings: 7
            },
            {
                owner: users[3]._id,
                name: 'Arduino Mega Starter Kit',
                category: 'lab-equipment',
                description: 'Complete Arduino Mega 2560 kit with sensors, motors, breadboard, jumper wires, LCD display, and tutorial booklet. Perfect for IoT projects.',
                photos: [
                    'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600'
                ],
                hourlyPrice: 30,
                dailyPrice: 150,
                securityDeposit: 800,
                pickupLocation: 'Engineering Block, Room 312',
                condition: 'good',
                instantAccess: true,
                rating: 4.3,
                ratingCount: 4,
                totalBookings: 6
            },
            {
                owner: users[3]._id,
                name: 'Oscilloscope (Rigol DS1054Z)',
                category: 'lab-equipment',
                description: '4-channel digital oscilloscope, 50MHz bandwidth. Essential for electronics lab work. Comes with probes and power cable.',
                photos: [
                    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600'
                ],
                hourlyPrice: 100,
                dailyPrice: 500,
                securityDeposit: 4000,
                pickupLocation: 'Engineering Block, Room 312',
                condition: 'fair',
                instantAccess: false,
                rating: 4.1,
                ratingCount: 3,
                totalBookings: 4
            },
            {
                owner: users[0]._id,
                name: 'DJI Ronin-S Gimbal Stabilizer',
                category: 'cameras',
                description: 'Professional 3-axis gimbal for DSLR and mirrorless cameras. Up to 3.6kg payload. 12-hour battery life. USB-C charging.',
                photos: [
                    'https://images.unsplash.com/photo-1598387993281-cecf8b71a8f8?w=600'
                ],
                hourlyPrice: 100,
                dailyPrice: 500,
                securityDeposit: 3000,
                pickupLocation: 'North Campus Library, Gate 2',
                condition: 'like-new',
                instantAccess: true,
                rating: 4.8,
                ratingCount: 7,
                totalBookings: 9
            },
            {
                owner: users[1]._id,
                name: 'Yamaha P-45 Digital Piano',
                category: 'musical-instruments',
                description: '88-key weighted action digital piano. Includes sustain pedal, music rest, and power adapter. Perfect for practice sessions.',
                photos: [
                    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=600'
                ],
                hourlyPrice: 60,
                dailyPrice: 300,
                securityDeposit: 2000,
                pickupLocation: 'South Campus, Arts Block Room 201',
                condition: 'good',
                instantAccess: false,
                rating: 4.5,
                ratingCount: 4,
                totalBookings: 5
            }
        ]);

        console.log(`✅ Created ${items.length} items`);

        // Create sample bookings
        const bookings = await Booking.create([
            {
                item: items[0]._id,
                borrower: users[1]._id,
                owner: users[0]._id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                duration: 2,
                durationType: 'daily',
                rentalCost: 1600,
                depositAmount: 5000,
                totalAmount: 6600,
                status: 'completed',
                paymentId: 'pay_mock_seed_1'
            },
            {
                item: items[2]._id,
                borrower: users[0]._id,
                owner: users[1]._id,
                startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                duration: 1,
                durationType: 'daily',
                rentalCost: 400,
                depositAmount: 2000,
                totalAmount: 2400,
                status: 'requested'
            }
        ]);

        console.log(`✅ Created ${bookings.length} bookings`);

        // Create sample reviews
        await Review.create([
            {
                booking: bookings[0]._id,
                reviewer: users[1]._id,
                reviewee: users[0]._id,
                rating: 5,
                comment: 'Excellent camera, Aarav was super helpful with the setup. Delivered on time!',
                type: 'borrower-to-owner'
            },
            {
                booking: bookings[0]._id,
                reviewer: users[0]._id,
                reviewee: users[1]._id,
                rating: 4,
                comment: 'Priya returned the camera in great condition. Would rent again.',
                type: 'owner-to-borrower'
            }
        ]);

        console.log('✅ Created 2 reviews');
        console.log('\n🌱 Seed data created successfully!');
        console.log('\n📋 Test accounts:');
        console.log('   User 1: aarav@university.edu / password123');
        console.log('   User 2: priya@university.edu / password123');
        console.log('   User 3: rahul@university.edu / password123');
        console.log('   Admin:  admin@loopify.com / admin123\n');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seedData();
