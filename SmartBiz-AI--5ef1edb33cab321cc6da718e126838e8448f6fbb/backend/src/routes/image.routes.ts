import { Router } from 'express';
import multer from 'multer';
import { analyzeImage } from '../controllers/image.controller';

const router = Router();
import path from 'path';
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});
const upload = multer({ storage });

// POST /api/image/analyze
router.post('/analyze', upload.single('image'), analyzeImage);

export default router;
