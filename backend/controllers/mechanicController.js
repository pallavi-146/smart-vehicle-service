// When job is completed and payment is received
const updateJobStatus = async (req, res) => {
    try {
        const { status, finalCost } = req.body;
        
        if (status === 'completed') {
            // Get mechanic's commission percentage
            const mechanicRecord = await Mechanic.findOne({ userId: req.user._id });
            const commissionPercent = mechanicRecord?.commissionPercentage || 60;
            
            // Calculate actual earnings after commission
            const actualEarnings = (finalCost * commissionPercent) / 100;
            
            // Update mechanic earnings
            await Mechanic.findOneAndUpdate(
                { userId: req.user._id },
                { 
                    $inc: { 
                        earnings: actualEarnings,
                        totalEarnings: actualEarnings,
                        pendingEarnings: actualEarnings,
                        completedJobs: 1 
                    },
                    totalJobs: 1
                },
                { upsert: true }
            );
            
            // ✅ Send email to user when service is completed
            const booking = await Booking.findById(req.params.id).populate('userId');
            if (booking && booking.userId && booking.userId.email) {
                const sendEmail = require('../utils/sendEmail');
                await sendEmail(
                    booking.userId.email,
                    '✅ Service Completed - Smart Vehicle Service',
                    `Dear ${booking.userId.name},\n\nYour service has been completed successfully!\n\n📋 Booking ID: ${booking._id}\n🔧 Service: ${booking.serviceType}\n💰 Final Amount: ₹${finalCost}\n\nPlease rate your experience on the dashboard.\n\nThank you for choosing Smart Vehicle Service.\n\n- Team Smart Vehicle`
                );
            }
        }
        
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status, finalCost },
            { new: true }
        );
        
        res.json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};