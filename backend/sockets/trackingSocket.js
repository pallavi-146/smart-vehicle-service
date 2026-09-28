const initializeTrackingSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('🔧 Tracking socket connected:', socket.id);
        
        socket.on('startTracking', (bookingId) => {
            console.log(`📍 Started tracking for booking: ${bookingId}`);
            
            // Simulate real-time location updates
            let lat = 28.6139;
            let lng = 77.2090;
            
            const interval = setInterval(() => {
                lat += (Math.random() - 0.5) * 0.01;
                lng += (Math.random() - 0.5) * 0.01;
                
                socket.emit('locationUpdate', {
                    bookingId,
                    lat,
                    lng,
                    status: 'en-route',
                    estimatedArrival: Math.floor(Math.random() * 30) + 5
                });
            }, 5000);
            
            socket.on('stopTracking', () => {
                clearInterval(interval);
                console.log(`🛑 Stopped tracking for booking: ${bookingId}`);
            });
        });
        
        socket.on('disconnect', () => {
            console.log('🔧 Tracking socket disconnected:', socket.id);
        });
    });
};

module.exports = { initializeTrackingSocket };