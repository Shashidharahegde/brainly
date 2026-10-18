
import jwt from 'jsonwebtoken';
import Note from '../models/Note.js';

export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required',
            });
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.userId) {
            return res.status(401).json({
                message: 'Invalid or expired token',
            });
        }

        req.user = {
            userId: decoded.userId,
        };

        if (req.path.startsWith('/uploads/')) {
            const filename = req.path.split('/').pop();
            const ownedPdf = await Note.exists({
                ownerId: req.user.userId,
                'pdf.filename': filename,
            });

            if (!ownedPdf) {
                return res.status(404).json({ message: 'File not found' });
            }
        }

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token',
        });
    }
}
