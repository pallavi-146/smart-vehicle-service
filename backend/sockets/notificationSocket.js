const initializeNotificationSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('🔔 Notification socket connected:', socket.id);
        
        socket.on('joinUserRoom', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`📱 User ${userId} joined notification room`);
        });
        
        socket.on('joinAdminRoom', () => {
            socket.join('admin_room');
            console.log('👑 Admin joined notification room');
        });
        
        socket.on('joinMechanicRoom', (mechanicId) => {
            socket.join(`mechanic_${mechanicId}`);
            console.log(`🔧 Mechanic ${mechanicId} joined notification room`);
        });
        
        socket.on('sendNotification', (data) => {
            const { to, title, message, type } = data;
            
            if (to === 'admin') {
                io.to('admin_room').emit('newNotification', {
                    title,
                    message,
                    type,
                    timestamp: new Date()
                });
            } else if (to.startsWith('user_')) {
                io.to(to).emit('newNotification', {
                    title,
                    message,
                    type,
                    timestamp: new Date()
                });
            } else if (to.startsWith('mechanic_')) {
                io.to(to).emit('newNotification', {
                    title,
                    message,
                    type,
                    timestamp: new Date()
                });
            }
        });
        
        socket.on('disconnect', () => {
            console.log('🔔 Notification socket disconnected:', socket.id);
        });
    });
};

module.exports = { initializeNotificationSocket };