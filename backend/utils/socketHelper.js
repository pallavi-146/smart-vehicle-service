const ServiceReminder = require('../models/ServiceReminder');
const Notification = require('../models/Notification');
const sendEmail = require('./sendEmail');
const sendSMS = require('./sendSMS');

// Send service reminders to users
const sendServiceReminders = async () => {
    try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(today.getMonth() + 1);
        
        // Find reminders due in next 30 days that haven't been sent
        const reminders = await ServiceReminder.find({
            dueDate: { $gte: today, $lte: nextMonth },
            isSent: false
        }).populate('userId', 'name email phone');
        
        let sentCount = 0;
        
        for (const reminder of reminders) {
            const daysLeft = Math.ceil((reminder.dueDate - today) / (1000 * 60 * 60 * 24));
            
            let message = '';
            let subject = '';
            
            if (daysLeft === 30) {
                subject = 'Vehicle Service Reminder';
                message = `🔔 Reminder: Your vehicle ${reminder.reminderType} service is due next month on ${reminder.dueDate.toLocaleDateString()}. Please book your service appointment now to avoid any issues.`;
            } else if (daysLeft === 7) {
                subject = 'Vehicle Service Due in 1 Week';
                message = `⚠️ Reminder: Your vehicle ${reminder.reminderType} service is due in 7 days on ${reminder.dueDate.toLocaleDateString()}. Schedule your service today!`;
            } else if (daysLeft === 3) {
                subject = 'URGENT: Vehicle Service Due in 3 Days';
                message = `🚨 URGENT: Only 3 days left for your vehicle ${reminder.reminderType} service on ${reminder.dueDate.toLocaleDateString()}. Please book immediately!`;
            } else if (daysLeft === 1) {
                subject = 'LAST DAY: Vehicle Service Due Tomorrow';
                message = `⚠️ LAST DAY: Your vehicle ${reminder.reminderType} service is due TOMORROW (${reminder.dueDate.toLocaleDateString()}). Please book your service today!`;
            }
            
            if (message && reminder.userId) {
                // Send Email
                if (reminder.userId.email) {
                    await sendEmail(reminder.userId.email, subject, message);
                    console.log(`📧 Reminder email sent to ${reminder.userId.email}`);
                }
                
                // Send SMS
                if (reminder.userId.phone) {
                    const smsMessage = message.substring(0, 160);
                    await sendSMS(reminder.userId.phone, smsMessage);
                    console.log(`📱 Reminder SMS sent to ${reminder.userId.phone}`);
                }
                
                // Create notification in database
                await Notification.create({
                    userId: reminder.userId._id,
                    title: subject,
                    message: message,
                    type: 'reminder',
                    relatedId: reminder._id,
                    isRead: false
                });
                
                // Mark as sent
                reminder.isSent = true;
                reminder.sentAt = new Date();
                await reminder.save();
                sentCount++;
            }
        }
        
        console.log(`✅ Sent ${sentCount} service reminders`);
        return sentCount;
    } catch (error) {
        console.error('Reminder error:', error);
        return 0;
    }
};

// Create a single notification
const createNotification = async (userId, title, message, type, relatedId = null) => {
    try {
        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            relatedId,
            isRead: false,
            createdAt: new Date()
        });
        return notification;
    } catch (error) {
        console.error('Notification creation error:', error);
        return null;
    }
};

// Create bulk notifications
const createBulkNotifications = async (userIds, title, message, type, relatedId = null) => {
    try {
        const notifications = [];
        for (const userId of userIds) {
            const notification = await Notification.create({
                userId,
                title,
                message,
                type,
                relatedId,
                isRead: false,
                createdAt: new Date()
            });
            notifications.push(notification);
        }
        return notifications;
    } catch (error) {
        console.error('Bulk notification error:', error);
        return [];
    }
};

// Send booking confirmation notifications
const sendBookingConfirmation = async (booking, user) => {
    try {
        const title = 'Booking Confirmed';
        const message = `Your ${booking.serviceType} booking has been confirmed for ${new Date(booking.preferredDate).toLocaleDateString()}. Booking ID: ${booking._id}`;
        
        // Email
        if (user.email) {
            await sendEmail(user.email, title, message);
        }
        
        // SMS
        if (user.phone) {
            await sendSMS(user.phone, message.substring(0, 160));
        }
        
        // Database notification
        await createNotification(user._id, title, message, 'booking', booking._id);
        
        return true;
    } catch (error) {
        console.error('Booking confirmation error:', error);
        return false;
    }
};

// Send SOS alert notifications
const sendSOSAlert = async (user, location, admin, bookingId = null) => {
    try {
        const title = '🚨 SOS EMERGENCY ALERT!';
        const message = `Customer ${user.name} (${user.phone}) needs immediate roadside assistance at location: ${location.lat}, ${location.lng}. Time: ${new Date().toLocaleString()}`;
        
        // SMS to admin
        if (admin?.phone) {
            await sendSMS(admin.phone, message.substring(0, 160));
        }
        
        // Email to admin
        if (admin?.email) {
            await sendEmail(admin.email, title, message);
        }
        
        // Database notification for admin
        await createNotification(admin._id, title, message, 'sos', bookingId);
        
        return true;
    } catch (error) {
        console.error('SOS alert error:', error);
        return false;
    }
};

// Send payment success notification
const sendPaymentSuccessNotification = async (user, booking, amount) => {
    try {
        const title = 'Payment Successful';
        const message = `Your payment of ₹${amount} for ${booking.serviceType} has been successfully processed. Invoice has been generated.`;
        
        // Email
        if (user.email) {
            await sendEmail(user.email, title, message);
        }
        
        // SMS
        if (user.phone) {
            await sendSMS(user.phone, message.substring(0, 160));
        }
        
        // Database notification
        await createNotification(user._id, title, message, 'payment', booking._id);
        
        return true;
    } catch (error) {
        console.error('Payment notification error:', error);
        return false;
    }
};

// Send mechanic assignment notification
const sendMechanicAssignmentNotification = async (user, mechanic, booking) => {
    try {
        const title = 'Mechanic Assigned';
        const message = `Mechanic ${mechanic.name} has been assigned for your ${booking.serviceType} service. They will contact you shortly.`;
        
        // Email to user
        if (user.email) {
            await sendEmail(user.email, title, message);
        }
        
        // SMS to user
        if (user.phone) {
            await sendSMS(user.phone, message.substring(0, 160));
        }
        
        // Database notification
        await createNotification(user._id, title, message, 'booking', booking._id);
        
        return true;
    } catch (error) {
        console.error('Mechanic assignment notification error:', error);
        return false;
    }
};

module.exports = { 
    sendServiceReminders, 
    createNotification, 
    createBulkNotifications,
    sendBookingConfirmation,
    sendSOSAlert,
    sendPaymentSuccessNotification,
    sendMechanicAssignmentNotification
};