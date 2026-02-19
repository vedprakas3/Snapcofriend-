import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Booking from '../models/Booking';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server): void => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'fallbacksecret'
      ) as { userId: string };

      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's room for private messages
    socket.join(`user:${socket.userId}`);

    // Join booking rooms
    socket.on('join-booking', async (bookingId: string) => {
      try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Verify user is part of this booking
        if (
          booking.userId.toString() !== socket.userId &&
          booking.friendId.toString() !== socket.userId
        ) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        socket.join(`booking:${bookingId}`);
        socket.emit('joined-booking', { bookingId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join booking' });
      }
    });

    // Leave booking room
    socket.on('leave-booking', (bookingId: string) => {
      socket.leave(`booking:${bookingId}`);
      socket.emit('left-booking', { bookingId });
    });

    // Handle chat messages
    socket.on('send-message', async (data: { bookingId: string; content: string; type?: string }) => {
      try {
        const { bookingId, content, type = 'text' } = data;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Verify user is part of this booking
        if (
          booking.userId.toString() !== socket.userId &&
          booking.friendId.toString() !== socket.userId
        ) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Add message to booking
        const message = {
          senderId: socket.userId,
          content,
          type,
          timestamp: new Date(),
          isRead: false
        };

        booking.messages.push(message);
        await booking.save();

        // Broadcast to booking room
        io.to(`booking:${bookingId}`).emit('new-message', {
          bookingId,
          message
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle location sharing
    socket.on('share-location', async (data: { bookingId: string; lat: number; lng: number }) => {
      try {
        const { bookingId, lat, lng } = data;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Verify user is part of this booking
        if (
          booking.userId.toString() !== socket.userId &&
          booking.friendId.toString() !== socket.userId
        ) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Broadcast location to booking room
        io.to(`booking:${bookingId}`).emit('location-update', {
          bookingId,
          userId: socket.userId,
          location: { lat, lng },
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to share location' });
      }
    });

    // Handle check-ins
    socket.on('check-in', async (data: { bookingId: string; notes?: string }) => {
      try {
        const { bookingId, notes } = data;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Add check-in
        booking.checkIns.push({
          type: 'manual',
          timestamp: new Date(),
          isEmergency: false,
          notes: notes || 'Manual check-in'
        });

        await booking.save();

        // Notify booking room
        io.to(`booking:${bookingId}`).emit('check-in', {
          bookingId,
          checkIn: booking.checkIns[booking.checkIns.length - 1]
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to check in' });
      }
    });

    // Handle SOS
    socket.on('sos', async (data: { bookingId: string; location?: { lat: number; lng: number }; notes?: string }) => {
      try {
        const { bookingId, location, notes } = data;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
          socket.emit('error', { message: 'Booking not found' });
          return;
        }

        // Add emergency check-in
        booking.checkIns.push({
          type: 'sos',
          timestamp: new Date(),
          location,
          isEmergency: true,
          notes: notes || 'SOS triggered'
        });

        await booking.save();

        // Notify all admins and safety team
        io.to('admin:safety').emit('sos-alert', {
          bookingId,
          userId: socket.userId,
          location,
          timestamp: new Date()
        });

        // Notify booking room
        io.to(`booking:${bookingId}`).emit('sos-triggered', {
          bookingId,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to trigger SOS' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data: { bookingId: string; isTyping: boolean }) => {
      socket.to(`booking:${data.bookingId}`).emit('user-typing', {
        userId: socket.userId,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
